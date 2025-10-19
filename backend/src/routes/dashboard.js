const express = require('express');
const { getDashboardStats } = require('../controllers/dashboardController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Get dashboard statistics (Admin only)
router.get('/stats', authenticate, authorize('ADMIN'), getDashboardStats);

module.exports = router;
