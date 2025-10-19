const { body } = require('express-validator');
const { successResponse, errorResponse } = require('../utils/response');
const prisma = require('../config/database');

/**
 * Get user's cart
 */
const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      // Create empty cart if it doesn't exist
      const newCart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
      return successResponse(res, newCart, 'Cart retrieved successfully');
    }

    return successResponse(res, cart, 'Cart retrieved successfully');
  } catch (error) {
    console.error('Get cart error:', error);
    return errorResponse(res, 'Failed to retrieve cart', 500);
  }
};

/**
 * Add item to cart
 */
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user.id;

    // Verify product exists and is active
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) },
    });

    if (!product || !product.isActive) {
      return errorResponse(res, 'Product not found or unavailable', 404);
    }

    if (product.stock < quantity) {
      return errorResponse(res, 'Insufficient stock', 400);
    }

    // Age restriction checks
    const dob = req.user.dob ? new Date(req.user.dob) : null;
    const birthYear = dob ? dob.getUTCFullYear() : null;
    let age = null;
    if (dob) {
      const today = new Date();
      age = today.getUTCFullYear() - dob.getUTCFullYear();
      const m = today.getUTCMonth() - dob.getUTCMonth();
      if (m < 0 || (m === 0 && today.getUTCDate() < dob.getUTCDate())) age--;
    }

    if ((product.category === 'WINE' || product.category === 'BEER' || product.category === 'SPIRITS') && (age === null || age < 20)) {
      return errorResponse(res, 'You must be 20+ to purchase alcohol', 403);
    }
    if (product.category === 'NICOTINE' && (age === null || age < 18)) {
      return errorResponse(res, 'You must be 18+ to purchase nicotine products', 403);
    }

    // Get or create cart
    let cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
      });
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: parseInt(productId),
        },
      },
    });

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + parseInt(quantity);
      
      if (product.stock < newQuantity) {
        return errorResponse(res, 'Insufficient stock', 400);
      }

      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: { product: true },
      });

      return successResponse(res, updatedItem, 'Cart item updated successfully');
    } else {
      // Add new item
      const newItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: parseInt(productId),
          quantity: parseInt(quantity),
        },
        include: { product: true },
      });

      return successResponse(res, newItem, 'Item added to cart successfully', 201);
    }
  } catch (error) {
    console.error('Add to cart error:', error);
    return errorResponse(res, 'Failed to add item to cart', 500);
  }
};

/**
 * Update cart item quantity
 */
const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;

    // Find cart item
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: parseInt(itemId) },
      include: {
        cart: true,
        product: true,
      },
    });

    if (!cartItem || cartItem.cart.userId !== userId) {
      return errorResponse(res, 'Cart item not found', 404);
    }

    if (parseInt(quantity) <= 0) {
      // Remove item if quantity is 0 or negative
      await prisma.cartItem.delete({
        where: { id: parseInt(itemId) },
      });
      return successResponse(res, null, 'Item removed from cart');
    }

    // Age restriction checks on update as well
    const updProduct = cartItem.product;
    const newQty = parseInt(quantity);
    if ((updProduct.category === 'WINE' || updProduct.category === 'BEER' || updProduct.category === 'SPIRITS') && (age === null || age < 20)) {
      return errorResponse(res, 'You must be 20+ to purchase alcohol', 403);
    }
    if (updProduct.category === 'NICOTINE' && (age === null || age < 18)) {
      return errorResponse(res, 'You must be 18+ to purchase nicotine products', 403);
    }

    if (cartItem.product.stock < newQty) {
      return errorResponse(res, 'Insufficient stock', 400);
    }

    // Update quantity
    const updatedItem = await prisma.cartItem.update({
      where: { id: parseInt(itemId) },
      data: { quantity: newQty },
      include: { product: true },
    });

    return successResponse(res, updatedItem, 'Cart item updated successfully');
  } catch (error) {
    console.error('Update cart item error:', error);
    return errorResponse(res, 'Failed to update cart item', 500);
  }
};

/**
 * Remove item from cart
 */
const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.id;

    // Find cart item
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: parseInt(itemId) },
      include: {
        cart: true,
      },
    });

    if (!cartItem || cartItem.cart.userId !== userId) {
      return errorResponse(res, 'Cart item not found', 404);
    }

    await prisma.cartItem.delete({
      where: { id: parseInt(itemId) },
    });

    return successResponse(res, null, 'Item removed from cart');
  } catch (error) {
    console.error('Remove from cart error:', error);
    return errorResponse(res, 'Failed to remove item from cart', 500);
  }
};

/**
 * Clear entire cart
 */
const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      return errorResponse(res, 'Cart not found', 404);
    }

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return successResponse(res, null, 'Cart cleared successfully');
  } catch (error) {
    console.error('Clear cart error:', error);
    return errorResponse(res, 'Failed to clear cart', 500);
  }
};

// Validation rules
const addToCartValidation = [
  body('productId').isInt({ min: 1 }).withMessage('Valid product ID is required'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
];

const updateCartItemValidation = [
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
];

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  addToCartValidation,
  updateCartItemValidation,
};

