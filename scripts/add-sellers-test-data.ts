import { PrismaClient, ProductStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('إضافة بيانات تجريبية للبائعين...');

  // إضافة المستخدمين/البائعين
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'seller1@mazad.com' },
      update: {},
      create: {
        email: 'seller1@mazad.com',
        password: '$2a$10$xyz123', // كلمة مرور وهمية
        name: 'أحمد محمد',
        phone: '96565551234',
        role: 'USER'
      }
    }),
    prisma.user.upsert({
      where: { email: 'seller2@mazad.com' },
      update: {},
      create: {
        email: 'seller2@mazad.com',
        password: '$2a$10$xyz123', // كلمة مرور وهمية
        name: 'محمد عبدالله',
        phone: '96565556789',
        role: 'USER'
      }
    }),
    prisma.user.upsert({
      where: { email: 'seller3@mazad.com' },
      update: {},
      create: {
        email: 'seller3@mazad.com',
        password: '$2a$10$xyz123', // كلمة مرور وهمية
        name: 'خالد أحمد',
        phone: '96565554321',
        role: 'USER'
      }
    })
  ]);

  console.log('تم إنشاء البائعين:', users.length);

  // إضافة المنتجات لكل بائع
  const products = [
    // منتجات البائع الأول
    {
      userId: users[0].id,
      category: 'قطع المحرك',
      title: 'مجموعة مكابس محرك تويوتا كامري 2020',
      description: 'مجموعة مكابس محرك أصلية لسيارة تويوتا كامري موديل 2020. حالة ممتازة، لم تستخدم من قبل.',
      price: 450,
      images: JSON.stringify(['https://via.placeholder.com/400x300/4a90e2/ffffff?text=Toyota+Piston', 'https://via.placeholder.com/400x300/7ed321/ffffff?text=Engine+Parts']),
      condition: 'جديد'
    },
    {
      userId: users[0].id,
      category: 'ناقل الحركة',
      title: 'ناقل حركة أوتوماتيك هوندا أكورد',
      description: 'ناقل حركة أوتوماتيك مجدد بالكامل لسيارة هوندا أكورد. يأتي مع ضمان 6 أشهر.',
      price: 850,
      images: JSON.stringify(['https://via.placeholder.com/400x300/bd10e0/ffffff?text=Transmission', 'https://via.placeholder.com/400x300/f5a623/ffffff?text=Honda+Part']),
      condition: 'مُجدد'
    },
    {
      userId: users[0].id,
      category: 'الفرامل',
      title: 'طقم فرامل أمامي نيسان التيما',
      description: 'طقم فرامل أمامي كامل يشمل الأقراص والفحمات. مناسب لنيسان التيما 2019-2021.',
      price: 320,
      images: JSON.stringify(['https://via.placeholder.com/400x300/d0021b/ffffff?text=Brake+Set', 'https://via.placeholder.com/400x300/9013fe/ffffff?text=Nissan+Parts']),
      condition: 'مستعمل',
      status: ProductStatus.SOLD,
      soldPrice: 320,
      soldDate: new Date('2024-01-15'),
      buyerInfo: JSON.stringify({
        name: 'سعد الخالدي',
        phone: '96565559999',
        address: 'الكويت، السالمية'
      })
    },

    // منتجات البائع الثاني
    {
      userId: users[1].id,
      category: 'نظام التعليق',
      title: 'مساعدات أمامية لكزس ES350',
      description: 'زوج مساعدات أمامية أصلية للكزس ES350. حالة ممتازة، تم اختبارها.',
      price: 680,
      images: JSON.stringify(['https://via.placeholder.com/400x300/50e3c2/ffffff?text=Struts', 'https://via.placeholder.com/400x300/4a90e2/ffffff?text=Lexus+Suspension']),
      condition: 'مستعمل'
    },
    {
      userId: users[1].id,
      category: 'النظام الكهربائي',
      title: 'بطارية سيارة ACDelco 70Ah',
      description: 'بطارية سيارة جديدة من ACDelco سعة 70 أمبير/ساعة. مناسبة لمعظم السيارات المتوسطة.',
      price: 85,
      images: JSON.stringify(['https://via.placeholder.com/400x300/417505/ffffff?text=Battery', 'https://via.placeholder.com/400x300/d0021b/ffffff?text=ACDelco']),
      condition: 'جديد'
    },
    {
      userId: users[1].id,
      category: 'قطع المحرك',
      title: 'فلتر هواء K&N عالي الأداء',
      description: 'فلتر هواء عالي الأداء من K&N قابل للغسيل والإعادة استخدام. يحسن أداء المحرك.',
      price: 65,
      images: JSON.stringify(['https://via.placeholder.com/400x300/f5a623/ffffff?text=Air+Filter', 'https://via.placeholder.com/400x300/9013fe/ffffff?text=K%26N+Filter']),
      condition: 'جديد',
      featured: true
    },

    // منتجات البائع الثالث
    {
      userId: users[2].id,
      category: 'ناقل الحركة',
      title: 'علبة تروس يدوي مازدا 6',
      description: 'علبة تروس يدوي 6 سرعات لمازدا 6. تم فحصها وإعادة تجديدها بالكامل.',
      price: 720,
      images: JSON.stringify(['https://via.placeholder.com/400x300/bd10e0/ffffff?text=Manual+Trans', 'https://via.placeholder.com/400x300/7ed321/ffffff?text=Mazda+6', 'https://via.placeholder.com/400x300/50e3c2/ffffff?text=6+Speed']),
      condition: 'مُجدد'
    },
    {
      userId: users[2].id,
      category: 'الفرامل',
      title: 'مضخة فرامل BMW سلسلة 3',
      description: 'مضخة فرامل رئيسية أصلية لسيارة BMW سلسلة 3. جديدة في الصندوق.',
      price: 280,
      images: JSON.stringify(['https://via.placeholder.com/400x300/4a90e2/ffffff?text=BMW+Brakes', 'https://via.placeholder.com/400x300/d0021b/ffffff?text=Master+Cylinder']),
      condition: 'جديد',
      status: ProductStatus.SOLD,
      soldPrice: 275,
      soldDate: new Date('2024-01-20'),
      buyerInfo: JSON.stringify({
        name: 'يوسف العتيبي',
        phone: '96565557777',
        address: 'الكويت، مبارك الكبير'
      })
    },
    {
      userId: users[2].id,
      category: 'النظام الكهربائي',
      title: 'مولد كهرباء بوش 120A',
      description: 'مولد كهرباء من بوش قدرة 120 أمبير. مجدد ومختبر، يأتي مع ضمان.',
      price: 180,
      images: JSON.stringify(['https://via.placeholder.com/400x300/417505/ffffff?text=Alternator', 'https://via.placeholder.com/400x300/f5a623/ffffff?text=Bosch+120A']),
      condition: 'مُجدد',
      featured: true
    }
  ];

  // إضافة المنتجات
  const createdProducts = [];
  for (const productData of products) {
    const product = await prisma.product.create({
      data: productData
    });
    createdProducts.push(product);
    console.log(`تم إنشاء المنتج: ${product.title}`);
  }

  console.log(`تم إضافة ${createdProducts.length} منتج بنجاح`);
  console.log('تم الانتهاء من إضافة البيانات التجريبية');
}

main()
  .catch((e) => {
    console.error('خطأ في إضافة البيانات:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });