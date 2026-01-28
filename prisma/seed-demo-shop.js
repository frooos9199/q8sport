// سكريبت إضافة محل تجريبي مع منتجات
// شغّل هذا الملف: node prisma/seed-demo-shop.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
require('dotenv').config();

async function main() {
  // إضافة مستخدم بدور SHOP_OWNER
  const shopOwner = await prisma.user.upsert({
    where: { email: 'demo-shop@q8sport.com' },
    update: {},
    create: {
      name: 'محل تجريبي',
      email: 'demo-shop@q8sport.com',
      password: '$2a$10$demoHashedPassword', // ضع هنا هاش حقيقي لكلمة مرور
      role: 'SHOP_OWNER',
      status: 'ACTIVE',
      shopName: 'محل السيارات الذهبي',
      shopAddress: 'الكويت - حولي',
      shopImage: 'https://cdn-icons-png.flaticon.com/512/2972/2972185.png',
      phone: '50000000',
      whatsapp: '50000000',
      rating: 4.8,
      verified: true,
    },
  });

  // إضافة منتجات وهمية للمحل
  const products = [
    {
      title: 'جنوط رياضية أصلية',
      price: 120,
      images: ['https://cdn-icons-png.flaticon.com/512/2331/2331970.png'],
      category: 'إكسسوارات',
      carBrand: 'تويوتا',
      carModel: 'كامري',
      carYear: 2022,
      description: 'جنوط أصلية عالية الجودة للسيارات الرياضية.',
    },
    {
      title: 'بطارية سيارة جديدة',
      price: 35,
      images: ['https://cdn-icons-png.flaticon.com/512/2331/2331970.png'],
      category: 'بطاريات',
      carBrand: 'نيسان',
      carModel: 'باترول',
      carYear: 2021,
      description: 'بطارية قوية تدوم طويلاً للسيارات.',
    },
    {
      title: 'زيت محرك أصلي',
      price: 15,
      images: ['https://cdn-icons-png.flaticon.com/512/2331/2331970.png'],
      category: 'زيوت',
      carBrand: 'هونداي',
      carModel: 'سوناتا',
      carYear: 2020,
      description: 'زيت محرك أصلي يحافظ على أداء السيارة.',
    },
    {
      title: 'إطارات جديدة',
      price: 200,
      images: ['https://cdn-icons-png.flaticon.com/512/2331/2331970.png'],
      category: 'إطارات',
      carBrand: 'كيا',
      carModel: 'سبورتاج',
      carYear: 2023,
      description: 'إطارات عالية الجودة لجميع الفصول.',
    },
    {
      title: 'مصابيح LED',
      price: 25,
      images: ['https://cdn-icons-png.flaticon.com/512/2331/2331970.png'],
      category: 'إضاءة',
      carBrand: 'فورد',
      carModel: 'إكسبلورر',
      carYear: 2019,
      description: 'مصابيح LED قوية وواضحة للرؤية الليلية.',
    },
  ];

  for (const product of products) {
    await prisma.product.create({
      data: {
        ...product,
        images: JSON.stringify(product.images),
        user: { connect: { id: shopOwner.id } },
      },
    });
  }

  console.log('تم إضافة محل تجريبي مع منتجات وهمية بنجاح!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
