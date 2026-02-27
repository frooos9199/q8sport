import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * ⚡ usePerformanceMonitor
 * Hook لمراقبة أداء الشاشات
 */
export const usePerformanceMonitor = (screenName) => {
  const mountTime = useRef(Date.now());
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;

    // قياس وقت التحميل
    const loadTime = Date.now() - mountTime.current;
    
    if (__DEV__) {
      console.log(`📊 [${screenName}] Load Time: ${loadTime}ms`);
      console.log(`📊 [${screenName}] Render Count: ${renderCount.current}`);
    }

    return () => {
      if (__DEV__) {
        const sessionTime = Date.now() - mountTime.current;
        console.log(`📊 [${screenName}] Session Time: ${sessionTime}ms`);
      }
    };
  }, [screenName]);

  return {
    loadTime: Date.now() - mountTime.current,
    renderCount: renderCount.current,
  };
};

/**
 * ⚡ useDebounce
 * Hook للـ debouncing
 */
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

/**
 * ⚡ useThrottle
 * Hook للـ throttling
 */
export const useThrottle = (callback, delay = 100) => {
  const lastRan = useRef(Date.now());

  return useCallback(
    (...args) => {
      if (Date.now() - lastRan.current >= delay) {
        callback(...args);
        lastRan.current = Date.now();
      }
    },
    [callback, delay]
  );
};

/**
 * ⚡ useMemoizedValue
 * حفظ القيمة في الذاكرة مع تحقق عميق
 */
export const useMemoizedValue = (value) => {
  const ref = useRef();

  if (JSON.stringify(ref.current) !== JSON.stringify(value)) {
    ref.current = value;
  }

  return ref.current;
};

export default {
  usePerformanceMonitor,
  useDebounce,
  useThrottle,
  useMemoizedValue,
};
