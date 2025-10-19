const express = require('express');
const router = express.Router();
const {
  searchProducts,
  getProductById,
  getFoodCategories,
  getProductCategories
} = require('../controllers/atvrController');

// Search ATVR products
router.post('/search', searchProducts);

// Get product details by ID
router.get('/product/:productId', getProductById);

// Get food categories
router.get('/food-categories', getFoodCategories);

// Get product categories
router.get('/product-categories', getProductCategories);

module.exports = router;

