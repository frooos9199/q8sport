import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addTestProducts() {
  try {
    // البحث عن مستخدم أو إنشاء واحد جديد
    let user = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        password: 'password123',
        name: 'أحمد الصالح',
        phone: '+965 99999999',
        whatsapp: '+965 99999999',
        rating: 4.8,
        verified: true
      }
    })

    // منتجات تجريبية مع صور من مصادر خارجية
    const testProducts = [
      {
        title: 'محرك فورد موستنق V8 2018',
        description: 'محرك أصلي بحالة ممتازة، مسافة 45,000 كم فقط. صيانة كاملة وجميع الإكسسوارات',
        price: 2750.000,
        condition: 'مستعمل - ممتاز',
        category: 'قطع المحرك',
        images: JSON.stringify([
          'https://via.placeholder.com/500x300/FF6B6B/FFFFFF?text=V8+Engine+1',
          'https://via.placeholder.com/500x300/FF6B6B/FFFFFF?text=V8+Engine+2',
          'https://via.placeholder.com/500x300/FF6B6B/FFFFFF?text=V8+Engine+3'
        ]),
        status: 'ACTIVE' as const,
        userId: user.id,
        views: 45
      },
      {
        title: 'طقم شاحن هواء شيلبي GT500',
        description: 'طقم شاحن هواء أصلي جديد للشيلبي GT500، يزيد القوة بنسبة 40%',
        price: 4500.000,
        condition: 'جديد',
        category: 'قطع المحرك',
        images: JSON.stringify([
          'https://via.placeholder.com/500x300/4ECDC4/FFFFFF?text=Supercharger+1',
          'https://via.placeholder.com/500x300/4ECDC4/FFFFFF?text=Supercharger+2'
        ]),
        status: 'ACTIVE' as const,
        userId: user.id,
        views: 32
      },
      {
        title: 'نظام عادم رياضي موستنق GT',
        description: 'نظام عادم Borla ATAK مستعمل بحالة ممتازة، صوت رياضي مميز',
        price: 650.000,
        condition: 'مستعمل - جيد جداً',
        category: 'نظام العادم',
        images: JSON.stringify([
          'https://via.placeholder.com/500x300/45B7D1/FFFFFF?text=Exhaust+System'
        ]),
        status: 'SOLD' as const,
        soldPrice: 750.000,
        soldDate: new Date(),
        buyerInfo: JSON.stringify({
          name: 'محمد الكندري',
          phone: '+965 88888888',
          email: 'mohammed@example.com'
        }),
        userId: user.id,
        views: 28
      }
    ]

    // إضافة المنتجات
    for (const product of testProducts) {
      await prisma.product.upsert({
        where: { 
          // استخدام مزيج من userId و title للفرادة
          id: `${user.id}-${product.title.replace(/\s+/g, '-').toLowerCase()}`
        },
        update: product,
        create: {
          ...product,
          id: `${user.id}-${product.title.replace(/\s+/g, '-').toLowerCase()}`
        }
      })
    }

    console.log('✅ تم إضافة المنتجات التجريبية بنجاح!')
  } catch (error) {
    console.error('❌ خطأ في إضافة المنتجات:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addTestProducts()