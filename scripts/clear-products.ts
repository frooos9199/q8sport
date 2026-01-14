import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  حذف جميع المنتجات...');
  
  const result = await prisma.product.deleteMany({});
  
  console.log(`✅ تم حذف ${result.count} منتج`);
}

main()
  .catch((e) => {
    console.error('❌ خطأ:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
