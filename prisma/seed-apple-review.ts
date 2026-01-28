import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Seed the Apple Review test account
 * This ensures the test@test.com account always exists in production
 */
async function seedAppleReviewAccount() {
  try {
    console.log('🍎 Seeding Apple Review test account...\n');

    const testEmail = 'test@test.com';
    const testPassword = '123123';
    const hashedPassword = await bcrypt.hash(testPassword, 12);

    // Upsert the test account
    const user = await prisma.user.upsert({
      where: { email: testEmail },
      update: {
        password: hashedPassword,
        name: 'Test User',
        role: 'ADMIN',
        status: 'ACTIVE',
        verified: true,
        canManageProducts: true,
        canManageUsers: true,
        canViewReports: true,
        canManageOrders: true,
        canManageShop: true,
      },
      create: {
        email: testEmail,
        password: hashedPassword,
        name: 'Test User',
        role: 'ADMIN',
        status: 'ACTIVE',
        verified: true,
        phone: null,
        whatsapp: null,
        canManageProducts: true,
        canManageUsers: true,
        canViewReports: true,
        canManageOrders: true,
        canManageShop: true,
      },
    });

    console.log('✅ Test account created/updated');
    console.log('   ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Name:', user.name);
    console.log('   Role:', user.role);

    // Add demo products if none exist
    const existingProducts = await prisma.product.count({
      where: { userId: user.id },
    });

    if (existingProducts === 0) {
      console.log('\n📦 Creating demo products...');
      
      await prisma.product.createMany({
        data: [
          {
            userId: user.id,
            title: 'محرك فورد رابتر 2022',
            description: 'محرك V6 إيكوبوست في حالة ممتازة، تم فحصه بالكامل وجاهز للتركيب. المحرك يعمل بكفاءة عالية ومناسب لسيارات فورد رابتر.',
            price: 5000,
            productType: 'PART',
            category: 'محركات',
            carBrand: 'Ford',
            carModel: 'Raptor',
            carYear: 2022,
            condition: 'مستعمل',
            images: JSON.stringify([
              'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400',
            ]),
            status: 'ACTIVE',
            contactPhone: '+96550000000',
            contactWhatsapp: '+96550000000',
            showSellerName: false,
          },
          {
            userId: user.id,
            title: 'فورد رابتر 2023',
            description: 'فورد رابتر موديل 2023 فل أوبشن بحالة ممتازة، محرك V6 تيربو، نظام دفع رباعي، مقاعد جلد، شاشة كبيرة، كاميرا 360 درجة، نظام صوت بريميوم.',
            price: 35000,
            productType: 'CAR',
            category: 'سيارات',
            carBrand: 'Ford',
            carModel: 'Raptor',
            carYear: 2023,
            kilometers: 15000,
            transmission: 'أوتوماتيك',
            fuelType: 'بنزين',
            color: 'أبيض',
            engineSize: '3.5L V6',
            condition: 'ممتاز',
            images: JSON.stringify([
              'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400',
            ]),
            status: 'ACTIVE',
            contactPhone: '+96550000000',
            contactWhatsapp: '+96550000000',
            showSellerName: false,
          },
          {
            userId: user.id,
            title: 'شفروليه كمارو SS 2021',
            description: 'شفروليه كمارو SS موديل 2021، محرك V8 قوة 455 حصان، لون أحمر مميز، كامل المواصفات، سيرفس منتظم في الوكالة.',
            price: 28000,
            productType: 'CAR',
            category: 'سيارات',
            carBrand: 'Chevrolet',
            carModel: 'Camaro',
            carYear: 2021,
            kilometers: 22000,
            transmission: 'أوتوماتيك',
            fuelType: 'بنزين',
            color: 'أحمر',
            engineSize: '6.2L V8',
            condition: 'ممتاز',
            images: JSON.stringify([
              'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400',
            ]),
            status: 'ACTIVE',
            contactPhone: '+96550000000',
            contactWhatsapp: '+96550000000',
            showSellerName: false,
          },
          {
            userId: user.id,
            title: 'قطع غيار كورفيت أصلية',
            description: 'مجموعة قطع غيار أصلية لشفروليه كورفيت C7، جميع القطع بحالة ممتازة ومضمونة.',
            price: 1500,
            productType: 'PART',
            category: 'قطع غيار',
            carBrand: 'Chevrolet',
            carModel: 'Corvette',
            carYear: 2019,
            condition: 'جديد',
            images: JSON.stringify([
              'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400',
            ]),
            status: 'ACTIVE',
            contactPhone: '+96550000000',
            contactWhatsapp: '+96550000000',
            showSellerName: false,
          },
        ],
      });

      console.log('✅ Created 4 demo products');
    } else {
      console.log(`\n✅ Account already has ${existingProducts} products`);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🍎 APPLE REVIEW ACCOUNT READY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:    test@test.com');
    console.log('Password: 123123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Error seeding test account:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedAppleReviewAccount();
