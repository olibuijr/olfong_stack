const express = require('express');
const router = express.Router();
const { getCustomers, getCustomerById } = require('../controllers/customerController');
const { authenticate, authorize } = require('../middleware/auth');

// Get all customers (Admin only)
router.get('/', authenticate, authorize('ADMIN'), getCustomers);

// Get customer by ID (Admin only)
router.get('/:id', authenticate, authorize('ADMIN'), getCustomerById);

module.exports = router;