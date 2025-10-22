const { successResponse, errorResponse } = require('../utils/response');
const prisma = require('../config/database');

/**
 * Get all customers (Admin only)
 */
const getCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {
      role: 'CUSTOMER',
    };

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get customers with their order statistics
    const customers = await prisma.user.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
        addresses: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: {
            street: true,
            city: true,
            postalCode: true,
            country: true,
          },
        },
        orders: {
          select: {
            id: true,
            totalAmount: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    // Process customers to add calculated fields
    const processedCustomers = customers.map(customer => {
      const totalOrders = customer.orders.length;
      const totalSpent = customer.orders.reduce((sum, order) => sum + order.totalAmount, 0);
      const lastOrder = customer.orders.length > 0 
        ? customer.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
        : null;

      // Determine customer status based on activity
      let customerStatus = 'new';
      if (totalOrders > 10) {
        customerStatus = 'vip';
      } else if (totalOrders > 0) {
        customerStatus = 'active';
      }

      // Check if customer is inactive (no orders in last 3 months)
      if (lastOrder) {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        if (new Date(lastOrder.createdAt) < threeMonthsAgo) {
          customerStatus = 'inactive';
        }
      }

      // Format address
      const address = customer.addresses.length > 0 
        ? `${customer.addresses[0].street}, ${customer.addresses[0].postalCode} ${customer.addresses[0].city}`
        : 'No address on file';

      return {
        id: customer.id,
        name: customer.fullName || customer.username,
        email: customer.email || 'No email',
        phone: customer.phone || 'No phone',
        address,
        totalOrders,
        totalSpent,
        lastOrder: lastOrder ? lastOrder.createdAt : null,
        status: customerStatus,
        joinDate: customer.createdAt,
      };
    });

    // Apply status filter if provided
    let filteredCustomers = processedCustomers;
    if (status) {
      filteredCustomers = processedCustomers.filter(customer => customer.status === status);
    }

    return successResponse(res, {
      customers: filteredCustomers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredCustomers.length,
        pages: Math.ceil(filteredCustomers.length / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get customers error:', error);
    return errorResponse(res, 'Failed to retrieve customers', 500);
  }
};

/**
 * Get customer details by ID (Admin only)
 */
const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await prisma.user.findFirst({
      where: {
        id: parseInt(id),
        role: 'CUSTOMER',
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
        addresses: {
          select: {
            street: true,
            city: true,
            postalCode: true,
            country: true,
            isDefault: true,
          },
        },
        orders: {
          select: {
            id: true,
            totalAmount: true,
            status: true,
            createdAt: true,
            items: {
              select: {
                quantity: true,
                product: {
                  select: {
                    name: true,
                    nameIs: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!customer) {
      return errorResponse(res, 'Customer not found', 404);
    }

    // Process customer data
    const totalOrders = customer.orders.length;
    const totalSpent = customer.orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const lastOrder = customer.orders.length > 0 ? customer.orders[0] : null;

    // Determine customer status
    let customerStatus = 'new';
    if (totalOrders > 10) {
      customerStatus = 'vip';
    } else if (totalOrders > 0) {
      customerStatus = 'active';
    }

    if (lastOrder) {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      if (new Date(lastOrder.createdAt) < threeMonthsAgo) {
        customerStatus = 'inactive';
      }
    }

    const processedCustomer = {
      id: customer.id,
      name: customer.fullName || customer.username,
      email: customer.email || 'No email',
      phone: customer.phone || 'No phone',
      addresses: customer.addresses,
      totalOrders,
      totalSpent,
      lastOrder: lastOrder ? lastOrder.createdAt : null,
      status: customerStatus,
      joinDate: customer.createdAt,
      orders: customer.orders,
    };

    return successResponse(res, { customer: processedCustomer });
  } catch (error) {
    console.error('Get customer by ID error:', error);
    return errorResponse(res, 'Failed to retrieve customer', 500);
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
};