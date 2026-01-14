import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function testRegistration() {
  try {
    console.log('اختبار التسجيل...')
    
    // حذف المستخدم التجريبي إذا كان موجود
    await prisma.user.deleteMany({
      where: { email: 'newuser@test.com' }
    })
    
    // إنشاء مستخدم جديد
    const hashedPassword = await bcrypt.hash('password123', 12)
    
    const user = await prisma.user.create({
      data: {
        name: 'مستخدم جديد',
        email: 'newuser@test.com',
        password: hashedPassword,
        phone: '96550000000',
        whatsapp: '96550000000',
        role: 'USER',
        status: 'ACTIVE'
      }
    })
    
    console.log('✅ تم إنشاء المستخدم بنجاح:', user.name)
    console.log('البريد الإلكتروني:', user.email)
    
  } catch (error) {
    console.error('❌ خطأ في التسجيل:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testRegistration()