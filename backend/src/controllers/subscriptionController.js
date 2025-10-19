const { body, query } = require('express-validator');
const { successResponse, errorResponse } = require('../utils/response');
const prisma = require('../config/database');

/**
 * Get user's subscriptions
 */
const getUserSubscriptions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { userId };
    if (status) {
      where.status = status.toUpperCase();
    }

    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          product: true,
          address: true,
          deliveries: {
            orderBy: { scheduledDate: 'desc' },
            take: 5, // Last 5 deliveries
          },
        },
      }),
      prisma.subscription.count({ where }),
    ]);

    return successResponse(res, {
      subscriptions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get user subscriptions error:', error);
    return errorResponse(res, 'Failed to retrieve subscriptions', 500);
  }
};

/**
 * Get subscription by ID
 */
const getSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const subscription = await prisma.subscription.findFirst({
      where: {
        id: parseInt(id),
        userId,
      },
      include: {
        product: true,
        address: true,
        deliveries: {
          orderBy: { scheduledDate: 'desc' },
          include: {
            order: {
              include: {
                items: {
                  include: {
                    product: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!subscription) {
      return errorResponse(res, 'Subscription not found', 404);
    }

    return successResponse(res, subscription, 'Subscription retrieved successfully');
  } catch (error) {
    console.error('Get subscription error:', error);
    return errorResponse(res, 'Failed to retrieve subscription', 500);
  }
};

/**
 * Create new subscription
 */
const createSubscription = async (req, res) => {
  try {
    const {
      productId,
      addressId,
      quantity = 1,
      intervalType,
      intervalValue = 1,
      preferredDay,
      preferredTime,
      notes,
    } = req.body;
    const userId = req.user.id;

    // Verify product exists and is active
    const product = await prisma.product.findFirst({
      where: { id: parseInt(productId), isActive: true },
    });

    if (!product) {
      return errorResponse(res, 'Product not found or inactive', 404);
    }

    // Verify address belongs to user (for delivery subscriptions)
    if (addressId) {
      const address = await prisma.address.findFirst({
        where: { id: parseInt(addressId), userId },
      });

      if (!address) {
        return errorResponse(res, 'Address not found', 404);
      }
    }

    // Calculate next delivery date
    const nextDelivery = calculateNextDelivery(intervalType, intervalValue, preferredDay, preferredTime);

    // Create subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId,
        productId: parseInt(productId),
        addressId: addressId ? parseInt(addressId) : null,
        quantity: parseInt(quantity),
        intervalType,
        intervalValue: parseInt(intervalValue),
        preferredDay,
        preferredTime,
        nextDelivery,
        notes,
      },
      include: {
        product: true,
        address: true,
      },
    });

    // Create first scheduled delivery
    await prisma.subscriptionDelivery.create({
      data: {
        subscriptionId: subscription.id,
        scheduledDate: nextDelivery,
        status: 'SCHEDULED',
      },
    });

    return successResponse(res, subscription, 'Subscription created successfully', 201);
  } catch (error) {
    console.error('Create subscription error:', error);
    return errorResponse(res, 'Failed to create subscription', 500);
  }
};

/**
 * Update subscription
 */
const updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      quantity,
      intervalType,
      intervalValue,
      preferredDay,
      preferredTime,
      status,
      notes,
    } = req.body;
    const userId = req.user.id;

    // Verify subscription belongs to user
    const existingSubscription = await prisma.subscription.findFirst({
      where: { id: parseInt(id), userId },
    });

    if (!existingSubscription) {
      return errorResponse(res, 'Subscription not found', 404);
    }

    const updateData = {};
    if (quantity !== undefined) updateData.quantity = parseInt(quantity);
    if (intervalType !== undefined) updateData.intervalType = intervalType;
    if (intervalValue !== undefined) updateData.intervalValue = parseInt(intervalValue);
    if (preferredDay !== undefined) updateData.preferredDay = preferredDay;
    if (preferredTime !== undefined) updateData.preferredTime = preferredTime;
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    // Recalculate next delivery if interval changed
    if (intervalType !== undefined || intervalValue !== undefined || preferredDay !== undefined || preferredTime !== undefined) {
      updateData.nextDelivery = calculateNextDelivery(
        intervalType || existingSubscription.intervalType,
        intervalValue || existingSubscription.intervalValue,
        preferredDay !== undefined ? preferredDay : existingSubscription.preferredDay,
        preferredTime !== undefined ? preferredTime : existingSubscription.preferredTime
      );
    }

    const subscription = await prisma.subscription.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        product: true,
        address: true,
      },
    });

    return successResponse(res, subscription, 'Subscription updated successfully');
  } catch (error) {
    console.error('Update subscription error:', error);
    return errorResponse(res, 'Failed to update subscription', 500);
  }
};

/**
 * Delete subscription
 */
const deleteSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify subscription belongs to user
    const subscription = await prisma.subscription.findFirst({
      where: { id: parseInt(id), userId },
    });

    if (!subscription) {
      return errorResponse(res, 'Subscription not found', 404);
    }

    // Cancel the subscription instead of deleting
    await prisma.subscription.update({
      where: { id: parseInt(id) },
      data: { status: 'CANCELLED' },
    });

    return successResponse(res, null, 'Subscription cancelled successfully');
  } catch (error) {
    console.error('Delete subscription error:', error);
    return errorResponse(res, 'Failed to cancel subscription', 500);
  }
};

/**
 * Get all subscriptions (Admin only)
 */
const getAllSubscriptions = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status) {
      where.status = status.toUpperCase();
    }

    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          product: true,
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
      }),
      prisma.subscription.count({ where }),
    ]);

    return successResponse(res, {
      subscriptions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get all subscriptions error:', error);
    return errorResponse(res, 'Failed to retrieve subscriptions', 500);
  }
};

/**
 * Process scheduled subscriptions (Admin only)
 * This would typically be run as a cron job
 */
const processScheduledSubscriptions = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find subscriptions that need to be processed today
    const subscriptions = await prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        nextDelivery: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000), // Next day
        },
      },
      include: {
        product: true,
        address: true,
        user: true,
      },
    });

    const processedOrders = [];

    for (const subscription of subscriptions) {
      try {
        // Check if product is still available and has stock
        if (subscription.product.stock < subscription.quantity) {
          // Skip this delivery and schedule next one
          await scheduleNextDelivery(subscription);
          continue;
        }

        // Create order for this subscription delivery
        const order = await prisma.$transaction(async (tx) => {
          // Create order
          const newOrder = await tx.order.create({
            data: {
              orderNumber: generateOrderNumber(),
              userId: subscription.userId,
              addressId: subscription.addressId,
              deliveryMethod: 'DELIVERY',
              status: 'PENDING',
              totalAmount: subscription.product.price * subscription.quantity + 500, // Add delivery fee
              deliveryFee: 500,
              notes: `Subscription delivery for ${subscription.product.name}`,
            },
          });

          // Create order item
          await tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              productId: subscription.productId,
              quantity: subscription.quantity,
              price: subscription.product.price,
            },
          });

          // Update product stock
          await tx.product.update({
            where: { id: subscription.productId },
            data: {
              stock: {
                decrement: subscription.quantity,
              },
            },
          });

          return newOrder;
        });

        // Create subscription delivery record
        await prisma.subscriptionDelivery.create({
          data: {
            subscriptionId: subscription.id,
            orderId: order.id,
            scheduledDate: subscription.nextDelivery,
            actualDate: new Date(),
            status: 'PROCESSING',
          },
        });

        // Schedule next delivery
        await scheduleNextDelivery(subscription);

        processedOrders.push(order);
      } catch (error) {
        console.error(`Error processing subscription ${subscription.id}:`, error);
        // Mark delivery as failed
        await prisma.subscriptionDelivery.create({
          data: {
            subscriptionId: subscription.id,
            scheduledDate: subscription.nextDelivery,
            status: 'FAILED',
            notes: 'Failed to process subscription delivery',
          },
        });
      }
    }

    return successResponse(res, {
      processedCount: processedOrders.length,
      processedOrders,
    }, 'Subscription processing completed');
  } catch (error) {
    console.error('Process scheduled subscriptions error:', error);
    return errorResponse(res, 'Failed to process subscriptions', 500);
  }
};

/**
 * Helper function to calculate next delivery date
 */
const calculateNextDelivery = (intervalType, intervalValue, preferredDay, preferredTime) => {
  const now = new Date();
  let nextDelivery = new Date(now);

  switch (intervalType) {
    case 'WEEKLY':
      nextDelivery.setDate(now.getDate() + (7 * intervalValue));
      break;
    case 'BIWEEKLY':
      nextDelivery.setDate(now.getDate() + (14 * intervalValue));
      break;
    case 'MONTHLY':
      nextDelivery.setMonth(now.getMonth() + intervalValue);
      break;
    default:
      nextDelivery.setDate(now.getDate() + 7); // Default to weekly
  }

  // Adjust for preferred day if specified
  if (preferredDay) {
    const dayMap = {
      MONDAY: 1,
      TUESDAY: 2,
      WEDNESDAY: 3,
      THURSDAY: 4,
      FRIDAY: 5,
      SATURDAY: 6,
      SUNDAY: 0,
    };
    
    const targetDay = dayMap[preferredDay];
    const currentDay = nextDelivery.getDay();
    const daysToAdd = (targetDay - currentDay + 7) % 7;
    nextDelivery.setDate(nextDelivery.getDate() + daysToAdd);
  }

  // Set preferred time if specified
  if (preferredTime) {
    const [hours, minutes] = preferredTime.split(':');
    nextDelivery.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  } else {
    // Default to 15:00 (3 PM)
    nextDelivery.setHours(15, 0, 0, 0);
  }

  return nextDelivery;
};

/**
 * Helper function to schedule next delivery
 */
const scheduleNextDelivery = async (subscription) => {
  const nextDelivery = calculateNextDelivery(
    subscription.intervalType,
    subscription.intervalValue,
    subscription.preferredDay,
    subscription.preferredTime
  );

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: { nextDelivery },
  });

  // Create next scheduled delivery record
  await prisma.subscriptionDelivery.create({
    data: {
      subscriptionId: subscription.id,
      scheduledDate: nextDelivery,
      status: 'SCHEDULED',
    },
  });
};

/**
 * Generate unique order number
 */
const generateOrderNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `OLF-${timestamp}-${random}`;
};

// Validation rules
const createSubscriptionValidation = [
  body('productId').isInt({ min: 1 }).withMessage('Valid product ID is required'),
  body('addressId').optional().isInt({ min: 1 }).withMessage('Valid address ID is required'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('intervalType').isIn(['WEEKLY', 'BIWEEKLY', 'MONTHLY', 'CUSTOM']).withMessage('Invalid interval type'),
  body('intervalValue').optional().isInt({ min: 1 }).withMessage('Interval value must be at least 1'),
  body('preferredDay').optional().isIn(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']).withMessage('Invalid preferred day'),
  body('preferredTime').optional().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Preferred time must be in HH:MM format'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters'),
];

const updateSubscriptionValidation = [
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('intervalType').optional().isIn(['WEEKLY', 'BIWEEKLY', 'MONTHLY', 'CUSTOM']).withMessage('Invalid interval type'),
  body('intervalValue').optional().isInt({ min: 1 }).withMessage('Interval value must be at least 1'),
  body('preferredDay').optional().isIn(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']).withMessage('Invalid preferred day'),
  body('preferredTime').optional().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Preferred time must be in HH:MM format'),
  body('status').optional().isIn(['ACTIVE', 'PAUSED', 'CANCELLED']).withMessage('Invalid status'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters'),
];

module.exports = {
  getUserSubscriptions,
  getSubscription,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  getAllSubscriptions,
  processScheduledSubscriptions,
  createSubscriptionValidation,
  updateSubscriptionValidation,
};

