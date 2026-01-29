import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  جاري حذف المنتجات الوهمية...\n');

  // حذف المنتجات التي تحتوي على أرقام وهمية أو بيانات تجريبية
  const dummyProducts = await prisma.product.findMany({
    where: {
      OR: [
        { contactPhone: { contains: '96550000000' } },
        { contactWhatsapp: { contains: '96550000000' } },
        { title: { contains: 'فورد رابتر' } },
        { title: { contains: 'شفروليه كمارو' } },
        { title: { contains: 'قطع غيار كورفيت' } },
        { title: { contains: 'محرك فورد رابتر' } },
        { title: { contains: 'فورد موستانج GT' } },
        { title: { contains: 'شفروليت كورفيت' } },
        { title: { contains: 'تويوتا سوبرا' } },
        { title: { contains: 'قطعة غيار - فلتر' } },
      ]
    },
    select: {
      id: true,
      title: true,
      contactPhone: true,
    }
  });

  console.log(`📊 تم العثور على ${dummyProducts.length} منتج وهمي:\n`);
  
  dummyProducts.forEach((p, i) => {
    console.log(`${i + 1}. ${p.title} (${p.contactPhone || 'بدون رقم'})`);
  });

  if (dummyProducts.length === 0) {
    console.log('\n✅ لا توجد منتجات وهمية للحذف!');
    return;
  }

  console.log('\n🗑️  جاري الحذف...');

  const result = await prisma.product.deleteMany({
    where: {
      id: {
        in: dummyProducts.map(p => p.id)
      }
    }
  });

  console.log(`\n✅ تم حذف ${result.count} منتج وهمي بنجاح!`);
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
