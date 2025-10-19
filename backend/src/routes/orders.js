const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const {
  getUserOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  assignDeliveryPerson,
  getAllOrders,
  createOrderValidation,
  updateOrderStatusValidation,
  assignDeliveryPersonValidation,
} = require('../controllers/orderController');

// User routes
router.get('/my-orders', authenticate, getUserOrders);
router.get('/:id', authenticate, getOrder);
router.post('/', authenticate, createOrderValidation, validate, createOrder);

// Admin routes
router.get('/', authenticate, authorize('ADMIN'), getAllOrders);
router.put('/:id/assign-delivery', authenticate, authorize('ADMIN'), assignDeliveryPersonValidation, validate, assignDeliveryPerson);

// Admin and Delivery routes
router.put('/:id/status', authenticate, authorize('ADMIN', 'DELIVERY'), updateOrderStatusValidation, validate, updateOrderStatus);

module.exports = router;

