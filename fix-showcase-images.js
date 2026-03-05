const { PrismaClient } = require('@prisma/client');
const { v2: cloudinary } = require('cloudinary');
require('dotenv').config({ path: '.env.local' });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const prisma = new PrismaClient();

async function uploadToCloudinary(base64Image) {
  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: process.env.CLOUDINARY_FOLDER || 'q8sport',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });
    return result.secure_url;
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error.message);
    return null;
  }
}

async function fixShowcaseImages() {
  try {
    console.log('\n🔧 بدء إصلاح صور السيارات...\n');

    const showcases = await prisma.showcase.findMany({
      where: { status: 'APPROVED' }
    });

    console.log(`📊 عدد السيارات المعتمدة: ${showcases.length}\n`);

    for (const showcase of showcases) {
      console.log(`\n📝 معالجة: ${showcase.carBrand} ${showcase.carModel}`);
      
      try {
        const images = JSON.parse(showcase.images);
        const hasBase64 = images.some(img => img.includes('data:image'));
        
        if (!hasBase64) {
          console.log('   ✅ الصور بالفعل URLs، تخطي...');
          continue;
        }

        console.log(`   📸 عدد الصور: ${images.length}`);
        const uploadedUrls = [];
        
        for (let i = 0; i < images.length; i++) {
          const image = images[i];
          
          if (image.startsWith('http://') || image.startsWith('https://')) {
            console.log(`   ✅ صورة ${i + 1}: URL موجود بالفعل`);
            uploadedUrls.push(image);
          } else if (image.startsWith('data:image')) {
            console.log(`   ⬆️  صورة ${i + 1}: رفع Base64 إلى Cloudinary...`);
            const url = await uploadToCloudinary(image);
            
            if (url) {
              uploadedUrls.push(url);
              console.log(`   ✅ تم الرفع: ${url.substring(0, 60)}...`);
            } else {
              console.log(`   ❌ فشل رفع الصورة ${i + 1}`);
            }
          }
        }

        if (uploadedUrls.length > 0) {
          await prisma.showcase.update({
            where: { id: showcase.id },
            data: { images: JSON.stringify(uploadedUrls) }
          });
          
          console.log(`   ✅ تم تحديث السيارة بنجاح! (${uploadedUrls.length} صور)`);
        } else {
          console.log(`   ❌ لم يتم رفع أي صورة`);
        }
        
      } catch (error) {
        console.error(`   ❌ خطأ في معالجة السيارة:`, error.message);
      }
    }

    console.log('\n\n✅ اكتمل الإصلاح!\n');

  } catch (error) {
    console.error('\n❌ خطأ عام:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixShowcaseImages();
