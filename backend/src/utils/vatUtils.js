/**
 * VAT (Value Added Tax) Utilities
 *
 * These utilities calculate VAT amounts from prices that include VAT.
 * Since all prices in the system are stored with VAT included, we need
 * to reverse-calculate the VAT amount and price before VAT.
 *
 * Usage:
 * const { calculateVatBreakdown, calculateOrderVat } = require('./vatUtils');
 *
 * // For a single product
 * const breakdown = calculateVatBreakdown(1999, 24); // 24% VAT
 * // Returns: { priceBeforeVat: 1612.10, vatAmount: 386.90, totalPrice: 1999 }
 *
 * // For an order with multiple items
 * const order = calculateOrderVat(cartItems); // Each item has price and vatRate
 * // Returns: { totalBeforeVat: ..., totalVat: ..., grandTotal: ... }
 */

/**
 * Calculate VAT breakdown from a price that includes VAT
 *
 * @param {number} totalPrice - The total price including VAT
 * @param {number} vatRate - The VAT rate as a percentage (e.g., 24 for 24%)
 * @returns {Object} Object with priceBeforeVat, vatAmount, and totalPrice
 *
 * Formula:
 * priceBeforeVat = totalPrice / (1 + vatRate/100)
 * vatAmount = totalPrice - priceBeforeVat
 */
const calculateVatBreakdown = (totalPrice, vatRate) => {
  if (!totalPrice || totalPrice < 0 || !vatRate || vatRate < 0) {
    return {
      priceBeforeVat: 0,
      vatAmount: 0,
      totalPrice: totalPrice || 0
    };
  }

  const priceBeforeVat = totalPrice / (1 + (vatRate / 100));
  const vatAmount = totalPrice - priceBeforeVat;

  return {
    priceBeforeVat: Math.round(priceBeforeVat * 100) / 100,
    vatAmount: Math.round(vatAmount * 100) / 100,
    totalPrice: Math.round(totalPrice * 100) / 100
  };
};

/**
 * Get VAT amount from a price that includes VAT
 *
 * @param {number} totalPrice - The total price including VAT
 * @param {number} vatRate - The VAT rate as a percentage
 * @returns {number} The VAT amount
 */
const getVatAmount = (totalPrice, vatRate) => {
  const breakdown = calculateVatBreakdown(totalPrice, vatRate);
  return breakdown.vatAmount;
};

/**
 * Get price before VAT from a price that includes VAT
 *
 * @param {number} totalPrice - The total price including VAT
 * @param {number} vatRate - The VAT rate as a percentage
 * @returns {number} The price before VAT
 */
const getPriceBeforeVat = (totalPrice, vatRate) => {
  const breakdown = calculateVatBreakdown(totalPrice, vatRate);
  return breakdown.priceBeforeVat;
};

/**
 * Calculate total VAT for a cart/order with multiple items
 *
 * Usage:
 * const items = [
 *   { price: 5000, quantity: 2, vatRate: 24 },
 *   { price: 3000, quantity: 1, vatRate: 24 }
 * ];
 * const result = calculateOrderVat(items);
 *
 * @param {Array} items - Array of items with price, quantity, and vatRate properties
 * @returns {Object} Object with totalBeforeVat, totalVat, and grandTotal
 */
const calculateOrderVat = (items) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return {
      totalBeforeVat: 0,
      totalVat: 0,
      grandTotal: 0
    };
  }

  let totalBeforeVat = 0;
  let totalVat = 0;

  items.forEach(item => {
    if (!item.price) return;

    const itemTotal = item.price * (item.quantity || 1);
    const vatRate = item.vatRate || 0;
    const breakdown = calculateVatBreakdown(itemTotal, vatRate);

    totalBeforeVat += breakdown.priceBeforeVat;
    totalVat += breakdown.vatAmount;
  });

  return {
    totalBeforeVat: Math.round(totalBeforeVat * 100) / 100,
    totalVat: Math.round(totalVat * 100) / 100,
    grandTotal: Math.round((totalBeforeVat + totalVat) * 100) / 100
  };
};

/**
 * Calculate VAT breakdown for items in an OrderItem structure
 * Useful for processing orders that already have product data
 *
 * @param {Array} orderItems - Array of OrderItem objects with related products
 * @returns {Object} Object with totalBeforeVat, totalVat, grandTotal, and itemBreakdowns
 */
const calculateOrderItemsVat = (orderItems) => {
  if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
    return {
      totalBeforeVat: 0,
      totalVat: 0,
      grandTotal: 0,
      itemBreakdowns: []
    };
  }

  let totalBeforeVat = 0;
  let totalVat = 0;
  const itemBreakdowns = [];

  orderItems.forEach(orderItem => {
    if (!orderItem.product) {
      console.warn('OrderItem missing product data');
      return;
    }

    const itemTotal = orderItem.product.price * orderItem.quantity;
    const vatProfile = orderItem.product.category?.vatProfile;
    const vatRate = vatProfile?.vatRate || 0;
    const breakdown = calculateVatBreakdown(itemTotal, vatRate);

    itemBreakdowns.push({
      productId: orderItem.product.id,
      productName: orderItem.product.name,
      quantity: orderItem.quantity,
      pricePerUnit: orderItem.product.price,
      priceBeforeVat: breakdown.priceBeforeVat,
      vat: breakdown.vatAmount,
      totalPrice: breakdown.totalPrice,
      profileId: vatProfile?.id,
      profile: vatProfile ? {
        id: vatProfile.id,
        name: vatProfile.name,
        nameIs: vatProfile.nameIs,
        vatRate: vatProfile.vatRate
      } : null
    });

    totalBeforeVat += breakdown.priceBeforeVat;
    totalVat += breakdown.vatAmount;
  });

  return {
    totalBeforeVat: Math.round(totalBeforeVat * 100) / 100,
    totalVat: Math.round(totalVat * 100) / 100,
    grandTotal: Math.round((totalBeforeVat + totalVat) * 100) / 100,
    itemBreakdowns
  };
};

/**
 * Format VAT information for display
 *
 * @param {number} totalPrice - Total price including VAT
 * @param {Object} vatProfile - The VAT profile object with name and vatRate
 * @param {string} currency - Currency code (default: 'ISK')
 * @returns {Object|null} Formatted VAT information or null if no vatProfile
 */
const formatVatInfo = (totalPrice, vatProfile, currency = 'ISK') => {
  if (!vatProfile) {
    return null;
  }

  const breakdown = calculateVatBreakdown(totalPrice, vatProfile.vatRate);

  return {
    profileName: vatProfile.name,
    profileNameIs: vatProfile.nameIs,
    vatRate: vatProfile.vatRate,
    description: vatProfile.description,
    descriptionIs: vatProfile.descriptionIs,
    priceBeforeVat: breakdown.priceBeforeVat,
    vatAmount: breakdown.vatAmount,
    totalPrice: breakdown.totalPrice,
    currency
  };
};

module.exports = {
  calculateVatBreakdown,
  getVatAmount,
  getPriceBeforeVat,
  calculateOrderVat,
  calculateOrderItemsVat,
  formatVatInfo
};
