const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const upload = require('../middleware/upload');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getDiscountedProducts,
  setProductDiscount,
  removeProductDiscount,
  getCategories,
  createProductValidation,
  updateProductValidation,
} = require('../controllers/productController');

// Public routes
router.get('/', getProducts);
router.get('/discounted', getDiscountedProducts);
router.get('/categories', getCategories);
router.get('/:id', getProduct);

// Admin only routes
router.post('/', authenticate, authorize('ADMIN'), upload.single('image'), createProductValidation, validate, createProduct);
router.put('/:id', authenticate, authorize('ADMIN'), upload.single('image'), updateProductValidation, validate, updateProduct);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteProduct);
router.post('/:id/discount', authenticate, authorize('ADMIN'), setProductDiscount);
router.delete('/:id/discount', authenticate, authorize('ADMIN'), removeProductDiscount);

module.exports = router;

