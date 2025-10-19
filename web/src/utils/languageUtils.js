// Utility functions for handling bilingual content based on current language

/**
 * Get the appropriate text based on current language
 * @param {string} currentLanguage - Current language ('is' or 'en')
 * @param {string} icelandicText - Icelandic text
 * @param {string} englishText - English text
 * @returns {string} - The text in the current language
 */
export const getLocalizedText = (currentLanguage, icelandicText, englishText) => {
  if (currentLanguage === 'is') {
    return icelandicText || englishText || '';
  } else {
    return englishText || icelandicText || '';
  }
};

/**
 * Get the appropriate array based on current language
 * @param {string} currentLanguage - Current language ('is' or 'en')
 * @param {Array} icelandicArray - Icelandic array
 * @param {Array} englishArray - English array
 * @returns {Array} - The array in the current language
 */
export const getLocalizedArray = (currentLanguage, icelandicArray, englishArray) => {
  if (currentLanguage === 'is') {
    // If Icelandic array exists and has content, use it, otherwise fall back to English
    return (icelandicArray && icelandicArray.length > 0) ? icelandicArray : (englishArray || []);
  } else {
    // If English array exists and has content, use it, otherwise fall back to Icelandic
    return (englishArray && englishArray.length > 0) ? englishArray : (icelandicArray || []);
  }
};

/**
 * Get product name based on current language
 * @param {string} currentLanguage - Current language ('is' or 'en')
 * @param {Object} product - Product object
 * @returns {string} - The product name in the current language
 */
export const getProductName = (currentLanguage, product) => {
  return getLocalizedText(currentLanguage, product.nameIs, product.name);
};

/**
 * Get product description based on current language
 * @param {string} currentLanguage - Current language ('is' or 'en')
 * @param {Object} product - Product object
 * @returns {string} - The product description in the current language
 */
export const getProductDescription = (currentLanguage, product) => {
  return getLocalizedText(currentLanguage, product.descriptionIs, product.description);
};

/**
 * Get product volume based on current language
 * @param {string} currentLanguage - Current language ('is' or 'en')
 * @param {Object} product - Product object
 * @returns {string} - The product volume in the current language
 */
export const getProductVolume = (currentLanguage, product) => {
  return getLocalizedText(currentLanguage, product.volumeIs, product.volume);
};

/**
 * Get product country based on current language
 * @param {string} currentLanguage - Current language ('is' or 'en')
 * @param {Object} product - Product object
 * @returns {string} - The product country in the current language
 */
export const getProductCountry = (currentLanguage, product) => {
  return getLocalizedText(currentLanguage, product.countryIs, product.country);
};

/**
 * Get product producer based on current language
 * @param {string} currentLanguage - Current language ('is' or 'en')
 * @param {Object} product - Product object
 * @returns {string} - The product producer in the current language
 */
export const getProductProducer = (currentLanguage, product) => {
  return getLocalizedText(currentLanguage, product.producerIs, product.producer);
};

/**
 * Get product packaging based on current language
 * @param {string} currentLanguage - Current language ('is' or 'en')
 * @param {Object} product - Product object
 * @returns {string} - The product packaging in the current language
 */
export const getProductPackaging = (currentLanguage, product) => {
  return getLocalizedText(currentLanguage, product.packagingIs, product.packaging);
};

/**
 * Get product availability based on current language
 * @param {string} currentLanguage - Current language ('is' or 'en')
 * @param {Object} product - Product object
 * @returns {string} - The product availability in the current language
 */
export const getProductAvailability = (currentLanguage, product) => {
  return getLocalizedText(currentLanguage, product.availabilityIs, product.availability);
};

/**
 * Get product food pairings based on current language
 * @param {string} currentLanguage - Current language ('is' or 'en')
 * @param {Object} product - Product object
 * @returns {Array} - The product food pairings in the current language
 */
export const getProductFoodPairings = (currentLanguage, product) => {
  return getLocalizedArray(currentLanguage, product.foodPairingsIs, product.foodPairings);
};

/**
 * Get product special attributes based on current language
 * @param {string} currentLanguage - Current language ('is' or 'en')
 * @param {Object} product - Product object
 * @returns {Array} - The product special attributes in the current language
 */
export const getProductSpecialAttributes = (currentLanguage, product) => {
  return getLocalizedArray(currentLanguage, product.specialAttributesIs, product.specialAttributes);
};