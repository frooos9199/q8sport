import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  البحث عن المنتجات المحذوفة...\n');

  const deletedProducts = await prisma.product.findMany({
    where: {
      status: 'DELETED'
    },
    select: {
      id: true,
      title: true,
      user: {
        select: {
          name: true
        }
      }
    }
  });

  console.log(`📊 تم العثور على ${deletedProducts.length} منتج محذوف:\n`);
  
  deletedProducts.forEach((p, i) => {
    console.log(`${i + 1}. ${p.title} - ${p.user.name}`);
  });

  if (deletedProducts.length === 0) {
    console.log('\n✅ لا توجد منتجات محذوفة!');
    return;
  }

  console.log('\n🗑️  جاري الحذف النهائي...');

  const result = await prisma.product.deleteMany({
    where: {
      status: 'DELETED'
    }
  });

  console.log(`\n✅ تم حذف ${result.count} منتج نهائياً من قاعدة البيانات!`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ خطأ:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
