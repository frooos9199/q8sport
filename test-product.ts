import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testProductCreation() {
  try {
    console.log('اختبار إضافة منتج...')
    
    const product = await prisma.product.create({
      data: {
        title: 'فورد موستانج GT 2021 - اختبار',
        description: 'سيارة رياضية بحالة ممتازة للاختبار',
        price: 28000,
        condition: 'ممتازة',
        category: 'سيارات رياضية',
        productType: 'CAR',
        carBrand: 'Ford',
        carModel: 'Mustang',
        carYear: 2021,
        kilometers: 12000,
        color: 'أحمر',
        images: JSON.stringify(['/test-image.jpg']),
        userId: 'test-user-id',
        status: 'ACTIVE'
      }
    })
    
    console.log('✅ تم إنشاء المنتج بنجاح!')
    console.log('ID:', product.id)
    console.log('العنوان:', product.title)
    console.log('النوع:', product.productType)
    console.log('الماركة:', product.carBrand)
    
  } catch (error) {
    console.error('❌ خطأ في إنشاء المنتج:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testProductCreation()