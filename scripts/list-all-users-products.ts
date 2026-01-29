import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('👥 قائمة جميع المستخدمين ومنتجاتهم:\n');

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      _count: {
        select: {
          products: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  console.log(`📊 إجمالي المستخدمين: ${users.length}\n`);

  for (const user of users) {
    if (user._count.products > 0) {
      console.log(`\n👤 ${user.name} (${user.email})`);
      console.log(`   📦 عدد المنتجات: ${user._count.products}`);
      
      const products = await prisma.product.findMany({
        where: { userId: user.id },
        select: {
          id: true,
          title: true,
          status: true,
        },
        take: 5
      });

      products.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.title} [${p.status}]`);
      });
      
      if (user._count.products > 5) {
        console.log(`   ... و ${user._count.products - 5} منتج آخر`);
      }
    }
  }
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
