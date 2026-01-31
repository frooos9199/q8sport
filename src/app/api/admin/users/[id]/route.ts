import { NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest, canManageUsers } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const GET = requireAuth(async (
  request: AuthenticatedRequest,
  context: { params: Promise<{ id: string }> }
) => {
  const currentUser = request.user;

  if (!currentUser || (!canManageUsers(currentUser) && currentUser.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'ليس لديك صلاحية لعرض المستخدم' }, { status: 403 });
  }

  try {
    const { id } = await context.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        whatsapp: true,
        role: true,
        status: true,
        createdAt: true,
        lastLoginAt: true,
        shopName: true,
        shopAddress: true,
        businessType: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
    }

    const products = await prisma.product.findMany({
      where: {
        userId: id,
        status: { not: 'DELETED' },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        productType: true,
        condition: true,
        category: true,
        carBrand: true,
        carModel: true,
        carYear: true,
        kilometers: true,
        color: true,
        images: true,
        status: true,
        views: true,
        createdAt: true,
        soldPrice: true,
        soldDate: true,
      },
    });

    return NextResponse.json({
      success: true,
      user,
      products,
    });
  } catch (error) {
    console.error('Admin user details error:', error);
    return NextResponse.json({ error: 'حدث خطأ في جلب بيانات المستخدم' }, { status: 500 });
  }
});
