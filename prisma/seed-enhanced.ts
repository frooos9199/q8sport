import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // إنشاء مستخدم تجريبي
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      password: 'password123',
      name: 'مستخدم تجريبي',
      phone: '96550000000',
      whatsapp: '96550000000',
      role: 'USER'
    }
  })

  // إنشاء منتجات تجريبية
  const products = [
    {
      title: 'فورد موستانج GT 2020',
      description: 'سيارة رياضية بحالة ممتازة، محرك V8 5.0L، لون أحمر، كيلومترات قليلة',
      price: 25000,
      productType: 'CAR',
      carBrand: 'Ford',
      carModel: 'Mustang',
      carYear: 2020,
      kilometers: 15000,
      color: 'أحمر',
      transmission: 'أوتوماتيك',
      fuelType: 'بنزين',
      engineSize: 'V8 5.0L',
      condition: 'ممتازة',
      contactPhone: '96550000001',
      contactWhatsapp: '96550000001',
      preferredContact: JSON.stringify(['phone', 'whatsapp_call']),
      images: JSON.stringify(['/placeholder-car.jpg']),
      userId: user.id
    },
    {
      title: 'شفروليت كورفيت 2019',
      description: 'سيارة رياضية فاخرة، محرك V8، لون أزرق، بحالة ممتازة',
      price: 35000,
      productType: 'CAR',
      carBrand: 'Chevrolet',
      carModel: 'Corvette',
      carYear: 2019,
      kilometers: 8000,
      color: 'أزرق',
      transmission: 'أوتوماتيك',
      fuelType: 'بنزين',
      engineSize: 'V8 6.2L',
      condition: 'ممتازة',
      contactPhone: '96550000002',
      contactWhatsapp: '96550000002',
      preferredContact: JSON.stringify(['whatsapp_message', 'phone']),
      images: JSON.stringify(['/placeholder-car.jpg']),
      userId: user.id
    },
    {
      title: 'قطعة غيار - فلتر هواء موستانج',
      description: 'فلتر هواء أصلي لفورد موستانج 2015-2020، جديد بالكرتون',
      price: 45,
      productType: 'PART',
      carBrand: 'Ford',
      carModel: 'Mustang',
      condition: 'جديدة',
      contactPhone: '96550000003',
      contactWhatsapp: '96550000003',
      preferredContact: JSON.stringify(['whatsapp_message']),
      images: JSON.stringify(['/placeholder-car.jpg']),
      userId: user.id
    },
    {
      title: 'تويوتا سوبرا 2021',
      description: 'سيارة رياضية يابانية، محرك تيربو، لون أبيض، حالة ممتازة',
      price: 28000,
      productType: 'CAR',
      carBrand: 'Toyota',
      carModel: 'Supra',
      carYear: 2021,
      kilometers: 12000,
      color: 'أبيض',
      transmission: 'أوتوماتيك',
      fuelType: 'بنزين',
      engineSize: '3.0L Turbo',
      condition: 'ممتازة',
      contactPhone: '96550000004',
      contactWhatsapp: '96550000004',
      preferredContact: JSON.stringify(['phone', 'whatsapp_call', 'whatsapp_message']),
      images: JSON.stringify(['/placeholder-car.jpg']),
      userId: user.id
    }
  ]

  for (const productData of products) {
    await prisma.product.create({
      data: productData
    })
  }

  console.log('تم إنشاء البيانات التجريبية بنجاح!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })