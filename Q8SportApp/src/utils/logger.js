/**
 * Logger utility for development and production
 * Automatically disables logs in production builds
 */

const isDevelopment = __DEV__;

export const Logger = {
  /**
   * Log info messages (only in development)
   */
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  /**
   * Log info messages with prefix (only in development)
   */
  info: (...args) => {
    if (isDevelopment) {
      console.info('ℹ️ [INFO]', ...args);
    }
  },

  /**
   * Log warning messages
   */
  warn: (...args) => {
    if (isDevelopment) {
      console.warn('⚠️ [WARN]', ...args);
    }
  },

  /**
   * Log error messages (always logged)
   */
  error: (...args) => {
    console.error('❌ [ERROR]', ...args);
  },

  /**
   * Log debug messages (only in development)
   */
  debug: (...args) => {
    if (isDevelopment) {
      console.debug('🐛 [DEBUG]', ...args);
    }
  },

  /**
   * Log API requests (only in development)
   */
  api: (method, url, data) => {
    if (isDevelopment) {
      console.log(`🌐 [API] ${method} ${url}`, data || '');
    }
  },

  /**
   * Log API errors
   */
  apiError: (method, url, error) => {
    console.error(`🔴 [API ERROR] ${method} ${url}`, error);
  },

  /**
   * Log navigation events (only in development)
   */
  navigation: (screen, params) => {
    if (isDevelopment) {
      console.log(`📱 [NAV] → ${screen}`, params || '');
    }
  },

  /**
   * Log auth events
   */
  auth: (event, details) => {
    if (isDevelopment) {
      console.log(`🔐 [AUTH] ${event}`, details || '');
    }
  },
};

export default Logger;
