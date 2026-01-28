import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function verifyTestAccount() {
  try {
    const testEmail = 'test@test.com';
    const testPassword = '123123';

    console.log('🔍 Checking test account...\n');

    // Check if account exists
    let user = await prisma.user.findUnique({
      where: { email: testEmail },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        verified: true,
        password: true,
      },
    });

    if (user) {
      console.log('✅ Test account found in database');
      console.log('   ID:', user.id);
      console.log('   Email:', user.email);
      console.log('   Name:', user.name);
      console.log('   Role:', user.role);
      console.log('   Status:', user.status);
      console.log('   Verified:', user.verified);

      // Verify password
      const isPasswordValid = await bcrypt.compare(testPassword, user.password);
      
      if (isPasswordValid) {
        console.log('✅ Password is correct!\n');
      } else {
        console.log('❌ Password is incorrect! Updating...\n');
        
        const hashedPassword = await bcrypt.hash(testPassword, 12);
        await prisma.user.update({
          where: { email: testEmail },
          data: { 
            password: hashedPassword,
            status: 'ACTIVE',
            verified: true,
          },
        });
        
        console.log('✅ Password updated successfully!\n');
      }
    } else {
      console.log('❌ Test account not found. Creating...\n');
      
      const hashedPassword = await bcrypt.hash(testPassword, 12);
      
      user = await prisma.user.create({
        data: {
          email: testEmail,
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
      });

      console.log('✅ Test account created successfully!\n');
    }

    // Add some demo products for the test account
    const productCount = await prisma.product.count({
      where: { userId: user.id },
    });

    if (productCount === 0) {
      console.log('📦 Creating demo products...\n');
      
      await prisma.product.createMany({
        data: [
          {
            userId: user.id,
            title: 'محرك فورد رابتر 2022',
            description: 'محرك V6 إيكوبوست في حالة ممتازة',
            price: 5000,
            productType: 'PART',
            category: 'محركات',
            carBrand: 'Ford',
            carModel: 'Raptor',
            carYear: 2022,
            condition: 'مستعمل',
            images: JSON.stringify(['https://via.placeholder.com/400x300?text=Ford+Raptor+Engine']),
            status: 'ACTIVE',
            contactPhone: '+96550000000',
            contactWhatsapp: '+96550000000',
          },
          {
            userId: user.id,
            title: 'فورد رابتر 2023',
            description: 'فورد رابتر موديل 2023 فل أوبشن بحالة ممتازة',
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
            images: JSON.stringify(['https://via.placeholder.com/400x300?text=Ford+Raptor+2023']),
            status: 'ACTIVE',
            contactPhone: '+96550000000',
            contactWhatsapp: '+96550000000',
          },
        ],
      });

      console.log('✅ Demo products created!\n');
    } else {
      console.log(`✅ Account already has ${productCount} products\n`);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📱 TEST ACCOUNT CREDENTIALS FOR APP STORE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:    test@test.com');
    console.log('Password: 123123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ Account is ready for Apple Review!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyTestAccount();
