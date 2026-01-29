import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 البحث عن منتجات سعود الشمري...\n');

  // البحث عن المستخدم
  const user = await prisma.user.findFirst({
    where: {
      name: { contains: 'سعود', mode: 'insensitive' }
    },
    select: {
      id: true,
      name: true,
      email: true,
    }
  });

  if (!user) {
    console.log('❌ لم يتم العثور على المستخدم');
    return;
  }

  console.log(`✅ تم العثور على المستخدم: ${user.name} (${user.email})\n`);

  // البحث عن منتجات هذا المستخدم
  const products = await prisma.product.findMany({
    where: {
      userId: user.id
    },
    select: {
      id: true,
      title: true,
      price: true,
      status: true,
      createdAt: true,
    }
  });

  console.log(`📊 تم العثور على ${products.length} منتج:\n`);
  
  products.forEach((p, i) => {
    console.log(`${i + 1}. ${p.title} - ${p.price} د.ك - ${p.status}`);
  });

  if (products.length === 0) {
    console.log('\n✅ لا توجد منتجات لهذا المستخدم!');
    return;
  }

  console.log('\n🗑️  جاري حذف المنتجات...');

  const result = await prisma.product.deleteMany({
    where: {
      userId: user.id
    }
  });

  console.log(`\n✅ تم حذف ${result.count} منتج بنجاح!`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ خطأ:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
