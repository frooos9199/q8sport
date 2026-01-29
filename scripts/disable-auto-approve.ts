import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('⚙️  تعطيل الموافقة التلقائية...\n');

  // Disable auto-approve
  await prisma.appSettings.upsert({
    where: { id: 1 },
    update: { autoApprove: false },
    create: { 
      id: 1, 
      autoApprove: false,
      maintenanceMode: false,
      allowRegistrations: true,
      maxProductsPerUser: 10
    }
  });

  console.log('✅ تم تعطيل الموافقة التلقائية');
  console.log('📝 الآن المنتجات الجديدة ستحتاج موافقة الأدمن\n');

  // Get current settings
  const settings = await prisma.appSettings.findUnique({ where: { id: 1 } });
  console.log('الإعدادات الحالية:');
  console.log(`- الموافقة التلقائية: ${settings?.autoApprove ? 'مفعلة ✅' : 'معطلة ❌'}`);
  console.log(`- الحد الأقصى للمنتجات: ${settings?.maxProductsPerUser}`);
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
