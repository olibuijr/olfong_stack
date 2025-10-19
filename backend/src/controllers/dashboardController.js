const { successResponse, errorResponse } = require('../utils/response');
const prisma = require('../config/database');

/**
 * Get dashboard statistics (Admin only)
 */
const getDashboardStats = async (req, res) => {
  try {
    // Get date ranges for comparison
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get current month stats
    const [
      totalRevenue,
      totalOrders,
      totalProducts,
      totalCustomers,
      recentOrders,
      orderStatusCounts,
      topProducts
    ] = await Promise.all([
      // Total revenue (current month)
      prisma.order.aggregate({
        where: {
          status: { not: 'CANCELLED' },
          createdAt: { gte: startOfMonth }
        },
        _sum: { totalAmount: true }
      }),

      // Total orders (current month)
      prisma.order.count({
        where: {
          createdAt: { gte: startOfMonth }
        }
      }),

      // Total products
      prisma.product.count({
        where: { isActive: true }
      }),

      // Total customers
      prisma.user.count({
        where: { role: 'CUSTOMER' }
      }),

      // Recent orders (last 10)
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              fullName: true,
              username: true
            }
          }
        }
      }),

      // Order status counts
      prisma.order.groupBy({
        by: ['status'],
        _count: { status: true },
        where: {
          createdAt: { gte: startOfMonth }
        }
      }),

      // Top products by revenue (current month)
      prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { 
          price: true,
          quantity: true
        },
        where: {
          order: {
            status: { not: 'CANCELLED' },
            createdAt: { gte: startOfMonth }
          }
        },
        orderBy: {
          _sum: {
            price: 'desc'
          }
        },
        take: 5
      })
    ]);

    // Get last month stats for comparison
    const [
      lastMonthRevenue,
      lastMonthOrders
    ] = await Promise.all([
      prisma.order.aggregate({
        where: {
          status: { not: 'CANCELLED' },
          createdAt: { 
            gte: startOfLastMonth,
            lte: endOfLastMonth
          }
        },
        _sum: { totalAmount: true }
      }),
      prisma.order.count({
        where: {
          createdAt: { 
            gte: startOfLastMonth,
            lte: endOfLastMonth
          }
        }
      })
    ]);

    // Calculate growth percentages
    const currentRevenue = totalRevenue._sum.totalAmount || 0;
    const lastMonthRevenueAmount = lastMonthRevenue._sum.totalAmount || 0;
    const revenueGrowth = lastMonthRevenueAmount > 0 
      ? ((currentRevenue - lastMonthRevenueAmount) / lastMonthRevenueAmount) * 100 
      : 0;

    const orderGrowth = lastMonthOrders > 0 
      ? ((totalOrders - lastMonthOrders) / lastMonthOrders) * 100 
      : 0;

    // Get product details for top products
    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: {
            id: true,
            name: true,
            nameIs: true,
            price: true
          }
        });
        
        return {
          id: product.id,
          name: product.nameIs || product.name,
          price: product.price,
          sales: item._sum.quantity || 0,
          revenue: item._sum.price || 0
        };
      })
    );

    // Format order status counts
    const statusCounts = {};
    orderStatusCounts.forEach(item => {
      statusCounts[item.status.toLowerCase()] = item._count.status;
    });

    // Format recent orders
    const formattedRecentOrders = recentOrders.map(order => ({
      id: order.id,
      customer: order.user.fullName || order.user.username,
      amount: order.totalAmount,
      status: order.status.toLowerCase(),
      date: order.createdAt.toISOString().split('T')[0]
    }));

    const stats = {
      totalRevenue: currentRevenue,
      totalOrders,
      totalProducts,
      totalCustomers,
      revenueGrowth: Math.round(revenueGrowth * 10) / 10,
      orderGrowth: Math.round(orderGrowth * 10) / 10,
      productGrowth: 0, // Not calculated for now
      customerGrowth: 0 // Not calculated for now
    };

    return successResponse(res, {
      stats,
      recentOrders: formattedRecentOrders,
      orderStatusCounts: statusCounts,
      topProducts: topProductsWithDetails
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return errorResponse(res, 'Failed to retrieve dashboard statistics', 500);
  }
};

module.exports = {
  getDashboardStats,
};
