const { successResponse, errorResponse } = require('../utils/response');
const prisma = require('../config/database');

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
          id: item.productId,
          name: product?.name || 'Unknown Product',
          nameIs: product?.nameIs || 'Óþekkt vara',
          category: product?.category?.name || 'Unknown',
          categoryIs: product?.category?.nameIs || 'Óþekkt flokkur',
          sales: item._sum.quantity || 0,
          revenue: currentRevenue,
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