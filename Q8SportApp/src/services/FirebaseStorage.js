import storage from '@react-native-firebase/storage';

/**
 * رفع صورة إلى Firebase Storage
 * @param {string} base64Image - الصورة بصيغة base64
 * @param {string} folder - المجلد (مثل: 'showcases', 'products')
 * @returns {Promise<string>} - رابط الصورة
 */
export const uploadImageToFirebase = async (base64Image, folder = 'showcases') => {
  try {
    // استخراج نوع الصورة من base64
    const matches = base64Image.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) {
      throw new Error('Invalid base64 image format');
    }

    const imageType = matches[1]; // jpg, png, etc
    const base64Data = matches[2];

    // إنشاء اسم فريد للملف
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    const fileName = `${folder}/${timestamp}_${randomId}.${imageType}`;

    // إنشاء مرجع للملف في Firebase Storage
    const reference = storage().ref(fileName);

    console.log(`📤 Uploading to Firebase Storage: ${fileName}`);

    // رفع الصورة (base64 string مباشرة)
    await reference.putString(base64Data, 'base64', {
      contentType: `image/${imageType}`,
    });

    // الحصول على رابط التحميل
    const downloadURL = await reference.getDownloadURL();
    
    console.log(`✅ Upload successful: ${downloadURL.substring(0, 60)}...`);
    
    return downloadURL;
  } catch (error) {
    console.error('❌ Firebase Storage upload error:', error);
    throw error;
  }
};

/**
 * رفع عدة صور إلى Firebase Storage
 * @param {string[]} base64Images - مصفوفة صور base64
 * @param {string} folder - المجلد
 * @returns {Promise<string[]>} - روابط الصور
 */
export const uploadMultipleImages = async (base64Images, folder = 'showcases') => {
  try {
    const uploadPromises = base64Images.map((image, index) => {
      // إذا كانت الصورة URL بالفعل، نرجعها كما هي
      if (image.startsWith('http://') || image.startsWith('https://')) {
        console.log(`✅ Image ${index + 1}: Already a URL, skipping upload`);
        return Promise.resolve(image);
      }
      
      // وإلا نرفعها
      console.log(`⬆️  Uploading image ${index + 1}/${base64Images.length}...`);
      return uploadImageToFirebase(image, folder);
    });

    const uploadedUrls = await Promise.all(uploadPromises);
    console.log(`✅ All ${uploadedUrls.length} images uploaded successfully`);
    
    return uploadedUrls;
  } catch (error) {
    console.error('❌ Error uploading multiple images:', error);
    throw error;
  }
};

/**
 * حذف صورة من Firebase Storage
 * @param {string} imageUrl - رابط الصورة
 */
export const deleteImageFromFirebase = async (imageUrl) => {
  try {
    const reference = storage().refFromURL(imageUrl);
    await reference.delete();
    console.log('✅ Image deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting image:', error);
    throw error;
  }
};

export default {
  uploadImageToFirebase,
  uploadMultipleImages,
  deleteImageFromFirebase,
};
