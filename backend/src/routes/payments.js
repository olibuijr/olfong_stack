const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const {
  createPaymentSession,
  handleWebhook,
  handleTeyaWebhook,
  verifyPayment,
  refundPayment,
  getPaymentMethods,
  createPaymentSessionValidation,
  refundPaymentValidation,
} = require('../controllers/paymentController');

// Public webhook endpoints (no authentication required)
router.post('/webhook', handleWebhook);
router.post('/webhook/teya', handleTeyaWebhook);

// Get payment methods (public)
router.get('/methods', getPaymentMethods);

// Protected routes
router.use(authenticate);

// Create payment session for order
router.post('/orders/:orderId/session', createPaymentSessionValidation, validate, createPaymentSession);

// Verify payment status
router.get('/verify/:transactionId', verifyPayment);

// Refund payment (Admin only)
router.post('/refund/:transactionId', authorize('ADMIN'), refundPaymentValidation, validate, refundPayment);

module.exports = router;
