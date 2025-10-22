const { successResponse, errorResponse } = require('../utils/response');
const prisma = require('../config/database');

/**
 * Get sales report (Admin only)
 */
const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, timeRange = 'last30days' } = req.query;

    let start, end;
    const now = new Date();

    // Calculate date range based on timeRange
    switch (timeRange) {
      case 'last7days':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        end = now;
        break;
      case 'last30days':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        end = now;
        break;
      case 'last90days':
        start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        end = now;
        break;
      case 'lastyear':
        start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        end = now;
        break;
      default:
        start = startDate ? new Date(startDate) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        end = endDate ? new Date(endDate) : now;
    }

    // Get sales data
    const salesData = await prisma.order.findMany({
      where: {
        status: { not: 'CANCELLED' },
        createdAt: {
          gte: start,
          lte: end
        }
      },
      select: {
        id: true,
        totalAmount: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate summary statistics
    const totalRevenue = salesData.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = salesData.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate growth rate (compare with previous period)
    const previousPeriodStart = new Date(start.getTime() - (end.getTime() - start.getTime()));
    const previousPeriodEnd = start;

    const previousSalesData = await prisma.order.findMany({
      where: {
        status: { not: 'CANCELLED' },
        createdAt: {
          gte: previousPeriodStart,
          lte: previousPeriodEnd
        }
      },
      select: {
        totalAmount: true
      }
    });

    const previousRevenue = previousSalesData.reduce((sum, order) => sum + order.totalAmount, 0);
    const growthRate = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    // Generate daily sales data
    const dailySales = [];
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    for (let i = 0; i <= daysDiff; i++) {
      const date = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

      const dayRevenue = salesData
        .filter(order => order.createdAt >= dayStart && order.createdAt < dayEnd)
        .reduce((sum, order) => sum + order.totalAmount, 0);

      dailySales.push({
        date: dayStart.toISOString().split('T')[0],
        revenue: dayRevenue
      });
    }

    const report = {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      growthRate,
      dailySales
    };

    return successResponse(res, report);
  } catch (error) {
    console.error('Get sales report error:', error);
    return errorResponse(res, 'Failed to retrieve sales report', 500);
  }
};

/**
 * Get customer report (Admin only)
 */
const getCustomerReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Get all customers
    const allCustomers = await prisma.user.count({
      where: { role: 'CUSTOMER' }
    });

    // Get new customers in period
    const newCustomers = await prisma.user.count({
      where: {
        role: 'CUSTOMER',
        createdAt: {
          gte: start,
          lte: end
        }
      }
    });

    // Get customer data with orders
    const customers = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      include: {
        orders: {
          where: {
            status: { not: 'CANCELLED' },
            createdAt: {
              gte: start,
              lte: end
            }
          },
          select: {
            id: true,
            totalAmount: true,
            status: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate customer statistics
    const customerStats = customers.map(customer => {
      const totalOrders = customer.orders.length;
      const totalSpent = customer.orders.reduce((sum, order) => sum + order.totalAmount, 0);
      const lastOrder = customer.orders.length > 0
        ? customer.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
        : null;

      return {
        id: customer.id,
        name: customer.fullName || customer.username,
        email: customer.email,
        orders: totalOrders,
        totalSpent,
        lastOrder: lastOrder ? lastOrder.createdAt : null
      };
    });

    // Calculate average order frequency
    const totalOrders = customerStats.reduce((sum, customer) => sum + customer.orders, 0);
    const averageOrderFrequency = allCustomers > 0 ? totalOrders / allCustomers : 0;

    // Create customer segments
    const segments = [
      { segment: 'High Value', minSpent: 50000, count: 0, percentage: 0 },
      { segment: 'Medium Value', minSpent: 20000, count: 0, percentage: 0 },
      { segment: 'Low Value', minSpent: 0, count: 0, percentage: 0 }
    ];

    customerStats.forEach(customer => {
      if (customer.totalSpent >= 50000) segments[0].count++;
      else if (customer.totalSpent >= 20000) segments[1].count++;
      else segments[2].count++;
    });

    segments.forEach(segment => {
      segment.percentage = allCustomers > 0 ? (segment.count / allCustomers) * 100 : 0;
    });

    // Top customers
    const topCustomers = customerStats
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    const report = {
      totalCustomers: allCustomers,
      newCustomers,
      returningCustomers: allCustomers - newCustomers,
      averageOrderFrequency: averageOrderFrequency.toFixed(1),
      customerSegments: segments,
      topCustomers
    };

    return successResponse(res, report);
  } catch (error) {
    console.error('Get customer report error:', error);
    return errorResponse(res, 'Failed to retrieve customer report', 500);
  }
};

/**
 * Get inventory report (Admin only)
 */
const getInventoryReport = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: {
          select: {
            name: true,
            nameIs: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Get sales data for each product
    const productSales = await Promise.all(
      products.map(async (product) => {
        const salesData = await prisma.orderItem.aggregate({
          where: {
            productId: product.id,
            order: {
              status: { not: 'CANCELLED' }
            }
          },
          _sum: {
            quantity: true,
            price: true
          }
        });

        const totalSold = salesData._sum.quantity || 0;
        const totalRevenue = salesData._sum.price || 0;

        return {
          id: product.id,
          name: product.name,
          nameIs: product.nameIs,
          category: product.category.name,
          categoryIs: product.category.nameIs,
          price: product.price,
          stock: product.stock,
          totalSold,
          totalRevenue,
          averagePrice: totalSold > 0 ? totalRevenue / totalSold : product.price
        };
      })
    );

    // Sort by total revenue
    productSales.sort((a, b) => b.totalRevenue - a.totalRevenue);

    // Summary statistics
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.stock > 0).length;
    const outOfStock = products.filter(p => p.stock === 0).length;

    // Top selling products (format for frontend)
    const topSelling = productSales.slice(0, 10).map(product => ({
      name: product.name,
      sales: product.totalSold,
      revenue: product.totalRevenue,
      growth: 0 // Would need previous period data to calculate
    }));

    // Category breakdown
    const categoryMap = {};
    productSales.forEach(product => {
      const category = product.category;
      if (!categoryMap[category]) {
        categoryMap[category] = {
          category,
          count: 0,
          revenue: 0
        };
      }
      categoryMap[category].count += 1;
      categoryMap[category].revenue += product.totalRevenue;
    });

    const categoryBreakdown = Object.values(categoryMap);

    const report = {
      totalProducts,
      activeProducts,
      outOfStock,
      topSelling,
      categoryBreakdown
    };

    return successResponse(res, report);
  } catch (error) {
    console.error('Get inventory report error:', error);
    return errorResponse(res, 'Failed to retrieve inventory report', 500);
  }
};

module.exports = {
  getSalesReport,
  getCustomerReport,
  getInventoryReport,
};