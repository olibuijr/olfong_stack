const { body } = require('express-validator');
const { successResponse, errorResponse } = require('../utils/response');
const valitorService = require('../services/valitorService');
const prisma = require('../config/database');

/**
 * Create payment session for order
 */
const createPaymentSession = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentMethod = 'valitor' } = req.body;
    const userId = req.user.id;

    // Get order details
    const order = await prisma.order.findFirst({
      where: {
        id: parseInt(orderId),
        userId: userId,
      },
      include: {
        user: true,
        address: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }

    if (order.status !== 'PENDING') {
      return errorResponse(res, 'Order cannot be paid for', 400);
    }

    // Check if payment already exists
    const existingTransaction = await prisma.transaction.findUnique({
      where: { orderId: order.id },
    });

    if (existingTransaction && existingTransaction.paymentStatus === 'COMPLETED') {
      return errorResponse(res, 'Order already paid', 400);
    }

    // Handle cash on delivery payment
    if (paymentMethod === 'cash_on_delivery') {
      // Validate cash on delivery requirements
      if (order.deliveryMethod !== 'DELIVERY') {
        return errorResponse(res, 'Cash on delivery is only available for delivery orders', 400);
      }
      
      if (order.totalAmount > 50000) {
        return errorResponse(res, 'Cash on delivery is not available for orders over 50,000 ISK', 400);
      }

      // Create or update transaction record for cash on delivery
      const transaction = await prisma.transaction.upsert({
        where: { orderId: order.id },
        update: {
          paymentStatus: 'PENDING',
          paymentMethod: 'Cash on Delivery',
          paymentDetails: JSON.stringify({
            type: 'cash_on_delivery',
            requiresDelivery: true,
            maxAmount: 50000,
            status: 'pending_payment'
          }),
        },
        create: {
          orderId: order.id,
          amount: order.totalAmount,
          paymentStatus: 'PENDING',
          paymentMethod: 'Cash on Delivery',
          paymentDetails: JSON.stringify({
            type: 'cash_on_delivery',
            requiresDelivery: true,
            maxAmount: 50000,
            status: 'pending_payment'
          }),
        },
      });

      return successResponse(res, {
        paymentMethod: 'cash_on_delivery',
        status: 'pending_payment',
        message: 'Order will be paid upon delivery',
        transactionId: transaction.id,
      }, 'Cash on delivery payment confirmed');
    }

    // Handle pay on pickup payment
    if (paymentMethod === 'pay_on_pickup') {
      // Validate pay on pickup requirements
      if (order.deliveryMethod !== 'PICKUP') {
        return errorResponse(res, 'Pay on pickup is only available for pickup orders', 400);
      }
      
      if (order.totalAmount > 50000) {
        return errorResponse(res, 'Pay on pickup is not available for orders over 50,000 ISK', 400);
      }

      // Create or update transaction record for pay on pickup
      const transaction = await prisma.transaction.upsert({
        where: { orderId: order.id },
        update: {
          paymentStatus: 'PENDING',
          paymentMethod: 'Pay on Pickup',
          paymentDetails: JSON.stringify({
            type: 'pay_on_pickup',
            requiresPickup: true,
            maxAmount: 50000,
            status: 'pending_payment'
          }),
        },
        create: {
          orderId: order.id,
          amount: order.totalAmount,
          paymentStatus: 'PENDING',
          paymentMethod: 'Pay on Pickup',
          paymentDetails: JSON.stringify({
            type: 'pay_on_pickup',
            requiresPickup: true,
            maxAmount: 50000,
            status: 'pending_payment'
          }),
        },
      });

      return successResponse(res, {
        paymentMethod: 'pay_on_pickup',
        status: 'pending_payment',
        message: 'Order will be paid upon pickup',
        transactionId: transaction.id,
      }, 'Pay on pickup payment confirmed');
    }

    // Prepare payment data for Valitor
    const paymentData = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: order.totalAmount,
      customerName: order.user.fullName || order.user.username,
      customerEmail: order.user.email,
      customerPhone: order.user.phone,
      billingAddress: {
        street: order.address.street,
        city: order.address.city,
        postalCode: order.address.postalCode,
        country: order.address.country,
      },
    };

    // Create payment session with Valitor
    const paymentResult = await valitorService.createPaymentSession(paymentData);

    if (!paymentResult.success) {
      return errorResponse(res, paymentResult.error, 500);
    }

    // Create or update transaction record
    const transaction = await prisma.transaction.upsert({
      where: { orderId: order.id },
      update: {
        valitorTransactionId: paymentResult.transactionId,
        paymentStatus: 'PENDING',
        paymentMethod: 'Valitor',
        paymentDetails: JSON.stringify({
          sessionId: paymentResult.sessionId,
          paymentUrl: paymentResult.paymentUrl,
        }),
      },
      create: {
        orderId: order.id,
        amount: order.totalAmount,
        paymentStatus: 'PENDING',
        paymentMethod: 'Valitor',
        valitorTransactionId: paymentResult.transactionId,
        paymentDetails: JSON.stringify({
          sessionId: paymentResult.sessionId,
          paymentUrl: paymentResult.paymentUrl,
        }),
      },
    });

    return successResponse(res, {
      paymentUrl: paymentResult.paymentUrl,
      transactionId: paymentResult.transactionId,
      sessionId: paymentResult.sessionId,
    }, 'Payment session created successfully');
  } catch (error) {
    console.error('Create payment session error:', error);
    return errorResponse(res, 'Failed to create payment session', 500);
  }
};

/**
 * Handle Valitor webhook
 */
const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['valitor-signature'];
    const payload = req.body;

    // Verify webhook signature
    if (!valitorService.verifyWebhookSignature(payload, signature)) {
      return errorResponse(res, 'Invalid webhook signature', 401);
    }

    const { transactionId, status, amount, paymentMethod } = payload;

    // Find transaction
    const transaction = await prisma.transaction.findFirst({
      where: { valitorTransactionId: transactionId },
      include: { order: true },
    });

    if (!transaction) {
      return errorResponse(res, 'Transaction not found', 404);
    }

    // Update transaction status
    const paymentStatus = status === 'completed' ? 'COMPLETED' : 
                         status === 'failed' ? 'FAILED' : 'PENDING';

    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        paymentStatus,
        paymentMethod: paymentMethod || 'Valitor',
        paymentDetails: JSON.stringify({
          ...JSON.parse(transaction.paymentDetails || '{}'),
          webhookData: payload,
          processedAt: new Date().toISOString(),
        }),
      },
    });

    // Update order status if payment completed
    if (paymentStatus === 'COMPLETED') {
      await prisma.order.update({
        where: { id: transaction.orderId },
        data: { status: 'CONFIRMED' },
      });
    }

    return successResponse(res, null, 'Webhook processed successfully');
  } catch (error) {
    console.error('Webhook processing error:', error);
    return errorResponse(res, 'Webhook processing failed', 500);
  }
};

/**
 * Verify payment status
 */
const verifyPayment = async (req, res) => {
  try {
    const { transactionId } = req.params;

    // Verify with Valitor
    const verificationResult = await valitorService.verifyPayment(transactionId);

    if (!verificationResult.success) {
      return errorResponse(res, verificationResult.error, 500);
    }

    // Update local transaction if needed
    const transaction = await prisma.transaction.findFirst({
      where: { valitorTransactionId: transactionId },
    });

    if (transaction && verificationResult.status === 'completed') {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { paymentStatus: 'COMPLETED' },
      });

      // Update order status
      await prisma.order.update({
        where: { id: transaction.orderId },
        data: { status: 'CONFIRMED' },
      });
    }

    return successResponse(res, {
      status: verificationResult.status,
      amount: verificationResult.amount,
      paymentMethod: verificationResult.paymentMethod,
      processedAt: verificationResult.processedAt,
    }, 'Payment status retrieved successfully');
  } catch (error) {
    console.error('Verify payment error:', error);
    return errorResponse(res, 'Failed to verify payment', 500);
  }
};

/**
 * Refund payment
 */
const refundPayment = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { amount, reason } = req.body;

    // Find transaction
    const transaction = await prisma.transaction.findFirst({
      where: { valitorTransactionId: transactionId },
      include: { order: true },
    });

    if (!transaction) {
      return errorResponse(res, 'Transaction not found', 404);
    }

    if (transaction.paymentStatus !== 'COMPLETED') {
      return errorResponse(res, 'Cannot refund incomplete payment', 400);
    }

    const refundAmount = amount || transaction.amount;

    // Process refund with Valitor
    const refundResult = await valitorService.refundPayment(transactionId, refundAmount);

    if (!refundResult.success) {
      return errorResponse(res, refundResult.error, 500);
    }

    // Update transaction status
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        paymentStatus: 'REFUNDED',
        paymentDetails: JSON.stringify({
          ...JSON.parse(transaction.paymentDetails || '{}'),
          refund: {
            refundId: refundResult.refundId,
            amount: refundResult.amount,
            status: refundResult.status,
            reason: reason,
            processedAt: new Date().toISOString(),
          },
        }),
      },
    });

    return successResponse(res, {
      refundId: refundResult.refundId,
      amount: refundResult.amount,
      status: refundResult.status,
    }, 'Refund processed successfully');
  } catch (error) {
    console.error('Refund payment error:', error);
    return errorResponse(res, 'Failed to process refund', 500);
  }
};

/**
 * Get available payment methods
 */
const getPaymentMethods = async (req, res) => {
  try {
    const methodsResult = await valitorService.getPaymentMethods();

    if (!methodsResult.success) {
      return errorResponse(res, methodsResult.error, 500);
    }

    return successResponse(res, methodsResult.methods, 'Payment methods retrieved successfully');
  } catch (error) {
    console.error('Get payment methods error:', error);
    return errorResponse(res, 'Failed to get payment methods', 500);
  }
};

// Validation rules
const createPaymentSessionValidation = [
  body('orderId').isInt({ min: 1 }).withMessage('Valid order ID is required'),
];

const refundPaymentValidation = [
  body('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('reason').optional().isLength({ max: 500 }).withMessage('Reason must be less than 500 characters'),
];

module.exports = {
  createPaymentSession,
  handleWebhook,
  verifyPayment,
  refundPayment,
  getPaymentMethods,
  createPaymentSessionValidation,
  refundPaymentValidation,
};
