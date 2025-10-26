/**
 * VAT (Value Added Tax) Utilities
 *
 * These utilities calculate VAT amounts from prices that include VAT.
 * Since all prices in the system are stored with VAT included, we need
 * to reverse-calculate the VAT amount and price before VAT.
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
export const calculateVatBreakdown = (totalPrice, vatRate) => {
  if (!totalPrice || !vatRate || vatRate < 0) {
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
export const getVatAmount = (totalPrice, vatRate) => {
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
export const getPriceBeforeVat = (totalPrice, vatRate) => {
  const breakdown = calculateVatBreakdown(totalPrice, vatRate);
  return breakdown.priceBeforeVat;
};

/**
 * Calculate total VAT for a cart/order with multiple items
 *
 * @param {Array} items - Array of items with price and vatRate properties
 * @returns {Object} Object with totalBeforeVat, totalVat, and grandTotal
 */
export const calculateOrderVat = (items) => {
  if (!items || !Array.isArray(items)) {
    return {
      totalBeforeVat: 0,
      totalVat: 0,
      grandTotal: 0
    };
  }

  let totalBeforeVat = 0;
  let totalVat = 0;

  items.forEach(item => {
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
 * Format VAT information for display
 *
 * @param {number} totalPrice - Total price including VAT
 * @param {Object} vatProfile - The VAT profile object with name and vatRate
 * @param {string} currency - Currency code (default: 'ISK')
 * @returns {Object} Formatted VAT information
 */
export const formatVatInfo = (totalPrice, vatProfile, currency = 'ISK') => {
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

export default {
  calculateVatBreakdown,
  getVatAmount,
  getPriceBeforeVat,
  calculateOrderVat,
  formatVatInfo
};
