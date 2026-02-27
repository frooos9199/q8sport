/**
 * ⚡ Performance Utilities
 * دوال مساعدة لتحسين الأداء
 */

/**
 * Debounce - تأخير تنفيذ الدالة حتى يتوقف المستخدم عن الكتابة/الحركة
 * مفيد للبحث، الفلاتر، إلخ
 */
export const debounce = (func, delay = 300) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Throttle - تنفيذ الدالة مرة واحدة فقط في فترة زمنية محددة
 * مفيد للـ scroll events
 */
export const throttle = (func, limit = 100) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Cache للبيانات - تخزين مؤقت بسيط
 */
class SimpleCache {
  constructor(ttl = 5 * 60 * 1000) {
    // 5 دقائق افتراضياً
    this.cache = new Map();
    this.ttl = ttl;
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    const age = Date.now() - item.timestamp;
    if (age > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  clear() {
    this.cache.clear();
  }

  has(key) {
    const item = this.get(key);
    return item !== null;
  }
}

export const dataCache = new SimpleCache();

/**
 * معرفة إذا كان الجهاز بطيء
 */
export const isLowEndDevice = () => {
  // يمكن تحسين هذه الدالة بناءً على مواصفات الجهاز
  return false; // افتراضياً
};

/**
 * Batch Updates - تجميع التحديثات
 */
export const batchUpdates = (updates) => {
  requestAnimationFrame(() => {
    updates.forEach((update) => update());
  });
};

/**
 * تحسين الصور - إرجاع URL بحجم مناسب
 */
export const optimizeImageUrl = (url, width = 400) => {
  // إذا كان Cloudinary أو CDN يدعم التحسين التلقائي
  if (url?.includes('cloudinary')) {
    return url.replace('/upload/', `/upload/w_${width},c_scale,q_auto/`);
  }
  return url;
};

/**
 * Deep Equal - مقارنة عميقة للكائنات
 * مفيد للـ React.memo
 */
export const deepEqual = (obj1, obj2) => {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
};

export default {
  debounce,
  throttle,
  dataCache,
  isLowEndDevice,
  batchUpdates,
  optimizeImageUrl,
  deepEqual,
};
