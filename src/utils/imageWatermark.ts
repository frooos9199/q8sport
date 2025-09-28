'use client';

// وظيفة لإضافة خلفية مائية متكررة
const addBackgroundWatermark = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  text: string,
  fontSize: number,
  backgroundOpacity: number = 0.08
) => {
  // حفظ الحالة الحالية
  ctx.save();
  
  // إعدادات الخلفية المائية
  const backgroundFontSize = Math.max(fontSize * 0.8, 18); // حجم مناسب للخلفية
  ctx.font = `300 ${backgroundFontSize}px Arial, sans-serif`; // وزن خط أخف
  ctx.fillStyle = `rgba(255, 255, 255, ${backgroundOpacity})`; // شفافية قابلة للتخصيص
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // حساب المسافات
  const textMetrics = ctx.measureText(text);
  const textWidth = textMetrics.width;
  const textHeight = backgroundFontSize;
  
  // المسافة بين النصوص
  const spacingX = textWidth + 80;
  const spacingY = textHeight + 60;
  
  // تدوير النص بزاوية مائلة
  ctx.rotate(-Math.PI / 8); // 22.5 درجة
  
  // حساب نقطة البداية مع مراعاة التدوير
  const startX = -width;
  const startY = -height;
  const endX = width * 2;
  const endY = height * 2;
  
  // رسم النص بشكل متكرر عبر كامل الصورة
  for (let x = startX; x < endX; x += spacingX) {
    for (let y = startY; y < endY; y += spacingY) {
      // إضافة تأثير ظل خفيف للخلفية
      ctx.shadowColor = 'rgba(0, 0, 0, 0.02)';
      ctx.shadowBlur = 1;
      ctx.fillText(text, x, y);
    }
  }
  
  // استعادة الحالة
  ctx.restore();
};

export interface WatermarkOptions {
  text?: string;
  fontSize?: number;
  opacity?: number;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
  color?: string;
  fontFamily?: string;
  enableBackground?: boolean; // خيار لتمكين الخلفية المائية
  backgroundOpacity?: number; // شفافية الخلفية المائية
}

export const addWatermarkToImage = (
  file: File,
  options: WatermarkOptions = {}
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const {
      text = 'Q8 MAZAD SPORT',
      fontSize = 24,
      opacity = 0.7,
      position = 'bottom-right',
      color = 'rgba(255, 255, 255, 0.9)',
      fontFamily = 'Arial, sans-serif',
      enableBackground = true, // تمكين الخلفية افتراضياً
      backgroundOpacity = 0.08 // شفافية منخفضة للخلفية
    } = options;

    // إنشاء عنصر صورة
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('فشل في إنشاء سياق الرسم'));
      return;
    }

    img.onload = () => {
      // تعيين حجم الكانفاس مطابق للصورة
      canvas.width = img.width;
      canvas.height = img.height;

      // رسم الصورة الأصلية
      ctx.drawImage(img, 0, 0);

      // إضافة خلفية مائية متكررة إذا كانت مُفعلة
      if (enableBackground) {
        addBackgroundWatermark(ctx, canvas.width, canvas.height, text, fontSize, backgroundOpacity);
      }

      // إعداد النص الرئيسي
      ctx.font = `bold ${fontSize}px ${fontFamily}`;
      ctx.fillStyle = color;
      ctx.globalAlpha = opacity;

      // قياس النص
      const textMetrics = ctx.measureText(text);
      const textWidth = textMetrics.width;
      const textHeight = fontSize;

      // حساب موضع النص
      let x: number, y: number;
      const padding = 20;

      switch (position) {
        case 'bottom-right':
          x = canvas.width - textWidth - padding;
          y = canvas.height - padding;
          break;
        case 'bottom-left':
          x = padding;
          y = canvas.height - padding;
          break;
        case 'top-right':
          x = canvas.width - textWidth - padding;
          y = textHeight + padding;
          break;
        case 'top-left':
          x = padding;
          y = textHeight + padding;
          break;
        case 'center':
          x = (canvas.width - textWidth) / 2;
          y = canvas.height / 2;
          break;
        default:
          x = canvas.width - textWidth - padding;
          y = canvas.height - padding;
      }

      // إضافة تأثير الظل للنص
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      // رسم النص
      ctx.fillText(text, x, y);

      // تحويل الكانفاس إلى blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // إنشاء ملف جديد مع العلامة المائية
            const watermarkedFile = new File(
              [blob],
              `watermarked_${file.name}`,
              {
                type: file.type,
                lastModified: Date.now()
              }
            );
            resolve(watermarkedFile);
          } else {
            reject(new Error('فشل في تحويل الصورة'));
          }
        },
        file.type,
        0.9 // جودة الصورة
      );
    };

    img.onerror = () => {
      reject(new Error('فشل في تحميل الصورة'));
    };

    // تحميل الصورة
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        img.src = e.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  });
};

// وظيفة لمعالجة عدة صور
export const addWatermarkToImages = async (
  files: File[],
  options?: WatermarkOptions
): Promise<File[]> => {
  const watermarkedFiles: File[] = [];
  
  for (const file of files) {
    try {
      const watermarkedFile = await addWatermarkToImage(file, options);
      watermarkedFiles.push(watermarkedFile);
    } catch (error) {
      console.error(`فشل في إضافة العلامة المائية للصورة ${file.name}:`, error);
      // في حالة الفشل، استخدم الصورة الأصلية
      watermarkedFiles.push(file);
    }
  }
  
  return watermarkedFiles;
};

// وظيفة للتحقق من أن الملف صورة
export const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/');
};