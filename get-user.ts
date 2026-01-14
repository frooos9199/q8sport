import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function getUserId() {
  try {
    const user = await prisma.user.findFirst()
    if (user) {
      console.log('✅ تم العثور على مستخدم:', user.id, user.name)
      return user.id
    } else {
      console.log('❌ لا يوجد مستخدمين')
      return null
    }
  } catch (error) {
    console.error('خطأ:', error)
  } finally {
    await prisma.$disconnect()
  }
}

getUserId()