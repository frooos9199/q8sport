import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedProducts() {
  try {
    // البحث عن مستخدم موجود أو إنشاء واحد جديد
    let user = await prisma.user.findFirst()
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: 'أحمد الصالح',
          email: 'ahmed@example.com',
          phone: '+965 99999999',
          whatsapp: '+965 99999999',
          rating: 4.8,
          verified: true
        }
      })
    }

    // إنشاء منتجات تجريبية مع صور
    const sampleProducts = [
      {
        title: 'محرك فورد موستنق V8 2018',
        description: 'محرك أصلي بحالة ممتازة، مسافة 45,000 كم فقط. صيانة كاملة وجميع الإكسسوارات',
        price: 2750.000,
        condition: 'مستعمل - ممتاز',
        category: 'قطع المحرك',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
          'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=500',
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500'
        ]),
        status: 'ACTIVE',
        userId: user.id
      },
      {
        title: 'طقم شاحن هواء شيلبي GT500',
        description: 'طقم شاحن هواء أصلي جديد للشيلبي GT500، يزيد القوة بنسبة 40%',
        price: 4500.000,
        condition: 'جديد',
        category: 'قطع المحرك',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=500',
          'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=500'
        ]),
        status: 'ACTIVE',
        userId: user.id
      },
      {
        title: 'نظام عادم رياضي موستنق GT',
        description: 'نظام عادم Borla ATAK مستعمل بحالة ممتازة، صوت رياضي مميز',
        price: 750.000,
        condition: 'مستعمل - جيد جداً',
        category: 'نظام العادم',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=500'
        ]),
        status: 'SOLD',
        soldPrice: 750.000,
        soldDate: new Date(),
        buyerInfo: JSON.stringify({
          name: 'محمد الكندري',
          phone: '+965 88888888',
          email: 'mohammed@example.com'
        }),
        userId: user.id
      },
      {
        title: 'طقم فرامل رياضي موستنق GT350',
        description: 'طقم فرامل Brembo أصلي من GT350، أداء فائق للتوقف',
        price: 1500.000,
        condition: 'مستعمل - ممتاز',
        category: 'الفرامل',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1558049311-518bd63abb75?w=500',
          'https://images.unsplash.com/photo-1558049311-518bd63abb75?w=500'
        ]),
        status: 'ACTIVE',
        userId: user.id
      }
    ]

    for (const product of sampleProducts) {
      await prisma.product.upsert({
        where: { 
          // استخدام عنوان فريد للتحقق من وجود المنتج
          title: product.title
        },
        update: {},
        create: product
      })
    }

    console.log('✅ تم إضافة المنتجات التجريبية بنجاح!')
    
  } catch (error) {
    console.error('❌ خطأ في إضافة المنتجات:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedProducts()