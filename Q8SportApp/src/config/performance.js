/**
 * ⚡ Performance Configuration
 * تحسينات الأداء لجعل التطبيق سريع البرق
 */

// FlatList Optimization Props
export const FLATLIST_OPTIMIZATIONS = {
  // تحميل البيانات بكفاءة
  initialNumToRender: 6, // عدد العناصر الأولية
  maxToRenderPerBatch: 10, // عدد التحميل في الدفعة
  windowSize: 5, // حجم النافذة
  
  // تحسينات الذاكرة
  removeClippedSubviews: true, // إزالة العناصر غير المرئية
  
  // تحديثات أسرع
  updateCellsBatchingPeriod: 50, // ms
  
  // استخراج المفاتيح
  keyExtractor: (item, index) => item?.id?.toString() || index.toString(),
  
  // تحسين العرض
  getItemLayout: null, // يمكن تخصيصه لكل قائمة
};

// Image Performance Props
export const IMAGE_OPTIMIZATIONS = {
  // تقليل وقت التحميل
  fadeDuration: 100,
  
  // التحميل التدريجي
  progressiveRenderingEnabled: true,
  
  // كاش قوي
  cache: 'force-cache',
  
  // حجم الصور
  defaultSource: require('../assets/placeholder.png'), // placeholder افتراضي
};

// Animation Durations (أقصر = أسرع)
export const ANIMATION_DURATIONS = {
  fast: 150,
  normal: 250,
  slow: 350,
};

// Network Timeouts
export const NETWORK_CONFIG = {
  timeout: 10000, // 10 ثواني
  retries: 2,
};

// Cache Durations (بالملي ثانية)
export const CACHE_DURATIONS = {
  short: 5 * 60 * 1000, // 5 دقائق
  medium: 30 * 60 * 1000, // 30 دقيقة
  long: 24 * 60 * 60 * 1000, // 24 ساعة
};

export default {
  FLATLIST_OPTIMIZATIONS,
  IMAGE_OPTIMIZATIONS,
  ANIMATION_DURATIONS,
  NETWORK_CONFIG,
  CACHE_DURATIONS,
};
