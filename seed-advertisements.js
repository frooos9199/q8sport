import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAdvertisements() {
  try {
    // إضافة إعلانات تجريبية
    const advertisements = [
      {
        title: 'قطع غيار فورد مستعملة - Q8 MAZAD SPORT',
        description: 'قطع غيار أصلية للفورد بأسعار منافسة - جودة عالية ومضمونة',
        link: '/auctions?brand=ford',
        active: true
      },
      {
        title: 'عروض خاصة على محركات - Q8 MAZAD SPORT',
        description: 'محركات مجددة لجميع موديلات السيارات الأمريكية',
        link: '/auctions?category=engines',
        active: true
      },
      {
        title: 'إطارات بحالة ممتازة - Q8 MAZAD SPORT',
        description: 'إطارات مستعملة وجديدة بأفضل الأسعار في الكويت',
        link: '/auctions?category=tires',
        active: true
      }
    ];

    for (const ad of advertisements) {
      await prisma.advertisement.create({
        data: ad
      });
    }

    console.log('تم إضافة الإعلانات التجريبية بنجاح!');
  } catch (error) {
    console.error('خطأ في إضافة الإعلانات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdvertisements();