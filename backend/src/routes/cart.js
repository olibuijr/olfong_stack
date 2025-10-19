const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  addToCartValidation,
  updateCartItemValidation,
} = require('../controllers/cartController');

// All routes require authentication
router.use(authenticate);

router.get('/', getCart);
router.post('/items', addToCartValidation, validate, addToCart);
router.put('/items/:itemId', updateCartItemValidation, validate, updateCartItem);
router.delete('/items/:itemId', removeFromCart);
router.delete('/', clearCart);

module.exports = router;

