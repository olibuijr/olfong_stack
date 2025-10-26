const express = require('express');
const { validate } = require('../middleware/validator');
const { authenticate, authorize } = require('../middleware/auth');
const {
  getVatProfiles,
  getVatProfile,
  createVatProfile,
  updateVatProfile,
  deleteVatProfile,
  assignCategoriesToProfile,
  createVatProfileValidation,
  updateVatProfileValidation
} = require('../controllers/vatProfileController');

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate, authorize('ADMIN'));

// Get all VAT profiles
router.get('/', getVatProfiles);

// Get single VAT profile
router.get('/:id', getVatProfile);

// Create new VAT profile
router.post('/', createVatProfileValidation, validate, createVatProfile);

// Update VAT profile
router.put('/:id', updateVatProfileValidation, validate, updateVatProfile);

// Delete VAT profile
router.delete('/:id', deleteVatProfile);

// Assign categories to a profile
router.post('/:id/categories', assignCategoriesToProfile);

module.exports = router;
