// Error Messages - Arabic
export const ERROR_MESSAGES = {
  // Network Errors
  NETWORK_ERROR: 'فشل الاتصال بالإنترنت. تحقق من اتصالك وحاول مرة أخرى.',
  TIMEOUT_ERROR: 'انتهى وقت الطلب. يرجى المحاولة مرة أخرى.',
  SERVER_ERROR: 'حدث خطأ في الخادم. يرجى المحاولة لاحقاً.',
  
  // Authentication Errors
  AUTH_FAILED: 'فشل تسجيل الدخول. تحقق من البريد الإلكتروني وكلمة المرور.',
  INVALID_CREDENTIALS: 'البيانات غير صحيحة. يرجى المحاولة مرة أخرى.',
  UNAUTHORIZED: 'يجب تسجيل الدخول أولاً للوصول إلى هذه الصفحة.',
  SESSION_EXPIRED: 'انتهت جلستك. يرجى تسجيل الدخول مرة أخرى.',
  TOKEN_INVALID: 'جلستك غير صالحة. يرجى تسجيل الدخول مرة أخرى.',
  
  // Validation Errors
  VALIDATION_ERROR: 'يرجى التحقق من البيانات المُدخلة.',
  REQUIRED_FIELD: 'هذا الحقل مطلوب.',
  INVALID_EMAIL: 'البريد الإلكتروني غير صحيح.',
  INVALID_PHONE: 'رقم الهاتف غير صحيح.',
  PASSWORD_TOO_SHORT: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.',
  PASSWORDS_DONT_MATCH: 'كلمات المرور غير متطابقة.',
  
  // Resource Errors
  NOT_FOUND: 'العنصر المطلوب غير موجود.',
  ALREADY_EXISTS: 'هذا العنصر موجود مسبقاً.',
  DELETED: 'تم حذف هذا العنصر.',
  
  // Permission Errors
  FORBIDDEN: 'ليس لديك صلاحية للقيام بهذا الإجراء.',
  ADMIN_ONLY: 'هذه الميزة متاحة للمسؤولين فقط.',
  
  // Upload Errors
  UPLOAD_FAILED: 'فشل رفع الملف. يرجى المحاولة مرة أخرى.',
  FILE_TOO_LARGE: 'حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت.',
  INVALID_FILE_TYPE: 'نوع الملف غير مدعوم. يرجى رفع صورة.',
  
  // Generic Errors
  UNKNOWN_ERROR: 'حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.',
  TRY_AGAIN: 'حدث خطأ. يرجى المحاولة مرة أخرى.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'تم تسجيل الدخول بنجاح!',
  REGISTER_SUCCESS: 'تم إنشاء الحساب بنجاح!',
  LOGOUT_SUCCESS: 'تم تسجيل الخروج بنجاح.',
  UPDATE_SUCCESS: 'تم التحديث بنجاح!',
  DELETE_SUCCESS: 'تم الحذف بنجاح!',
  UPLOAD_SUCCESS: 'تم الرفع بنجاح!',
  SAVE_SUCCESS: 'تم الحفظ بنجاح!',
  SEND_SUCCESS: 'تم الإرسال بنجاح!',
};

// Info Messages
export const INFO_MESSAGES = {
  LOADING: 'جاري التحميل...',
  UPLOADING: 'جاري الرفع...',
  SAVING: 'جاري الحفظ...',
  DELETING: 'جاري الحذف...',
  PROCESSING: 'جاري المعالجة...',
  PLEASE_WAIT: 'يرجى الانتظار...',
};

// Helper function to get error message
export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }
  
  if (error?.response?.status === 401) {
    return ERROR_MESSAGES.UNAUTHORIZED;
  }
  
  if (error?.response?.status === 403) {
    return ERROR_MESSAGES.FORBIDDEN;
  }
  
  if (error?.response?.status === 404) {
    return ERROR_MESSAGES.NOT_FOUND;
  }
  
  if (error?.response?.status === 500) {
    return ERROR_MESSAGES.SERVER_ERROR;
  }
  
  if (error?.message === 'Network Error') {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }
  
  if (error?.code === 'ECONNABORTED') {
    return ERROR_MESSAGES.TIMEOUT_ERROR;
  }
  
  return ERROR_MESSAGES.UNKNOWN_ERROR;
};

export default {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  INFO_MESSAGES,
  getErrorMessage,
};
