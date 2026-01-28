import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createDemoAccount() {
  try {
    // حذف الحساب القديم إن وجد
    await prisma.user.deleteMany({
      where: { email: 'demo@q8sportcar.com' }
    });

    // إنشاء حساب جديد
    const hashedPassword = await bcrypt.hash('Demo123456', 10);
    
    const user = await prisma.user.create({
      data: {
        email: 'demo@q8sportcar.com',
        password: hashedPassword,
        name: 'Demo User',
        role: 'USER',
        status: 'ACTIVE',
        verified: true,
      },
    });

    console.log('✅ Demo account created successfully!');
    console.log('Email: demo@q8sportcar.com');
    console.log('Password: Demo123456');
    console.log('User ID:', user.id);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDemoAccount();
