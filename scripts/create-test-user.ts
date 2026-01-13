import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createTestUser() {
  try {
    // إنشاء مستخدم تجريبي
    const testUser = await prisma.user.create({
      data: {
        email: 'test@q8mazad.com',
        password: 'hashed_password', // في التطبيق الحقيقي سيتم تشفيرها
        name: 'محمد الكندري',
        phone: '+965 9999 8888',
        whatsapp: '96599998888',
        rating: 4.5,
        verified: true,
        status: 'ACTIVE',
        role: 'USER'
      }
    })

    console.log('تم إنشاء المستخدم التجريبي:', testUser)
    return testUser
  } catch (error) {
    console.error('خطأ في إنشاء المستخدم:', error)
    return null
  }
}

createTestUser()
  .then(() => console.log('تم الانتهاء'))
  .catch(console.error)
  .finally(() => prisma.$disconnect())