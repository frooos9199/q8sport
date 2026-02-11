/**
 * Safe JSON parsing utilities to prevent crashes from malformed data
 */

/**
 * Safely parse JSON with fallback value
 * @param {string} jsonString - The JSON string to parse
 * @param {*} fallback - Fallback value if parsing fails (default: null)
 * @returns {*} Parsed object or fallback value
 */
export const safeJSONParse = (jsonString, fallback = null) => {
  try {
    if (!jsonString || typeof jsonString !== 'string') {
      return fallback;
    }
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('JSON parse error:', error.message);
    return fallback;
  }
};

/**
 * Safely parse array of images from JSON
 * @param {string} imagesJSON - JSON string of images array
 * @returns {Array} Array of image URLs or empty array
 */
export const parseImages = (imagesJSON) => {
  const parsed = safeJSONParse(imagesJSON, []);
  return Array.isArray(parsed) ? parsed : [];
};

/**
 * Safely stringify JSON with error handling
 * @param {*} data - Data to stringify
 * @param {string} fallback - Fallback value if stringify fails
 * @returns {string} JSON string or fallback
 */
export const safeJSONStringify = (data, fallback = '{}') => {
  try {
    return JSON.stringify(data);
  } catch (error) {
    console.warn('JSON stringify error:', error.message);
    return fallback;
  }
};

/**
 * Parse product data with safe JSON handling
 * @param {Object} product - Product object with potential JSON fields
 * @returns {Object} Product with parsed fields
 */
export const parseProductData = (product) => {
  if (!product) return null;

  return {
    ...product,
    images: parseImages(product.images),
    specifications: safeJSONParse(product.specifications, {}),
    features: safeJSONParse(product.features, []),
  };
};
