const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAdvertisements() {
  try {
    const advertisements = await prisma.advertisement.findMany();
    console.log('Total advertisements:', advertisements.length);
    console.log('Advertisements:', advertisements);
    
    const activeAds = await prisma.advertisement.findMany({
      where: { active: true }
    });
    console.log('Active advertisements:', activeAds.length);
    console.log('Active ads:', activeAds);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdvertisements();