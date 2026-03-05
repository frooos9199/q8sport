const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function approvePending() {
  const result = await prisma.showcase.updateMany({
    where: { status: 'PENDING' },
    data: { status: 'APPROVED' }
  });
  console.log(`تم اعتماد ${result.count} سيارات`);
  await prisma.$disconnect();
}

approvePending();
