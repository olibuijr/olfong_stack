const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const {
  getCategories,
  getCategory,
  getSubcategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createCategoryValidation,
  updateCategoryValidation,
} = require('../controllers/categoryController');

// Public routes
router.get('/', getCategories);
router.get('/subcategories', getSubcategories);
router.get('/:id', getCategory);

// Admin only routes
router.post('/', authenticate, authorize('ADMIN'), createCategoryValidation, validate, createCategory);
router.put('/:id', authenticate, authorize('ADMIN'), updateCategoryValidation, validate, updateCategory);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteCategory);

module.exports = router;
