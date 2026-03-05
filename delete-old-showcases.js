const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteBase64Showcases() {
  try {
    const showcases = await prisma.showcase.findMany({
      where: { status: 'APPROVED' }
    });

    console.log('\nحذف السيارات ذات صور Base64...\n');

    let deletedCount = 0;
    for (const showcase of showcases) {
      try {
        const images = JSON.parse(showcase.images);
        const hasBase64 = images.some(img => img.includes('data:image'));
        
        if (hasBase64) {
          await prisma.showcase.delete({ where: { id: showcase.id } });
          console.log(`حذف: ${showcase.carBrand} ${showcase.carModel}`);
          deletedCount++;
        } else {
          console.log(`احتفاظ: ${showcase.carBrand} ${showcase.carModel} (URLs صحيحة)`);
        }
      } catch (error) {
        console.error(`خطأ في معالجة ${showcase.carBrand}:`, error.message);
      }
    }

    console.log(`\nتم حذف ${deletedCount} سيارات\n`);
  } catch (error) {
    console.error('خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteBase64Showcases();
