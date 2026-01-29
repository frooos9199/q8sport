/**
 * Input Validation Utilities
 * استخدم هذه الدوال للتحقق من صحة البيانات الواردة من المستخدم
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    return { isValid: false, error: 'البريد الإلكتروني مطلوب' };
  }
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'البريد الإلكتروني غير صحيح' };
  }
  
  return { isValid: true };
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: 'كلمة المرور مطلوبة' };
  }
  
  if (password.length < 6) {
    return { isValid: false, error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' };
  }
  
  return { isValid: true };
}

/**
 * Validate phone number (Kuwait format)
 */
export function validatePhone(phone: string): ValidationResult {
  const phoneRegex = /^(\+965)?[0-9]{8}$/;
  
  if (!phone) {
    return { isValid: false, error: 'رقم الهاتف مطلوب' };
  }
  
  const cleanPhone = phone.replace(/\s/g, '');
  
  if (!phoneRegex.test(cleanPhone)) {
    return { isValid: false, error: 'رقم الهاتف غير صحيح (يجب أن يكون 8 أرقام)' };
  }
  
  return { isValid: true };
}

/**
 * Validate price value
 */
export function validatePrice(price: number | string): ValidationResult {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numPrice)) {
    return { isValid: false, error: 'السعر يجب أن يكون رقماً صحيحاً' };
  }
  
  if (numPrice < 0) {
    return { isValid: false, error: 'السعر لا يمكن أن يكون سالباً' };
  }
  
  if (numPrice > 1000000) {
    return { isValid: false, error: 'السعر مرتفع جداً' };
  }
  
  return { isValid: true };
}

/**
 * Validate text length
 */
export function validateTextLength(
  text: string, 
  minLength: number, 
  maxLength: number,
  fieldName: string = 'النص'
): ValidationResult {
  if (!text) {
    return { isValid: false, error: `${fieldName} مطلوب` };
  }
  
  if (text.length < minLength) {
    return { isValid: false, error: `${fieldName} يجب أن يكون ${minLength} أحرف على الأقل` };
  }
  
  if (text.length > maxLength) {
    return { isValid: false, error: `${fieldName} يجب أن لا يتجاوز ${maxLength} حرف` };
  }
  
  return { isValid: true };
}

/**
 * Validate file size (in bytes)
 */
export function validateFileSize(fileSize: number, maxSize: number = 5 * 1024 * 1024): ValidationResult {
  if (fileSize > maxSize) {
    const maxSizeMB = Math.floor(maxSize / (1024 * 1024));
    return { isValid: false, error: `حجم الملف يجب أن لا يتجاوز ${maxSizeMB} ميجابايت` };
  }
  
  return { isValid: true };
}

/**
 * Validate image file type
 */
export function validateImageType(filename: string): ValidationResult {
  const allowedTypes = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
  const extension = filename.split('.').pop()?.toLowerCase();
  
  if (!extension || !allowedTypes.includes(extension)) {
    return { isValid: false, error: 'نوع الملف غير مدعوم (jpg, png, webp, gif فقط)' };
  }
  
  return { isValid: true };
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate year (for car years)
 */
export function validateYear(year: number | string): ValidationResult {
  const numYear = typeof year === 'string' ? parseInt(year) : year;
  const currentYear = new Date().getFullYear();
  
  if (isNaN(numYear)) {
    return { isValid: false, error: 'السنة يجب أن تكون رقماً صحيحاً' };
  }
  
  if (numYear < 1900 || numYear > currentYear + 1) {
    return { isValid: false, error: `السنة يجب أن تكون بين 1900 و ${currentYear + 1}` };
  }
  
  return { isValid: true };
}

/**
 * Validate kilometers
 */
export function validateKilometers(km: number | string): ValidationResult {
  const numKm = typeof km === 'string' ? parseInt(km) : km;
  
  if (isNaN(numKm)) {
    return { isValid: false, error: 'الكيلومترات يجب أن تكون رقماً صحيحاً' };
  }
  
  if (numKm < 0) {
    return { isValid: false, error: 'الكيلومترات لا يمكن أن تكون سالبة' };
  }
  
  if (numKm > 1000000) {
    return { isValid: false, error: 'الكيلومترات مرتفعة جداً' };
  }
  
  return { isValid: true };
}

/**
 * Validate required field
 */
export function validateRequired(value: unknown, fieldName: string = 'الحقل'): ValidationResult {
  if (value === null || value === undefined || value === '') {
    return { isValid: false, error: `${fieldName} مطلوب` };
  }
  
  return { isValid: true };
}

/**
 * Validate multiple fields at once
 */
export function validateMultiple(
  validations: Array<() => ValidationResult>
): ValidationResult {
  for (const validate of validations) {
    const result = validate();
    if (!result.isValid) {
      return result;
    }
  }
  
  return { isValid: true };
}
