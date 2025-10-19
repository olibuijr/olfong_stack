const express = require('express');
const router = express.Router();
const { getAnalytics, getRevenueTrend } = require('../controllers/analyticsController');
const { authenticate, authorize } = require('../middleware/auth');

// Get analytics data (Admin only)
router.get('/', authenticate, authorize('ADMIN'), getAnalytics);

// Get revenue trend data (Admin only)
router.get('/revenue-trend', authenticate, authorize('ADMIN'), getRevenueTrend);

module.exports = router;