import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('إضافة صور الأفاتار للمستخدمين...');

  // الحصول على جميع المستخدمين الذين ليس لديهم صور أفاتار
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { avatar: null },
        { avatar: '' }
      ]
    }
  });

  console.log(`تم العثور على ${users.length} مستخدم بدون صورة أفاتار`);

  // قائمة صور أفاتار تجريبية
  const avatarUrls = [
    'https://via.placeholder.com/150x150/4a90e2/ffffff?text=A',
    'https://via.placeholder.com/150x150/f5a623/ffffff?text=M', 
    'https://via.placeholder.com/150x150/7ed321/ffffff?text=K',
    'https://via.placeholder.com/150x150/bd10e0/ffffff?text=S',
    'https://via.placeholder.com/150x150/d0021b/ffffff?text=Y',
    'https://via.placeholder.com/150x150/50e3c2/ffffff?text=H',
    'https://via.placeholder.com/150x150/417505/ffffff?text=N',
    'https://via.placeholder.com/150x150/9013fe/ffffff?text=O'
  ];

  // تحديث صور الأفاتار للمستخدمين
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const avatarUrl = avatarUrls[i % avatarUrls.length];
    
    await prisma.user.update({
      where: { id: user.id },
      data: { avatar: avatarUrl }
    });
    
    console.log(`تم تحديث صورة المستخدم: ${user.name}`);
  }

  console.log('تم الانتهاء من إضافة صور الأفاتار');
}

main()
  .catch((e) => {
    console.error('خطأ في إضافة صور الأفاتار:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });