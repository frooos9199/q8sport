/**
 * Performance optimization utilities for improving loading experience
 */

/**
 * Debounce function to prevent excessive API calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function to limit API call frequency
 * @param {Function} func - Function to throttle
 * @param {number} limit - Minimum time between calls in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit = 1000) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Create a promise with timeout
 * @param {Promise} promise - Promise to wrap
 * @param {number} timeout - Timeout in milliseconds
 * @param {string} timeoutMessage - Error message on timeout
 * @returns {Promise} Promise with timeout
 */
export const promiseWithTimeout = (promise, timeout = 15000, timeoutMessage = 'انتهت مهلة الطلب') => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(timeoutMessage)), timeout)
    )
  ]);
};

/**
 * Retry failed API calls with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delay - Initial delay in milliseconds
 * @returns {Promise} Result of the function
 */
export const retryWithBackoff = async (fn, maxRetries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (maxRetries <= 0) {
      throw error;
    }
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryWithBackoff(fn, maxRetries - 1, delay * 2);
  }
};

/**
 * Cache manager for API responses
 */
class CacheManager {
  constructor() {
    this.cache = new Map();
    this.timestamps = new Map();
  }

  /**
   * Get cached data if not expired
   * @param {string} key - Cache key
   * @param {number} maxAge - Maximum age in milliseconds (default: 5 minutes)
   * @returns {*} Cached data or null
   */
  get(key, maxAge = 5 * 60 * 1000) {
    const timestamp = this.timestamps.get(key);
    if (!timestamp || Date.now() - timestamp > maxAge) {
      this.delete(key);
      return null;
    }
    return this.cache.get(key);
  }

  /**
   * Set cached data
   * @param {string} key - Cache key
   * @param {*} data - Data to cache
   */
  set(key, data) {
    this.cache.set(key, data);
    this.timestamps.set(key, Date.now());
  }

  /**
   * Delete cached data
   * @param {string} key - Cache key
   */
  delete(key) {
    this.cache.delete(key);
    this.timestamps.delete(key);
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
    this.timestamps.clear();
  }
}

export const apiCache = new CacheManager();

/**
 * Create a cached API call
 * @param {Function} apiCall - Async API function
 * @param {string} cacheKey - Cache key
 * @param {number} cacheTime - Cache duration in milliseconds
 * @returns {Promise} Cached or fresh data
 */
export const cachedApiCall = async (apiCall, cacheKey, cacheTime = 5 * 60 * 1000) => {
  const cached = apiCache.get(cacheKey, cacheTime);
  if (cached) {
    return cached;
  }
  
  const data = await apiCall();
  apiCache.set(cacheKey, data);
  return data;
};

/**
 * Batch multiple API calls with a delay
 * @param {Array<Function>} apiCalls - Array of async API functions
 * @param {number} delay - Delay between calls in milliseconds
 * @returns {Promise<Array>} Results of all calls
 */
export const batchApiCalls = async (apiCalls, delay = 100) => {
  const results = [];
  for (const call of apiCalls) {
    const result = await call();
    results.push(result);
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  return results;
};

/**
 * Preload data in background
 * @param {Function} loadFunction - Function to load data
 * @param {number} delay - Delay before loading in milliseconds
 */
export const preloadData = (loadFunction, delay = 1000) => {
  setTimeout(() => {
    loadFunction().catch(error => {
      console.warn('Preload failed:', error);
    });
  }, delay);
};
