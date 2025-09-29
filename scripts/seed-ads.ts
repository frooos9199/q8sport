import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // حذف الإعلانات القديمة
  await prisma.advertisement.deleteMany();

  // إنشاء إعلان تجريبي جديد
  await prisma.advertisement.create({
    data: {
      title: 'قطع غيار فورد موستانج الأصلية',
      description: 'قطع غيار عالية الجودة لسيارات فورد موستانج بأسعار مناسبة - ضمان الجودة والأصالة',
      imageUrl: 'https://via.placeholder.com/400x200/1e40af/ffffff?text=Ford+Mustang+Parts',
      link: '/auctions',
      active: true,
      position: 'header',
      clickCount: 0
    }
  });

  console.log('✅ تم إنشاء الإعلان التجريبي بنجاح');
}

main()
  .catch((e) => {
    console.error('❌ خطأ في إنشاء البيانات التجريبية:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });