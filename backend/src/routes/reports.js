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

module.exports = router;