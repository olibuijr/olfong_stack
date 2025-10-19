const express = require('express');
const router = express.Router();
const {
  getUserSubscriptions,
  getSubscription,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  getAllSubscriptions,
  processScheduledSubscriptions,
  createSubscriptionValidation,
  updateSubscriptionValidation,
} = require('../controllers/subscriptionController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

// Customer routes
router.get('/my-subscriptions', authenticate, getUserSubscriptions);
router.get('/:id', authenticate, getSubscription);
router.post('/', authenticate, ...createSubscriptionValidation, validate, createSubscription);
router.put('/:id', authenticate, ...updateSubscriptionValidation, validate, updateSubscription);
router.delete('/:id', authenticate, deleteSubscription);

// Admin routes
router.get('/', authenticate, getAllSubscriptions);
router.post('/process-scheduled', authenticate, processScheduledSubscriptions);

module.exports = router;

