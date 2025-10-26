const prisma = require('../config/database');

/**
 * Fetch VAT settings from database
 */
const getVATSettings = async () => {
  const settings = await prisma.setting.findMany({
    where: { category: 'VAT' }
  });

  // Convert to object for easier access
  const vatSettings = {};
  settings.forEach(setting => {
    if (setting.key === 'vatRate' || setting.key === 'vatDisplayInAdmin') {
      vatSettings[setting.key] = parseInt(setting.value);
    } else {
      vatSettings[setting.key] = setting.value === 'true';
    }
  });

  return {
    enabled: vatSettings.vatEnabled ?? true,
    rate: vatSettings.vatRate ?? 24,
    country: vatSettings.vatCountry ?? 'IS',
    displayInAdmin: vatSettings.vatDisplayInAdmin ?? true,
    includeInCustomerPrice: vatSettings.vatIncludeInCustomerPrice ?? true,
    showBreakdown: vatSettings.vatShowBreakdown ?? true,
  };
};

/**
 * Get VAT rate for a category (uses profile if assigned, otherwise fallback to legacy rate or default)
 * @param {number} categoryId - Category ID
 * @param {number} defaultRate - Default VAT rate
 * @returns {number} VAT rate for the category
 */
const getCategoryVatRate = async (categoryId, defaultRate = 24) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        vatProfile: {
          select: { vatRate: true }
        }
      }
    });

    if (!category) {
      return defaultRate;
    }

    // Use profile rate if assigned
    if (category.vatProfile) {
      return category.vatProfile.vatRate;
    }

    // Fallback to legacy category VAT rate
    if (category.vatRate) {
      return category.vatRate;
    }

    // Use default
    return defaultRate;
  } catch (error) {
    console.error(`Error getting VAT rate for category ${categoryId}:`, error);
    return defaultRate;
  }
};

/**
 * Calculate VAT amount
 * @param {number} amount - Amount before VAT
 * @param {number} rate - VAT rate percentage (e.g., 24)
 * @returns {number} VAT amount
 */
const calculateVATAmount = (amount, rate) => {
  return Math.round(amount * (rate / 100));
};

/**
 * Apply VAT to amount
 * @param {number} amount - Amount before VAT
 * @param {number} rate - VAT rate percentage
 * @returns {object} { amountBeforeVat, vatAmount, amountWithVat }
 */
const applyVAT = (amount, rate) => {
  const amountBeforeVat = amount;
  const vatAmount = calculateVATAmount(amountBeforeVat, rate);
  const amountWithVat = amountBeforeVat + vatAmount;

  return {
    amountBeforeVat,
    vatAmount,
    amountWithVat,
    vatRate: rate
  };
};

/**
 * Calculate order totals with VAT (supports category-based rates)
 * @param {array} items - Order items with price and categoryVatRate (optional)
 * @param {number} shippingCost - Shipping cost (before VAT)
 * @param {number} defaultVatRate - Default VAT rate percentage
 * @returns {object} Detailed breakdown
 */
const calculateOrderTotals = (items, shippingCost, defaultVatRate) => {
  // Calculate subtotal and VAT for each item based on category rate or default
  let itemsSubtotal = 0;
  let taxAmount = 0;

  items.forEach((item) => {
    const itemSubtotal = item.price * item.quantity;
    itemsSubtotal += itemSubtotal;

    // Use category-specific VAT rate if available, otherwise use default
    const vatRate = item.categoryVatRate !== null && item.categoryVatRate !== undefined
      ? item.categoryVatRate
      : defaultVatRate;

    const itemTax = calculateVATAmount(itemSubtotal, vatRate);
    taxAmount += itemTax;
  });

  // Total with VAT
  const totalAmount = itemsSubtotal + taxAmount + shippingCost;

  return {
    itemsSubtotal,
    shippingCost,
    subtotalBeforeVat: itemsSubtotal,
    taxAmount,
    totalAmount,
    vatRate: defaultVatRate // Return default rate for storage
  };
};

module.exports = {
  getVATSettings,
  getCategoryVatRate,
  calculateVATAmount,
  applyVAT,
  calculateOrderTotals
};
