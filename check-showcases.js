const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkShowcases() {
  try {
    const showcases = await prisma.showcase.findMany({
      select: {
        id: true,
        carBrand: true,
        carModel: true,
        status: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('\n📊 إجمالي السيارات:', showcases.length);
    console.log('\n📋 قائمة السيارات:');
    console.log('================\n');

    const approved = showcases.filter(s => s.status === 'APPROVED');
    const pending = showcases.filter(s => s.status === 'PENDING');
    const rejected = showcases.filter(s => s.status === 'REJECTED');

    console.log('✅ معتمدة:', approved.length);
    console.log('⏳ قيد المراجعة:', pending.length);
    console.log('❌ مرفوضة:', rejected.length);
    console.log('\n');

    showcases.forEach(s => {
      const statusEmoji = s.status === 'APPROVED' ? '✅' : s.status === 'PENDING' ? '⏳' : '❌';
      console.log(`${statusEmoji} ${s.carBrand} ${s.carModel} - ${s.status}`);
    });

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkShowcases();
