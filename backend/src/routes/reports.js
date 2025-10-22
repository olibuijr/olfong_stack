const express = require('express');
const router = express.Router();
const { getSalesReport, getCustomerReport, getInventoryReport } = require('../controllers/reportsController');
const { authenticate, authorize } = require('../middleware/auth');

// Get sales report (Admin only)
router.get('/sales', authenticate, authorize('ADMIN'), getSalesReport);

// Get customer report (Admin only)
router.get('/customers', authenticate, authorize('ADMIN'), getCustomerReport);

// Get inventory report (Admin only)
router.get('/inventory', authenticate, authorize('ADMIN'), getInventoryReport);

// Get products report (Admin only) - alias for inventory
router.get('/products', authenticate, authorize('ADMIN'), getInventoryReport);

// Get orders report (Admin only) - use analytics endpoint
router.get('/orders', authenticate, authorize('ADMIN'), async (req, res) => {
  // Redirect to analytics endpoint for order data
  const analyticsController = require('../controllers/analyticsController');
  return analyticsController.getAnalytics(req, res);
});

module.exports = router;