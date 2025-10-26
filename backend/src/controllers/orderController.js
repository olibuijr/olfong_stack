const { body } = require('express-validator');
const { successResponse, errorResponse } = require('../utils/response');
const prisma = require('../config/database');
const vatService = require('../services/vatService');

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
          shippingOption: true,
          transaction: true,
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
        shippingOption: true,
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
      const { shippingOptionId, deliveryAddressId, pickupTime, notes, paymentMethod = 'valitor' } = req.body;
      const userId = req.user.id;

      if (!shippingOptionId) {
        return errorResponse(res, 'Shipping option is required', 400);
      }

      // Get shipping option
      const shippingOption = await prisma.shippingOption.findUnique({
        where: { id: parseInt(shippingOptionId) },
      });

      if (!shippingOption) {
        return errorResponse(res, 'Shipping option not found', 404);
      }

      if (!shippingOption.isActive) {
        return errorResponse(res, 'Selected shipping option is not available', 400);
      }

    // Get user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true
              }
            },
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

    // Validate shipping option specific requirements
    if (shippingOption.type === 'delivery') {
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
    } else if (shippingOption.type === 'pickup') {
      if (!pickupTime) {
        return errorResponse(res, 'Pickup time is required for pickup orders', 400);
      }

      // Validate pickup time format (HH:MM)
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(pickupTime)) {
        return errorResponse(res, 'Invalid pickup time format. Use HH:MM format', 400);
      }
    }

    // Get VAT settings
    const vatSettings = await vatService.getVATSettings();

    // Calculate total and check stock
    let itemsSubtotal = 0;
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

      itemsSubtotal += item.product.price * item.quantity;

      // Get category VAT rate if available
      const categoryVatRate = item.product.category?.vatRate;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price,
        categoryVatRate
      });
    }

    // Get shipping cost
    const shippingCost = shippingOption.fee;

    // Calculate VAT and totals
    const {
      taxAmount,
      totalAmount
    } = vatService.calculateOrderTotals(
      orderItems,
      shippingCost,
      vatSettings.rate
    );

    // Create order
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId,
          addressId,
          shippingOptionId: shippingOption.id,
          pickupTime: shippingOption.type === 'pickup' ? pickupTime : null,
          status: 'PENDING',
          subtotalBeforeVat: itemsSubtotal,
          taxAmount,
          vatRate: vatSettings.rate,
          totalAmount,
          deliveryFee: shippingCost,
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
        if (shippingOption.type !== 'delivery') {
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
        if (shippingOption.type !== 'pickup') {
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
    if (status === 'PICKED_UP' || (status === 'DELIVERED' && order.shippingOption?.type === 'pickup')) {
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
          shippingOption: true,
          transaction: true,
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
  body('shippingOptionId').isInt({ min: 1 }).withMessage('Valid shipping option ID is required'),
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

/**
 * Create POS order (admin manual order creation)
 */
const createPOSOrder = async (req, res) => {
  try {
    const { 
      customerId, // Optional - existing customer
      guestInfo, // Optional - { name, email, phone }
      items, // [{ productId, quantity, price }]
      shippingOptionId,
      paymentMethod, // 'cash', 'card', 'pay_later'
      paymentStatus, // 'COMPLETED' or 'PENDING'
      notes,
      addressId, // Optional for delivery
      pickupTime // Optional for pickup
    } = req.body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return errorResponse(res, 'Items are required', 400);
    }

    if (!shippingOptionId) {
      return errorResponse(res, 'Shipping option is required', 400);
    }

    // Get shipping option
    const shippingOption = await prisma.shippingOption.findUnique({
      where: { id: parseInt(shippingOptionId) },
    });

    if (!shippingOption || !shippingOption.isActive) {
      return errorResponse(res, 'Shipping option not found or not available', 404);
    }

    // Determine user ID - either existing customer or create guest user
    let userId;
    let customer = null;

    if (customerId) {
      // Use existing customer
      customer = await prisma.user.findUnique({
        where: { id: parseInt(customerId), role: 'CUSTOMER' }
      });
      
      if (!customer) {
        return errorResponse(res, 'Customer not found', 404);
      }
      userId = customer.id;
    } else if (guestInfo && guestInfo.email) {
      // Create or find guest user by email
      customer = await prisma.user.findFirst({
        where: { 
          email: guestInfo.email,
          role: 'CUSTOMER'
        }
      });

      if (customer) {
        userId = customer.id;
      } else {
        // Create new guest user
        customer = await prisma.user.create({
          data: {
            username: `guest_${Date.now()}`,
            email: guestInfo.email,
            fullName: guestInfo.name || 'Guest Customer',
            phone: guestInfo.phone || null,
            role: 'CUSTOMER'
          }
        });
        userId = customer.id;
      }
    } else {
      return errorResponse(res, 'Either customerId or guestInfo with email is required', 400);
    }

    // Get VAT settings
    const vatSettings = await vatService.getVATSettings();

    // Validate and calculate totals
    let itemsSubtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { category: true }
      });

      if (!product) {
        return errorResponse(res, `Product with ID ${item.productId} not found`, 404);
      }

      if (product.stock < item.quantity) {
        return errorResponse(res, `Insufficient stock for ${product.name}`, 400);
      }

      itemsSubtotal += item.price * item.quantity;

      // Get category VAT rate if available
      const categoryVatRate = product.category?.vatRate;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        categoryVatRate
      });
    }

    // Get shipping cost
    const shippingCost = shippingOption.fee;

    // Calculate VAT and totals
    const {
      taxAmount,
      totalAmount
    } = vatService.calculateOrderTotals(
      orderItems,
      shippingCost,
      vatSettings.rate
    );

    // Determine order status based on payment
    let orderStatus = 'PENDING';
    if (paymentStatus === 'COMPLETED') {
      orderStatus = 'CONFIRMED';
    }

    // Create order
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId,
          addressId: addressId ? parseInt(addressId) : null,
          shippingOptionId: shippingOption.id,
          pickupTime: shippingOption.type === 'pickup' ? pickupTime : null,
          status: orderStatus,
          subtotalBeforeVat: itemsSubtotal,
          taxAmount,
          vatRate: vatSettings.rate,
          totalAmount,
          deliveryFee: shippingCost,
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
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Create transaction record if payment is completed
      if (paymentStatus === 'COMPLETED') {
        await tx.transaction.create({
          data: {
            orderId: newOrder.id,
            amount: totalAmount,
            paymentStatus: 'COMPLETED',
            paymentMethod: paymentMethod === 'cash' ? 'Cash' : 
                          paymentMethod === 'card' ? 'Card' : 'Pay Later',
            paymentDetails: JSON.stringify({
              type: 'pos_order',
              method: paymentMethod,
              processedBy: req.user.id,
              processedAt: new Date().toISOString()
            }),
          },
        });
      }

      return newOrder;
    });

    // Get the complete order with relations
    const completeOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        address: true,
        shippingOption: true,
        transaction: true,
      },
    });

    return successResponse(res, { order: completeOrder }, 'POS order created successfully', 201);
  } catch (error) {
    console.error('Create POS order error:', error);
    return errorResponse(res, 'Failed to create POS order', 500);
  }
};

/**
 * Get receipt data for an order
 */
const getReceiptData = async (req, res) => {
  try {
    const { id } = req.params;
    const { language = 'en' } = req.query;

    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            fullName: true,
            username: true,
            email: true,
          },
        },
        address: true,
        shippingOption: true,
      },
    });

    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }

    const receiptService = require('../services/receiptService');
    const receiptHtml = await receiptService.generateReceiptHTMLFromData(order, await prisma.receiptSettings.findFirst(), language);

    return successResponse(res, { 
      order,
      receiptHtml,
      language 
    }, 'Receipt data retrieved successfully');
  } catch (error) {
    console.error('Get receipt data error:', error);
    return errorResponse(res, 'Failed to retrieve receipt data', 500);
  }
};

/**
 * Get receipt PDF
 */
const getReceiptPDF = async (req, res) => {
  try {
    const { id } = req.params;
    const { language = 'en' } = req.query;

    const receiptService = require('../services/receiptService');
    const pdfBuffer = await receiptService.generateReceiptPDF(parseInt(id), language);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="receipt-${id}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Get receipt PDF error:', error);
    return errorResponse(res, 'Failed to generate receipt PDF', 500);
  }
};

/**
 * Email receipt
 */
const emailReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, language = 'en' } = req.body;

    if (!email) {
      return errorResponse(res, 'Email address is required', 400);
    }

    const emailService = require('../services/emailService');
    const result = await emailService.sendReceiptEmail(parseInt(id), email, language);

    return successResponse(res, result, 'Receipt email sent successfully');
  } catch (error) {
    console.error('Email receipt error:', error);
    return errorResponse(res, `Failed to send receipt email: ${error.message}`, 500);
  }
};

// Validation rules for POS order
const createPOSOrderValidation = [
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.productId').isInt({ min: 1 }).withMessage('Valid product ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Valid quantity is required'),
  body('items.*.price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('shippingOptionId').isInt({ min: 1 }).withMessage('Valid shipping option ID is required'),
  body('paymentMethod').isIn(['cash', 'card', 'pay_later']).withMessage('Valid payment method is required'),
  body('paymentStatus').isIn(['COMPLETED', 'PENDING']).withMessage('Valid payment status is required'),
  body('customerId').optional().isInt({ min: 1 }).withMessage('Valid customer ID is required'),
  body('guestInfo').optional().isObject().withMessage('Guest info must be an object'),
  body('guestInfo.email').optional().isEmail().withMessage('Valid email is required for guest info'),
  body('addressId').optional().isInt({ min: 1 }).withMessage('Valid address ID is required'),
  body('pickupTime').optional().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Pickup time must be in HH:MM format'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters'),
];

module.exports = {
  getUserOrders,
  getOrder,
  createOrder,
  createPOSOrder,
  updateOrderStatus,
  assignDeliveryPerson,
  getAllOrders,
  getReceiptData,
  getReceiptPDF,
  emailReceipt,
  createOrderValidation,
  createPOSOrderValidation,
  updateOrderStatusValidation,
  assignDeliveryPersonValidation,
};

