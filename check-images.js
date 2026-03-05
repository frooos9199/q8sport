const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkImages() {
  try {
    const showcases = await prisma.showcase.findMany({
      where: { status: 'APPROVED' },
      select: {
        id: true,
        carBrand: true,
        carModel: true,
        images: true
      }
    });

    console.log('\n✅ السيارات المعتمدة:', showcases.length);
    console.log('\n');
    
    showcases.forEach((s, i) => {
      const imagePreview = s.images.substring(0, 100);
      const isBase64 = imagePreview.includes('data:image');
      const isUrl = imagePreview.includes('http');
      
      console.log(`${i + 1}. ${s.carBrand} ${s.carModel}`);
      console.log(`   نوع الصورة: ${isBase64 ? '❌ Base64' : isUrl ? '✅ URL' : '❓ غير معروف'}`);
      console.log(`   معاينة: ${imagePreview.substring(0, 80)}...`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkImages();
