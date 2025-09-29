import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function setUserPermissions(role: 'USER' | 'SELLER' | 'SHOP_OWNER' | 'ADMIN') {
  switch (role) {
    case 'ADMIN':
      return {
        canManageProducts: true,
        canManageUsers: true,
        canViewReports: true,
        canManageOrders: true,
        canManageShop: true
      }
    
    case 'SHOP_OWNER':
      return {
        canManageProducts: true,
        canManageUsers: false,
        canViewReports: true,
        canManageOrders: true,
        canManageShop: true
      }
    
    case 'SELLER':
      return {
        canManageProducts: true,
        canManageUsers: false,
        canViewReports: false,
        canManageOrders: false,
        canManageShop: false
      }
    
    default:
      return {
        canManageProducts: false,
        canManageUsers: false,
        canViewReports: false,
        canManageOrders: false,
        canManageShop: false
      }
  }
}

async function main() {
  console.log('تحديث صلاحيات المستخدمين...');

  // الحصول على جميع المستخدمين
  const users = await prisma.user.findMany();
  console.log(`تم العثور على ${users.length} مستخدم`);

  // تحديث صلاحيات كل مستخدم حسب دوره
  for (const user of users) {
    const permissions = setUserPermissions(user.role as any);
    
    // تحديد الدور المناسب حسب البيانات الحالية
    let newRole = user.role;
    
    // إذا كان لديه منتجات، اجعله بائع
    const productCount = await prisma.product.count({
      where: { userId: user.id }
    });
    
    if (productCount > 0 && user.role === 'USER') {
      newRole = 'SELLER';
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        role: newRole,
        canManageProducts: permissions.canManageProducts,
        canManageUsers: permissions.canManageUsers,
        canViewReports: permissions.canViewReports,
        canManageOrders: permissions.canManageOrders,
        canManageShop: permissions.canManageShop
      }
    });

    console.log(`تم تحديث المستخدم: ${user.name} - الدور: ${newRole}`);
  }

  // إنشاء مستخدم إدمن إذا لم يكن موجوداً
  const adminUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });

  if (!adminUser) {
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 12);

    const admin = await prisma.user.create({
      data: {
        email: 'admin@mazad.com',
        password: hashedPassword,
        name: 'الإدارة',
        phone: '96565000000',
        role: 'ADMIN',
        canManageProducts: true,
        canManageUsers: true,
        canViewReports: true,
        canManageOrders: true,
        canManageShop: true
      }
    });
    console.log(`تم إنشاء مستخدم الإدارة: ${admin.email}`);
  }

  // إنشاء مستخدم صاحب محل تجريبي
  const shopOwner = await prisma.user.findFirst({
    where: { role: 'SHOP_OWNER' }
  });

  if (!shopOwner) {
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('shop123', 12);

    const shop = await prisma.user.create({
      data: {
        email: 'shop@mazad.com',
        password: hashedPassword,
        name: 'صاحب المحل',
        phone: '96565111111',
        role: 'SHOP_OWNER',
        shopName: 'محل قطع الغيار الممتاز',
        shopAddress: 'الكويت، السالمية، شارع الخليج العربي',
        businessType: 'قطع غيار السيارات',
        canManageProducts: true,
        canManageUsers: false,
        canViewReports: true,
        canManageOrders: true,
        canManageShop: true
      }
    });
    console.log(`تم إنشاء مستخدم صاحب المحل: ${shop.email}`);
  }

  console.log('تم الانتهاء من تحديث الصلاحيات');
}

main()
  .catch((e) => {
    console.error('خطأ في تحديث الصلاحيات:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });