const { PrismaClient } = require('@prisma/client');
const { put } = require('@vercel/blob');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

async function uploadToVercelBlob(base64Image, index) {
  try {
    // Extract base64 data
    const matches = base64Image.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) {
      console.error('   ❌ Invalid base64 format');
      return null;
    }

    const imageType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Upload to Vercel Blob
    const filename = `showcase_fix_${Date.now()}_${index}.${imageType}`;
    const blob = await put(filename, buffer, {
      access: 'public',
      contentType: `image/${imageType}`,
      token: process.env.BLOB_READ_WRITE_TOKEN
    });
    
    return blob.url;
  } catch (error) {
    console.error('   ❌ Vercel Blob upload error:', error.message);
    return null;
  }
}

async function fixShowcaseImages() {
  try {
    console.log('\n🔧 بدء إصلاح صور السيارات باستخدام Vercel Blob...\n');

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
            console.log(`   ⬆️  صورة ${i + 1}: رفع Base64 إلى Vercel Blob...`);
            const url = await uploadToVercelBlob(image, i);
            
            if (url) {
              uploadedUrls.push(url);
              console.log(`   ✅ تم الرفع: ${url.substring(0, 70)}...`);
            } else {
              console.log(`   ❌ فشل رفع الصورة ${i + 1}`);
            }
          }
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
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
