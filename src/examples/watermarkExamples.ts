/**
 * مثال على كيفية استخدام العلامة المائية في أجزاء مختلفة من التطبيق
 */

import { addWatermarkToImage, addWatermarkToImages } from '@/utils/imageWatermark';

// مثال 1: رفع صورة واحدة مع العلامة المائية
async function handleSingleImageUpload(file: File) {
  try {
    const watermarkedImage = await addWatermarkToImage(file, {
      text: 'Q8 MAZAD SPORT',
      fontSize: 24,
      opacity: 0.8,
      position: 'bottom-right',
      color: 'rgba(255, 255, 255, 0.9)',
      enableBackground: true, // تفعيل الخلفية المائية
      backgroundOpacity: 0.06 // شفافية الخلفية
    });
    
    console.log('تم إضافة العلامة المائية بنجاح');
    return watermarkedImage;
  } catch (error) {
    console.error('فشل في إضافة العلامة المائية:', error);
    return file; // في حالة الفشل، ارجع الصورة الأصلية
  }
}

// مثال 2: رفع عدة صور مع العلامة المائية
async function handleMultipleImageUpload(files: FileList) {
  const imageFiles = Array.from(files).filter(file => 
    file.type.startsWith('image/')
  );
  
  try {
    const watermarkedImages = await addWatermarkToImages(imageFiles, {
      text: 'Q8 MAZAD SPORT',
      fontSize: 28,
      opacity: 0.7,
      position: 'bottom-right',
      enableBackground: true,
      backgroundOpacity: 0.05
    });
    
    console.log(`تم إضافة العلامة المائية لـ ${watermarkedImages.length} صورة`);
    return watermarkedImages;
  } catch (error) {
    console.error('فشل في معالجة الصور:', error);
    return imageFiles;
  }
}

// مثال 3: إعدادات مخصصة للعلامة المائية حسب نوع الصورة
function getWatermarkSettings(imageType: string, fileSize: number) {
  const baseSettings = {
    text: 'Q8 MAZAD SPORT',
    opacity: 0.8,
    color: 'rgba(255, 255, 255, 0.9)'
  };

  // إعدادات حسب حجم الملف
  if (fileSize > 1024 * 1024) { // أكبر من 1MB
    return {
      ...baseSettings,
      fontSize: 32,
      position: 'bottom-right' as const
    };
  } else if (fileSize > 500 * 1024) { // أكبر من 500KB
    return {
      ...baseSettings,
      fontSize: 24,
      position: 'bottom-right' as const
    };
  } else {
    return {
      ...baseSettings,
      fontSize: 18,
      position: 'bottom-left' as const
    };
  }
}

// مثال 4: استخدام في نموذج HTML
function createImageUploadForm() {
  const handleFormSubmit = async (event: Event) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const file = formData.get('image') as File;
    
    if (file && file.type.startsWith('image/')) {
      const settings = getWatermarkSettings(file.type, file.size);
      const watermarkedFile = await addWatermarkToImage(file, settings);
      
      // رفع الصورة المعدلة إلى الخادم
      const uploadData = new FormData();
      uploadData.append('image', watermarkedFile);
      
      // إرسال البيانات...
    }
  };
  
  return `
    <form onsubmit="handleFormSubmit(event)">
      <input type="file" name="image" accept="image/*" required>
      <button type="submit">رفع الصورة</button>
    </form>
  `;
}

// مثال 5: معالجة الصور في سياق مختلف
export const imageContexts = {
  // للإعلانات
  advertisements: {
    text: 'Q8 MAZAD SPORT',
    fontSize: 28,
    opacity: 0.8,
    position: 'bottom-right' as const,
    color: 'rgba(255, 255, 255, 0.9)',
    enableBackground: true,
    backgroundOpacity: 0.06
  },
  
  // لصور قطع الغيار
  carParts: {
    text: 'Q8 MAZAD SPORT',
    fontSize: 24,
    opacity: 0.7,
    position: 'bottom-left' as const,
    color: 'rgba(0, 0, 0, 0.8)',
    enableBackground: true,
    backgroundOpacity: 0.04
  },
  
  // لصور الملف الشخصي
  profile: {
    text: 'Q8 MAZAD SPORT',
    fontSize: 20,
    opacity: 0.6,
    position: 'center' as const,
    color: 'rgba(255, 255, 255, 0.7)',
    enableBackground: true,
    backgroundOpacity: 0.03
  }
};

export {
  handleSingleImageUpload,
  handleMultipleImageUpload,
  getWatermarkSettings,
  createImageUploadForm
};