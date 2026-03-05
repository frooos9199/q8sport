const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function autoApproveAll() {
  try {
    console.log('\n⚡ اعتماد جميع السيارات تلقائياً...\n');

    const result = await prisma.showcase.updateMany({
      where: {
        OR: [
          { status: 'PENDING' },
          { status: 'REJECTED' }
        ]
      },
      data: { status: 'APPROVED' }
    });

    console.log(`✅ تم اعتماد ${result.count} سيارات\n`);

    const stats = await prisma.showcase.groupBy({
      by: ['status'],
      _count: true
    });

    console.log('📊 الإحصائيات:');
    stats.forEach(stat => {
      console.log(`   ${stat.status}: ${stat._count} سيارات`);
    });

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

autoApproveAll();
