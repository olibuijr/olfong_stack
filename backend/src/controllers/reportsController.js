const { successResponse, errorResponse } = require('../utils/response');
const prisma = require('../config/database');

/**
 * Get sales report (Admin only)
 */
const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Get sales data
    const salesData = await prisma.order.findMany({
      where: {
        status: { not: 'CANCELLED' },
        createdAt: {
          gte: start,
          lte: end
        }
      },
      include: {
        items: {
          include: {
            product: {
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
            }
          }
        },
        user: {
          select: {
            fullName: true,
            username: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate summary statistics
    const totalRevenue = salesData.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = salesData.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Group by status
    const statusCounts = salesData.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    // Group by delivery method
    const deliveryMethodCounts = salesData.reduce((acc, order) => {
      acc[order.deliveryMethod] = (acc[order.deliveryMethod] || 0) + 1;
      return acc;
    }, {});

    // Top products
    const productSales = {};
    salesData.forEach(order => {
      order.items.forEach(item => {
        const productName = item.product.name;
        if (!productSales[productName]) {
          productSales[productName] = {
            name: productName,
            nameIs: item.product.nameIs,
            category: item.product.category.name,
            categoryIs: item.product.category.nameIs,
            quantity: 0,
            revenue: 0
          };
        }
        productSales[productName].quantity += item.quantity;
        productSales[productName].revenue += item.price * item.quantity;
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    const report = {
      period: {
        start: start,
        end: end
      },
      summary: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        statusCounts,
        deliveryMethodCounts
      },
      topProducts,
      orders: salesData.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customer: order.user.fullName || order.user.username,
        email: order.user.email,
        status: order.status,
        deliveryMethod: order.deliveryMethod,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        items: order.items.map(item => ({
          product: item.product.name,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity
        }))
      }))
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

    // Get customer data
    const customers = await prisma.user.findMany({
      where: {
        role: 'CUSTOMER',
        createdAt: {
          gte: start,
          lte: end
        }
      },
      include: {
        orders: {
          where: {
            status: { not: 'CANCELLED' }
          },
          select: {
            id: true,
            totalAmount: true,
            status: true,
            createdAt: true
          }
        },
        addresses: {
          select: {
            street: true,
            city: true,
            postalCode: true,
            country: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate customer statistics
    const customerStats = customers.map(customer => {
      const totalOrders = customer.orders.length;
      const totalSpent = customer.orders.reduce((sum, order) => sum + order.totalAmount, 0);
      const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
      const lastOrder = customer.orders.length > 0 
        ? customer.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
        : null;

      return {
        id: customer.id,
        name: customer.fullName || customer.username,
        email: customer.email,
        phone: customer.phone,
        joinDate: customer.createdAt,
        totalOrders,
        totalSpent,
        averageOrderValue,
        lastOrder: lastOrder ? lastOrder.createdAt : null,
        address: customer.addresses.length > 0 
          ? `${customer.addresses[0].street}, ${customer.addresses[0].postalCode} ${customer.addresses[0].city}`
          : 'No address'
      };
    });

    // Summary statistics
    const totalCustomers = customers.length;
    const totalRevenue = customerStats.reduce((sum, customer) => sum + customer.totalSpent, 0);
    const averageCustomerValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

    const report = {
      period: {
        start: start,
        end: end
      },
      summary: {
        totalCustomers,
        totalRevenue,
        averageCustomerValue
      },
      customers: customerStats.sort((a, b) => b.totalSpent - a.totalSpent)
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
    const totalStockValue = products.reduce((sum, product) => sum + (product.price * product.stock), 0);
    const totalRevenue = productSales.reduce((sum, product) => sum + product.totalRevenue, 0);

    const report = {
      summary: {
        totalProducts,
        totalStockValue,
        totalRevenue
      },
      products: productSales
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