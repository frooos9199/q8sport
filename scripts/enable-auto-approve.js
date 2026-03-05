// سكريبت لتفعيل الموافقة التلقائية وتحديث جميع المنتجات والعروض المعلقة
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function enableAutoApprove() {
  try {
    console.log('🔄 بدء تحديث نظام الموافقات...\n');

    // 1. تحديث جميع المنتجات من INACTIVE إلى ACTIVE
    const productsUpdated = await prisma.product.updateMany({
      where: { status: 'INACTIVE' },
      data: { status: 'ACTIVE' }
    });
    console.log(`✅ تم تحديث ${productsUpdated.count} منتج من INACTIVE إلى ACTIVE`);

    // 2. تحديث جميع العروض من PENDING إلى APPROVED
    const showcasesUpdated = await prisma.showcase.updateMany({
      where: { status: 'PENDING' },
      data: { status: 'APPROVED' }
    });
    console.log(`✅ تم تحديث ${showcasesUpdated.count} عرض من PENDING إلى APPROVED`);

    // 3. تحديث إعدادات التطبيق
    await prisma.$executeRaw`
      UPDATE "app_settings"
      SET "autoApprove" = TRUE
      WHERE id = 1
    `;
    console.log(`✅ تم تفعيل الموافقة التلقائية في إعدادات التطبيق`);

    // 4. عرض الإحصائيات
    console.log('\n📊 الإحصائيات الحالية:');
    
    const activeProducts = await prisma.product.count({
      where: { status: 'ACTIVE' }
    });
    console.log(`   - المنتجات النشطة: ${activeProducts}`);

    const approvedShowcases = await prisma.showcase.count({
      where: { status: 'APPROVED' }
    });
    console.log(`   - العروض المعتمدة: ${approvedShowcases}`);

    const pendingProducts = await prisma.product.count({
      where: { status: 'INACTIVE' }
    });
    console.log(`   - المنتجات المعلقة المتبقية: ${pendingProducts}`);

    const pendingShowcases = await prisma.showcase.count({
      where: { status: 'PENDING' }
    });
    console.log(`   - العروض المعلقة المتبقية: ${pendingShowcases}`);

    console.log('\n✨ تم الانتهاء بنجاح! الآن جميع المنتجات والعروض الجديدة ستظهر تلقائياً بدون موافقة.');

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

enableAutoApprove();
