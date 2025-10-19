const { body, query } = require('express-validator');
const { successResponse, errorResponse } = require('../utils/response');
const prisma = require('../config/database');

/**
 * Generate unique order number
 */
const generateOrderNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `OLF-${timestamp}-${random}`;
};

/**
 * Get user's orders
 */
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { userId };
    if (status) {
      where.status = status.toUpperCase();
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          address: true,
          deliveryPerson: {
            select: {
              id: true,
              fullName: true,
              phone: true,
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return successResponse(res, {
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    return errorResponse(res, 'Failed to retrieve orders', 500);
  }
};

/**
 * Get order by ID
 */
const getOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await prisma.order.findFirst({
      where: {
        id: parseInt(id),
        OR: [
          { userId }, // User owns the order
          { deliveryPersonId: userId }, // User is assigned to deliver
        ],
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        address: true,
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            phone: true,
          },
        },
        deliveryPerson: {
          select: {
            id: true,
            fullName: true,
            phone: true,
          },
        },
        transaction: true,
      },
    });

    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }

    return successResponse(res, order, 'Order retrieved successfully');
  } catch (error) {
    console.error('Get order error:', error);
    return errorResponse(res, 'Failed to retrieve order', 500);
  }
};

/**
 * Create new order
 */
const createOrder = async (req, res) => {
  try {
    const { deliveryMethod = 'DELIVERY', deliveryAddressId, pickupTime, notes, paymentMethod = 'valitor' } = req.body;
    const userId = req.user.id;

    // Get user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return errorResponse(res, 'Cart is empty', 400);
    }

    // Age restriction: compute user's age
    const dob = req.user.dob ? new Date(req.user.dob) : null;
    let age = null;
    if (dob) {
      const today = new Date();
      age = today.getUTCFullYear() - dob.getUTCFullYear();
      const m = today.getUTCMonth() - dob.getUTCMonth();
      if (m < 0 || (m === 0 && today.getUTCDate() < dob.getUTCDate())) age--;
    }

    let addressId = null;
    let address = null;

    // Validate delivery method specific requirements
    if (deliveryMethod === 'DELIVERY') {
      if (!deliveryAddressId) {
        return errorResponse(res, 'Delivery address is required for delivery orders', 400);
      }
      
      // Verify address belongs to user
      address = await prisma.address.findFirst({
        where: { id: parseInt(deliveryAddressId), userId },
      });

      if (!address) {
        return errorResponse(res, 'Address not found', 404);
      }
      
      addressId = address.id;
    } else if (deliveryMethod === 'PICKUP') {
      if (!pickupTime) {
        return errorResponse(res, 'Pickup time is required for pickup orders', 400);
      }
      
      // Validate pickup time format (HH:MM)
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(pickupTime)) {
        return errorResponse(res, 'Invalid pickup time format. Use HH:MM format', 400);
      }
    } else {
      return errorResponse(res, 'Invalid delivery method. Use DELIVERY or PICKUP', 400);
    }

    // Calculate total and check stock
    let totalAmount = 0;
    const orderItems = [];

  for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        return errorResponse(res, `Insufficient stock for ${item.product.name}`, 400);
      }

    // Enforce age restrictions during checkout
    if ((item.product.category === 'WINE' || item.product.category === 'BEER' || item.product.category === 'SPIRITS') && (age === null || age < 20)) {
      return errorResponse(res, 'You must be 20+ to purchase alcohol', 403);
    }
    if (item.product.category === 'NICOTINE' && (age === null || age < 18)) {
      return errorResponse(res, 'You must be 18+ to purchase nicotine products', 403);
    }

      const itemTotal = item.product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price,
      });
    }

    // Add delivery fee (only for delivery orders, pickup is free)
    const deliveryFee = deliveryMethod === 'DELIVERY' ? 500 : 0;
    totalAmount += deliveryFee;

    // Create order
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId,
          addressId,
          deliveryMethod,
          pickupTime: deliveryMethod === 'PICKUP' ? pickupTime : null,
          status: 'PENDING',
          totalAmount,
          deliveryFee,
          notes,
        },
      });

      // Create order items
      await tx.orderItem.createMany({
        data: orderItems.map(item => ({
          ...item,
          orderId: newOrder.id,
        })),
      });

      // Update product stock
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      // Handle cash on delivery payment
      if (paymentMethod === 'cash_on_delivery') {
        // Validate cash on delivery requirements
        if (deliveryMethod !== 'DELIVERY') {
          throw new Error('Cash on delivery is only available for delivery orders');
        }
        
        if (totalAmount > 50000) {
          throw new Error('Cash on delivery is not available for orders over 50,000 ISK');
        }

        // Create transaction record for cash on delivery
        await tx.transaction.create({
          data: {
            orderId: newOrder.id,
            amount: totalAmount,
            paymentStatus: 'PENDING', // Will be marked as COMPLETED when delivered
            paymentMethod: 'Cash on Delivery',
            paymentDetails: JSON.stringify({
              type: 'cash_on_delivery',
              requiresDelivery: true,
              maxAmount: 50000,
              status: 'pending_payment'
            }),
          },
        });

        // Update order status to confirmed for cash on delivery
        await tx.order.update({
          where: { id: newOrder.id },
          data: { status: 'CONFIRMED' },
        });
      }

      // Handle pay on pickup payment
      if (paymentMethod === 'pay_on_pickup') {
        // Validate pay on pickup requirements
        if (deliveryMethod !== 'PICKUP') {
          throw new Error('Pay on pickup is only available for pickup orders');
        }
        
        if (totalAmount > 50000) {
          throw new Error('Pay on pickup is not available for orders over 50,000 ISK');
        }

        // Create transaction record for pay on pickup
        await tx.transaction.create({
          data: {
            orderId: newOrder.id,
            amount: totalAmount,
            paymentStatus: 'PENDING', // Will be marked as COMPLETED when picked up
            paymentMethod: 'Pay on Pickup',
            paymentDetails: JSON.stringify({
              type: 'pay_on_pickup',
              requiresPickup: true,
              maxAmount: 50000,
              status: 'pending_payment'
            }),
          },
        });

        // Update order status to confirmed for pay on pickup
        await tx.order.update({
          where: { id: newOrder.id },
          data: { status: 'CONFIRMED' },
        });
      }

      return newOrder;
    });

    return successResponse(res, order, 'Order created successfully', 201);
  } catch (error) {
    console.error('Create order error:', error);
    return errorResponse(res, 'Failed to create order', 500);
  }
};

/**
 * Update order status (Admin/Delivery only)
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, estimatedDelivery } = req.body;
    const userId = req.user.id;

    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
    });

    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }

    // Check permissions
    const isAdmin = req.user.role === 'ADMIN';
    const isDeliveryPerson = req.user.role === 'DELIVERY' && order.deliveryPersonId === userId;

    if (!isAdmin && !isDeliveryPerson) {
      return errorResponse(res, 'Insufficient permissions', 403);
    }

    // Validate status transitions
    const validTransitions = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['PREPARING', 'CANCELLED'],
      PREPARING: ['OUT_FOR_DELIVERY', 'CANCELLED'],
      OUT_FOR_DELIVERY: ['DELIVERED'],
      DELIVERED: [],
      CANCELLED: [],
    };

    if (!validTransitions[order.status].includes(status)) {
      return errorResponse(res, 'Invalid status transition', 400);
    }

    // Update order
    const updateData = { status };
    
    if (status === 'DELIVERED') {
      updateData.deliveredAt = new Date();
      
      // Mark cash on delivery payments as completed
      const transaction = await prisma.transaction.findUnique({
        where: { orderId: parseInt(id) },
      });
      
      if (transaction && transaction.paymentMethod === 'Cash on Delivery' && transaction.paymentStatus === 'PENDING') {
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: { 
            paymentStatus: 'COMPLETED',
            paymentDetails: JSON.stringify({
              ...JSON.parse(transaction.paymentDetails || '{}'),
              status: 'completed',
              completedAt: new Date().toISOString()
            })
          },
        });
      }
    }

    // Handle pickup completion for pay on pickup
    if (status === 'PICKED_UP' || (status === 'DELIVERED' && order.deliveryMethod === 'PICKUP')) {
      updateData.deliveredAt = new Date();
      
      // Mark pay on pickup payments as completed
      const transaction = await prisma.transaction.findUnique({
        where: { orderId: parseInt(id) },
      });
      
      if (transaction && transaction.paymentMethod === 'Pay on Pickup' && transaction.paymentStatus === 'PENDING') {
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: { 
            paymentStatus: 'COMPLETED',
            paymentDetails: JSON.stringify({
              ...JSON.parse(transaction.paymentDetails || '{}'),
              status: 'completed',
              completedAt: new Date().toISOString()
            })
          },
        });
      }
    }

    if (estimatedDelivery) {
      updateData.estimatedDelivery = new Date(estimatedDelivery);
    }

    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        address: true,
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            phone: true,
          },
        },
      },
    });

    return successResponse(res, updatedOrder, 'Order status updated successfully');
  } catch (error) {
    console.error('Update order status error:', error);
    return errorResponse(res, 'Failed to update order status', 500);
  }
};

/**
 * Assign delivery person to order (Admin only)
 */
const assignDeliveryPerson = async (req, res) => {
  try {
    const { id } = req.params;
    const { deliveryPersonId } = req.body;

    // Verify delivery person exists and has correct role
    const deliveryPerson = await prisma.user.findUnique({
      where: { id: parseInt(deliveryPersonId) },
    });

    if (!deliveryPerson || deliveryPerson.role !== 'DELIVERY') {
      return errorResponse(res, 'Invalid delivery person', 400);
    }

    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { deliveryPersonId: parseInt(deliveryPersonId) },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        address: true,
        deliveryPerson: {
          select: {
            id: true,
            fullName: true,
            phone: true,
          },
        },
      },
    });

    return successResponse(res, order, 'Delivery person assigned successfully');
  } catch (error) {
    console.error('Assign delivery person error:', error);
    return errorResponse(res, 'Failed to assign delivery person', 500);
  }
};

/**
 * Get all orders (Admin only)
 */
const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status) {
      where.status = status.toUpperCase();
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          address: true,
          user: {
            select: {
              id: true,
              username: true,
              fullName: true,
              phone: true,
            },
          },
          deliveryPerson: {
            select: {
              id: true,
              fullName: true,
              phone: true,
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return successResponse(res, {
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    return errorResponse(res, 'Failed to retrieve orders', 500);
  }
};

// Validation rules
const createOrderValidation = [
  body('deliveryMethod').isIn(['DELIVERY', 'PICKUP']).withMessage('Delivery method must be DELIVERY or PICKUP'),
  body('deliveryAddressId').optional().isInt({ min: 1 }).withMessage('Valid address ID is required for delivery orders'),
  body('pickupTime').optional().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Pickup time must be in HH:MM format'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters'),
];

const updateOrderStatusValidation = [
  body('status').isIn(['PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']).withMessage('Invalid status'),
  body('estimatedDelivery').optional().isISO8601().withMessage('Invalid date format'),
];

const assignDeliveryPersonValidation = [
  body('deliveryPersonId').isInt({ min: 1 }).withMessage('Valid delivery person ID is required'),
];

module.exports = {
  getUserOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  assignDeliveryPerson,
  getAllOrders,
  createOrderValidation,
  updateOrderStatusValidation,
  assignDeliveryPersonValidation,
};

