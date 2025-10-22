const express = require('express');
const router = express.Router();
const {
  getPaymentGateways,
  getPaymentGateway,
  createPaymentGateway,
  updatePaymentGateway,
  togglePaymentGateway,
  testPaymentGateway,
  getPaymentGatewayConfig
} = require('../controllers/paymentGatewayController');
const { authenticate } = require('../middleware/auth');
const { validatePaymentGateway } = require('../middleware/validator');

// Public route for getting enabled payment gateways (for checkout)
router.get('/config', getPaymentGatewayConfig);

// Admin routes - require authentication
router.use(authenticate);

// Get all payment gateways (admin only)
router.get('/', getPaymentGateways);

// Get payment gateway by ID (admin only)
router.get('/:id', getPaymentGateway);

// Create new payment gateway (admin only)
router.post('/', ...validatePaymentGateway, createPaymentGateway);

// Update payment gateway (admin only)
router.put('/:id', ...validatePaymentGateway, updatePaymentGateway);

// Delete payment gateway (admin only) - DISABLED for security
// router.delete('/:id', deletePaymentGateway);

// Toggle payment gateway enabled status (admin only)
router.patch('/:id/toggle', togglePaymentGateway);

// Test payment gateway connection (admin only)
router.post('/:id/test', testPaymentGateway);

// Test payment gateway configuration (admin only)
router.post('/test', testPaymentGateway);

module.exports = router;
