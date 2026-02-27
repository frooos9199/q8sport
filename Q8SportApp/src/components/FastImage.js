import React from 'react';
import { Image } from 'react-native';

/**
 * Optimized Image Component with caching
 * يحسن أداء الصور بشكل كبير
 */
const FastImage = ({ 
  source, 
  style, 
  resizeMode = 'cover',
  ...props 
}) => {
  return (
    <Image
      source={source}
      style={style}
      resizeMode={resizeMode}
      // Performance optimizations
      fadeDuration={100} // تقليل مدة الـ fade
      progressiveRenderingEnabled={true} // تحميل تدريجي
      cachePolicy="memory-disk" // كاش قوي
      {...props}
    />
  );
};

export default React.memo(FastImage);
