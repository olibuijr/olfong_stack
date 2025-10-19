const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const {
  updateLocation,
  getDeliveryLocation,
  getAllDeliveryLocations,
  locationValidation,
} = require('../controllers/locationController');

// Delivery personnel routes
router.post('/', authenticate, authorize('DELIVERY'), locationValidation, validate, updateLocation);

// Public route to get specific delivery person's location
router.get('/delivery/:deliveryPersonId', getDeliveryLocation);

// Admin route to get all delivery locations
router.get('/delivery', authenticate, authorize('ADMIN'), getAllDeliveryLocations);

module.exports = router;

