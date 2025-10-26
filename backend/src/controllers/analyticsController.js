const { successResponse, errorResponse } = require('../utils/response');
const prisma = require('../config/database');
const { calculateOrderItemsVat } = require('../utils/vatUtils');

/**
 * Get analytics data (Admin only)
 */
const getAnalytics = async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    // Calculate date ranges
    const now = new Date();
    let startDate, previousStartDate, previousEndDate;
    
    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        previousEndDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        previousEndDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        previousEndDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000);
        previousEndDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        previousEndDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get current period data
    const [
      currentRevenue,
      currentOrders,
      currentCustomers,
      currentProducts,
      orderStatusCounts,
      topProducts
    ] = await Promise.all([
      // Current revenue
      prisma.order.aggregate({
        where: {
          status: { not: 'CANCELLED' },
          createdAt: { gte: startDate }
        },
        _sum: { totalAmount: true }
      }),

      // Current orders count
      prisma.order.count({
        where: {
          createdAt: { gte: startDate }
        }
      }),

      // Current customers count
      prisma.user.count({
        where: {
          role: 'CUSTOMER',
          createdAt: { gte: startDate }
        }
      }),

      // Current products count
      prisma.product.count({
        where: {
          isActive: true,
          createdAt: { gte: startDate }
        }
      }),

      // Order status distribution
      prisma.order.groupBy({
        by: ['status'],
        _count: { status: true },
        where: {
          createdAt: { gte: startDate }
        }
      }),

      // Top products by revenue
      prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { 
          quantity: true,
          price: true
        },
        where: {
          order: {
            status: { not: 'CANCELLED' },
            createdAt: { gte: startDate }
          }
        },
        orderBy: {
          _sum: {
            price: 'desc'
          }
        },
        take: 10
      })
    ]);

    // Get previous period data for comparison
    const [
      previousRevenue,
      previousOrders,
      previousCustomers,
      previousProducts
    ] = await Promise.all([
      prisma.order.aggregate({
        where: {
          status: { not: 'CANCELLED' },
          createdAt: { gte: previousStartDate, lte: previousEndDate }
        },
        _sum: { totalAmount: true }
      }),
      prisma.order.count({
        where: {
          createdAt: { gte: previousStartDate, lte: previousEndDate }
        }
      }),
      prisma.user.count({
        where: {
          role: 'CUSTOMER',
          createdAt: { gte: previousStartDate, lte: previousEndDate }
        }
      }),
      prisma.product.count({
        where: {
          isActive: true,
          createdAt: { gte: previousStartDate, lte: previousEndDate }
        }
      })
    ]);

    // Calculate growth percentages
    const calculateGrowth = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const revenue = currentRevenue._sum.totalAmount || 0;
    const previousRevenueValue = previousRevenue._sum.totalAmount || 0;
    const orders = currentOrders;
    const previousOrdersValue = previousOrders;
    const customers = currentCustomers;
    const previousCustomersValue = previousCustomers;
    const products = currentProducts;
    const previousProductsValue = previousProducts;

    // Get product details for top products
    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: {
            name: true,
            nameIs: true,
            category: {
              select: {
                name: true,
                nameIs: true
              }
            }
          }
        });

        // Get previous period sales for growth calculation
        const previousProductSales = await prisma.orderItem.aggregate({
          where: {
            productId: item.productId,
            order: {
              status: { not: 'CANCELLED' },
              createdAt: { gte: previousStartDate, lte: previousEndDate }
            }
          },
          _sum: {
            quantity: true,
            price: true
          }
        });

        const currentRevenue = item._sum.price || 0;
        const previousRevenue = previousProductSales._sum.price || 0;
        const growth = calculateGrowth(currentRevenue, previousRevenue);

        return {
          productId: item.productId,
          product: product ? {
            name: product.name,
            nameIs: product.nameIs,
            category: product.category ? {
              name: product.category.name,
              nameIs: product.category.nameIs
            } : null
          } : null,
          _sum: {
            quantity: item._sum.quantity || 0,
            price: currentRevenue
          },
          growth: growth
        };
      })
    );

    // Calculate order status percentages
    const totalOrdersForStatus = orderStatusCounts.reduce((sum, item) => sum + item._count.status, 0);
    const orderStatusDistribution = orderStatusCounts.map(item => ({
      status: item.status,
      count: item._count.status,
      percentage: totalOrdersForStatus > 0 ? (item._count.status / totalOrdersForStatus) * 100 : 0
    }));

    // Calculate VAT data for current period
    const currentOrdersWithItems = await prisma.order.findMany({
      where: {
        status: { not: 'CANCELLED' },
        createdAt: { gte: startDate }
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: {
                  include: { vatProfile: true }
                }
              }
            }
          }
        }
      }
    });

    // Calculate total VAT for current period and group by profile
    let totalCurrentVat = 0;
    let totalCurrentBeforeVat = 0;
    const vatProfileTotals = {}; // Map of profileId to {profileData, total, beforeVat}

    currentOrdersWithItems.forEach(order => {
      const vatBreakdown = calculateOrderItemsVat(order.items);
      totalCurrentVat += vatBreakdown.totalVat;
      totalCurrentBeforeVat += vatBreakdown.totalBeforeVat;

      // Group VAT amounts by profile
      if (vatBreakdown.itemBreakdowns) {
        vatBreakdown.itemBreakdowns.forEach(itemBreakdown => {
          const profileId = itemBreakdown.profileId;
          if (!vatProfileTotals[profileId]) {
            vatProfileTotals[profileId] = {
              profile: itemBreakdown.profile,
              total: 0,
              beforeVat: 0
            };
          }
          vatProfileTotals[profileId].total += itemBreakdown.vat;
          vatProfileTotals[profileId].beforeVat += itemBreakdown.priceBeforeVat;
        });
      }
    });

    // Convert to array and calculate percentages, filter out null profiles
    const vatProfiles = Object.values(vatProfileTotals)
      .filter(profile => profile.profile !== null) // Only include profiles with data
      .map(profile => ({
        ...profile,
        total: Math.round(profile.total * 100) / 100,
        beforeVat: Math.round(profile.beforeVat * 100) / 100,
        percentage: totalCurrentVat > 0 ? (profile.total / totalCurrentVat) * 100 : 0
      }))
      .sort((a, b) => b.total - a.total);

    // Calculate VAT data for previous period
    const previousOrdersWithItems = await prisma.order.findMany({
      where: {
        status: { not: 'CANCELLED' },
        createdAt: { gte: previousStartDate, lte: previousEndDate }
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: {
                  include: { vatProfile: true }
                }
              }
            }
          }
        }
      }
    });

    let totalPreviousVat = 0;
    previousOrdersWithItems.forEach(order => {
      const vatBreakdown = calculateOrderItemsVat(order.items);
      totalPreviousVat += vatBreakdown.totalVat;
    });

    const analytics = {
      metrics: {
        revenue: {
          current: revenue,
          previous: previousRevenueValue,
          growth: calculateGrowth(revenue, previousRevenueValue)
        },
        orders: {
          current: orders,
          previous: previousOrdersValue,
          growth: calculateGrowth(orders, previousOrdersValue)
        },
        customers: {
          current: customers,
          previous: previousCustomersValue,
          growth: calculateGrowth(customers, previousCustomersValue)
        },
        products: {
          current: products,
          previous: previousProductsValue,
          growth: calculateGrowth(products, previousProductsValue)
        },
        vat: {
          total: Math.round(totalCurrentVat * 100) / 100,
          previousTotal: Math.round(totalPreviousVat * 100) / 100,
          beforeVat: Math.round(totalCurrentBeforeVat * 100) / 100,
          profiles: vatProfiles,
          growth: calculateGrowth(totalCurrentVat, totalPreviousVat)
        }
      },
      orderStatusDistribution,
      topProducts: topProductsWithDetails,
      timeRange,
      period: {
        current: {
          start: startDate,
          end: now
        },
        previous: {
          start: previousStartDate,
          end: previousEndDate
        }
      }
    };

    return successResponse(res, analytics);
  } catch (error) {
    console.error('Get analytics error:', error);
    return errorResponse(res, 'Failed to retrieve analytics data', 500);
  }
};

/**
 * Get revenue trend data (Admin only)
 */
const getRevenueTrend = async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    const now = new Date();
    let startDate;
    
    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get daily revenue data
    const dailyRevenue = await prisma.$queryRaw`
      SELECT 
        DATE("createdAt") as date,
        SUM("totalAmount") as revenue
      FROM "Order"
      WHERE "createdAt" >= ${startDate}
        AND status != 'CANCELLED'
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `;

    return successResponse(res, { dailyRevenue });
  } catch (error) {
    console.error('Get revenue trend error:', error);
    return errorResponse(res, 'Failed to retrieve revenue trend data', 500);
  }
};

module.exports = {
  getAnalytics,
  getRevenueTrend,
};