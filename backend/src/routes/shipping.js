const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getShippingOptions,
  getShippingOption,
  createShippingOption,
  updateShippingOption,
  deleteShippingOption,
  toggleShippingOption,
  getActiveShippingOptions,
} = require('../controllers/shippingController');

// Public routes
router.get('/active', getActiveShippingOptions);

// Admin routes
router.get('/', authenticate, authorize(['ADMIN']), getShippingOptions);
router.get('/:id', authenticate, authorize(['ADMIN']), getShippingOption);
router.post('/', authenticate, authorize(['ADMIN']), createShippingOption);
router.put('/:id', authenticate, authorize(['ADMIN']), updateShippingOption);
router.patch('/:id/toggle', authenticate, authorize(['ADMIN']), toggleShippingOption);
router.delete('/:id', authenticate, authorize(['ADMIN']), deleteShippingOption);

module.exports = router;