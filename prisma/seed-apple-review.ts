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
