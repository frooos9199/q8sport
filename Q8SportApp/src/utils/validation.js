/**
 * Validation utilities for Q8 Sport App
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email format
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} - {isValid: boolean, message: string}
 */
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: 'كلمة المرور مطلوبة' };
  }
  
  if (password.length < 6) {
    return { isValid: false, message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' };
  }
  
  if (password.length > 100) {
    return { isValid: false, message: 'كلمة المرور طويلة جداً' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate phone number (Kuwait format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid
 */
export const isValidKuwaitPhone = (phone) => {
  if (!phone) {
    return true; // Optional field
  }
  
  // Remove spaces and special characters
  const cleaned = phone.replace(/[\s\-()]/g, '');
  
  // Kuwait phone numbers: +965XXXXXXXX or 965XXXXXXXX or XXXXXXXX
  const kuwaitRegex = /^(\+?965)?[2456][0-9]{7}$/;
  return kuwaitRegex.test(cleaned);
};

/**
 * Validate name
 * @param {string} name - Name to validate
 * @returns {object} - {isValid: boolean, message: string}
 */
export const validateName = (name) => {
  if (!name || !name.trim()) {
    return { isValid: false, message: 'الاسم مطلوب' };
  }
  
  if (name.trim().length < 2) {
    return { isValid: false, message: 'الاسم يجب أن يكون حرفين على الأقل' };
  }
  
  if (name.trim().length > 100) {
    return { isValid: false, message: 'الاسم طويل جداً' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Sanitize email (trim and lowercase)
 * @param {string} email - Email to sanitize
 * @returns {string} - Sanitized email
 */
export const sanitizeEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return '';
  }
  return email.trim().toLowerCase();
};

/**
 * Format Kuwait phone number
 * @param {string} phone - Phone to format
 * @returns {string} - Formatted phone
 */
export const formatKuwaitPhone = (phone) => {
  if (!phone) {
    return '';
  }
  
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Add +965 prefix if not present and number is 8 digits
  if (cleaned.length === 8) {
    return `+965${cleaned}`;
  }
  
  // If starts with 965, add +
  if (cleaned.startsWith('965') && cleaned.length === 11) {
    return `+${cleaned}`;
  }
  
  return phone;
};
