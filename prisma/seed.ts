import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 بدء إدراج البيانات التجريبية...');

  // Create admin user
  const hashedAdminPassword = await bcrypt.hash('123123', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'summit_kw@hotmail.com' },
    update: {},
    create: {
      email: 'summit_kw@hotmail.com',
      password: hashedAdminPassword,
      name: 'مدير النظام',
      phone: '+96512345678',
      whatsapp: '+96512345678',
      role: 'ADMIN',
      status: 'ACTIVE',
      verified: true,
      rating: 5.0
    },
  });

  console.log('✅ تم إنشاء حساب الأدمن:', adminUser.email);

  // Create test users
  const testUsers = [];
  for (let i = 1; i <= 5; i++) {
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const user = await prisma.user.upsert({
      where: { email: `user${i}@example.com` },
      update: {},
      create: {
        email: `user${i}@example.com`,
        password: hashedPassword,
        name: `مستخدم ${i}`,
        phone: `+96512345${i.toString().padStart(3, '0')}`,
        whatsapp: `+96512345${i.toString().padStart(3, '0')}`,
        role: 'USER',
        status: 'ACTIVE',
        verified: i <= 3, // First 3 users are verified
        rating: Math.random() * 5
      },
    });
    testUsers.push(user);
  }

  console.log('✅ تم إنشاء المستخدمين التجريبيين');

  // Create car brands
  const fordBrand = await prisma.carBrand.upsert({
    where: { name: 'Ford' },
    update: {},
    create: {
      name: 'Ford',
      slug: 'ford',
      logo: '/images/brands/ford.png',
      active: true,
    },
  });

  const chevroletBrand = await prisma.carBrand.upsert({
    where: { name: 'Chevrolet' },
    update: {},
    create: {
      name: 'Chevrolet',
      slug: 'chevrolet',
      logo: '/images/brands/chevrolet.png',
      active: true,
    },
  });

  console.log('✅ تم إنشاء ماركات السيارات');

  // Create car models
  const mustang = await prisma.carModel.upsert({
    where: { 
      brandId_slug: { 
        brandId: fordBrand.id, 
        slug: 'mustang' 
      } 
    },
    update: {},
    create: {
      name: 'Mustang',
      slug: 'mustang',
      brandId: fordBrand.id,
      yearFrom: 1964,
      yearTo: 2024,
      active: true,
    },
  });

  const f150 = await prisma.carModel.upsert({
    where: { 
      brandId_slug: { 
        brandId: fordBrand.id, 
        slug: 'f-150' 
      } 
    },
    update: {},
    create: {
      name: 'F-150',
      slug: 'f-150',
      brandId: fordBrand.id,
      yearFrom: 1975,
      yearTo: 2024,
      active: true,
    },
  });

  const corvette = await prisma.carModel.upsert({
    where: { 
      brandId_slug: { 
        brandId: chevroletBrand.id, 
        slug: 'corvette' 
      } 
    },
    update: {},
    create: {
      name: 'Corvette',
      slug: 'corvette',
      brandId: chevroletBrand.id,
      yearFrom: 1953,
      yearTo: 2024,
      active: true,
    },
  });

  const camaro = await prisma.carModel.upsert({
    where: { 
      brandId_slug: { 
        brandId: chevroletBrand.id, 
        slug: 'camaro' 
      } 
    },
    update: {},
    create: {
      name: 'Camaro',
      slug: 'camaro',
      brandId: chevroletBrand.id,
      yearFrom: 1966,
      yearTo: 2024,
      active: true,
    },
  });

  console.log('✅ تم إنشاء موديلات السيارات');

  // Create part categories
  const engineCategory = await prisma.partCategory.upsert({
    where: { name: 'Engine Parts' },
    update: {},
    create: {
      name: 'Engine Parts',
      nameArabic: 'قطع المحرك',
      slug: 'engine-parts',
      description: 'Engine components and parts',
      icon: '🔧',
      active: true,
    },
  });

  const bodyCategory = await prisma.partCategory.upsert({
    where: { name: 'Body Parts' },
    update: {},
    create: {
      name: 'Body Parts',
      nameArabic: 'قطع الهيكل',
      slug: 'body-parts',
      description: 'Body panels and components',
      icon: '🚗',
      active: true,
    },
  });

  const interiorCategory = await prisma.partCategory.upsert({
    where: { name: 'Interior Parts' },
    update: {},
    create: {
      name: 'Interior Parts',
      nameArabic: 'قطع الداخلية',
      slug: 'interior-parts',
      description: 'Interior components and accessories',
      icon: '🪑',
      active: true,
    },
  });

  console.log('✅ تم إنشاء فئات القطع');

  // Create sample auctions
  const sampleAuctions = [
    {
      title: 'محرك فورد موستانغ 5.0L V8',
      description: 'محرك أصلي في حالة ممتازة، تم فحصه بالكامل ويعمل بكفاءة عالية. مناسب للموستانغ من 2011-2017.',
      category: 'قطع المحرك',
      carModel: 'Ford Mustang',
      carYear: 2015,
      partNumber: 'FD5.0V8-2015',
      condition: 'مستعملة - ممتازة',
      startingPrice: 1500,
      reservePrice: 2000,
      currentPrice: 1500,
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      images: '/images/engine1.jpg,/images/engine2.jpg',
      sellerId: testUsers[0].id,
      carModelId: mustang.id,
      status: 'ACTIVE'
    },
    {
      title: 'باب جانبي أيمن شيفروليه كامارو',
      description: 'باب أصلي بحالة جيدة، بدون خدوش أو أضرار، لون أسود. مناسب لكامارو 2016-2018.',
      category: 'قطع الهيكل',
      carModel: 'Chevrolet Camaro',
      carYear: 2017,
      partNumber: 'CM-DOOR-R-2017',
      condition: 'مستعملة - جيدة',
      startingPrice: 300,
      reservePrice: 450,
      currentPrice: 350,
      endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      images: '/images/door1.jpg',
      sellerId: testUsers[1].id,
      carModelId: camaro.id,
      status: 'ACTIVE'
    },
    {
      title: 'مقاعد جلدية فورد F-150',
      description: 'مقاعد جلدية أصلية بحالة ممتازة، لون بيج، مع خاصية التدفئة. من F-150 2018.',
      category: 'قطع الداخلية',
      carModel: 'Ford F-150',
      carYear: 2018,
      partNumber: 'F150-SEATS-2018',
      condition: 'مستعملة - ممتازة',
      startingPrice: 800,
      reservePrice: 1200,
      currentPrice: 950,
      endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      images: '/images/seats1.jpg,/images/seats2.jpg',
      sellerId: testUsers[2].id,
      carModelId: f150.id,
      status: 'ACTIVE'
    },
    {
      title: 'نظام عادم شيفروليه كورفيت',
      description: 'نظام عادم رياضي أصلي، صوت عميق ومميز، مصنوع من الستينلس ستيل. لكورفيت 2014-2019.',
      category: 'قطع المحرك',
      carModel: 'Chevrolet Corvette',
      carYear: 2016,
      partNumber: 'CORV-EXH-2016',
      condition: 'مستعملة - جيدة جداً',
      startingPrice: 600,
      currentPrice: 600,
      endTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      images: '/images/exhaust1.jpg',
      sellerId: testUsers[3].id,
      carModelId: corvette.id,
      status: 'ACTIVE'
    },
    {
      title: 'مصابيح LED أمامية موستانغ',
      description: 'مصابيح LED أصلية عالية الجودة، إضاءة قوية وواضحة، تركيب سهل. للموستانغ 2015-2020.',
      category: 'قطع الهيكل',
      carModel: 'Ford Mustang',
      carYear: 2018,
      partNumber: 'MUST-LED-2018',
      condition: 'مستعملة - ممتازة',
      startingPrice: 400,
      reservePrice: 600,
      currentPrice: 480,
      endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      images: '/images/headlights1.jpg',
      sellerId: testUsers[4].id,
      carModelId: mustang.id,
      status: 'ACTIVE'
    }
  ];

  for (const auctionData of sampleAuctions) {
    await prisma.auction.create({
      data: auctionData
    });
  }

  console.log('✅ تم إنشاء المزادات التجريبية');

  // Create some sample bids
  const auctions = await prisma.auction.findMany({
    where: { status: 'ACTIVE' },
    take: 3
  });

  for (const auction of auctions) {
    // Create 2-3 bids per auction
    const numBids = Math.floor(Math.random() * 3) + 2;
    let currentPrice = Number(auction.startingPrice);
    
    for (let i = 0; i < numBids; i++) {
      const bidAmount = currentPrice + (Math.random() * 100) + 50; // Random bid increment
      const randomUser = testUsers[Math.floor(Math.random() * testUsers.length)];
      
      // Don't let seller bid on their own auction
      if (randomUser.id === auction.sellerId) continue;
      
      await prisma.bid.create({
        data: {
          amount: bidAmount,
          bidderId: randomUser.id,
          auctionId: auction.id,
          createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000) // Random time in last 24 hours
        }
      });
      
      currentPrice = bidAmount;
    }
    
    // Update auction current price
    await prisma.auction.update({
      where: { id: auction.id },
      data: { currentPrice: currentPrice }
    });
  }

  console.log('✅ تم إنشاء المزايدات التجريبية');

  // Create advertisements
  await prisma.advertisement.deleteMany(); // Clear existing advertisements
  
  const advertisements = [
    {
      title: 'عرض خاص على قطع فورد',
      description: 'خصم 30% على جميع قطع غيار الفورد موستانج وF-150 - عرض محدود لمدة أسبوع فقط! 🔥',
      imageUrl: '/ads/ford-parts.jpg',
      link: '/auctions?brand=Ford',
      active: true,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31')
    },
    {
      title: 'محركات V8 أصلية',
      description: 'أقوى عروض المحركات الأمريكية - ضمان سنتين على جميع المحركات المعتمدة ⚡',
      imageUrl: '/ads/engines.jpg',
      link: '/auctions?category=المحرك',
      active: true,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31')
    },
    {
      title: 'Q8 MAZAD SPORT - الموقع الأول',
      description: 'لمزادات قطع غيار السيارات الرياضية في الكويت - أفضل الأسعار وأعلى جودة! 🏆',
      imageUrl: '/ads/q8mazad.jpg',
      link: '/auctions',
      active: true,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31')
    },
    {
      title: 'اطارات رياضية مستوردة',
      description: 'تشكيلة واسعة من الإطارات الرياضية المستوردة لجميع السيارات الأمريكية 🚗',
      imageUrl: '/ads/tires.jpg',
      link: '/auctions?search=إطارات',
      active: true,
      startDate: new Date('2025-09-01'),
      endDate: new Date('2025-12-31')
    },
    {
      title: 'عرض إعلان منتهي',
      description: 'هذا الإعلان منتهي الصلاحية ولن يظهر',
      active: true,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31')
    }
  ];

  for (const ad of advertisements) {
    await prisma.advertisement.create({
      data: ad
    });
  }

  console.log('✅ تم إنشاء الإعلانات التجريبية');

  console.log('🎉 تم إنشاء جميع البيانات التجريبية بنجاح!');
  console.log(`
📊 ملخص البيانات المُنشأة:
- المستخدمين: 6 (1 أدمن + 5 مستخدمين)
- ماركات السيارات: 2 (Ford, Chevrolet)
- موديلات السيارات: 4 (Mustang, F-150, Corvette, Camaro)
- فئات القطع: 3 (محرك، هيكل، داخلية)
- المزادات: 5 مزادات نشطة
- المزايدات: ~10-15 مزايدة
- الإعلانات: 5 إعلانات (4 نشطة حسب التاريخ)

🔑 بيانات الدخول للأدمن:
البريد: summit_kw@hotmail.com
كلمة المرور: 123123

👤 بيانات الدخول للمستخدمين التجريبيين:
البريد: user1@example.com إلى user5@example.com
كلمة المرور: password123
  `);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ خطأ في إدراج البيانات:', e);
    await prisma.$disconnect();
    process.exit(1);
  });