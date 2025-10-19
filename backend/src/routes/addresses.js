const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const {
  getUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  addressValidation,
} = require('../controllers/addressController');

// All routes require authentication
router.use(authenticate);

router.get('/', getUserAddresses);
router.post('/', addressValidation, validate, createAddress);
router.put('/:id', addressValidation, validate, updateAddress);
router.delete('/:id', deleteAddress);

module.exports = router;

