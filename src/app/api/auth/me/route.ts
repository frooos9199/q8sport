import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const GET = requireAuth(async (request: AuthenticatedRequest) => {
  try {
    const user = request.user;
    
    if (!user) {
      return NextResponse.json(
        { error: 'غير مصرح بالدخول' },
        { status: 401 }
      );
    }

    // Get full user data with permissions
    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        canManageProducts: true,
        canManageUsers: true,
        canViewReports: true,
        canManageOrders: true,
        canManageShop: true,
        shopName: true,
        shopAddress: true,
        businessType: true
      }
    });

    if (!userData) {
      return NextResponse.json(
        { error: 'المستخدم غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      permissions: {
        canManageProducts: userData.canManageProducts,
        canManageUsers: userData.canManageUsers,
        canViewReports: userData.canViewReports,
        canManageOrders: userData.canManageOrders,
        canManageShop: userData.canManageShop
      },
      shopInfo: {
        shopName: userData.shopName,
        shopAddress: userData.shopAddress,
        businessType: userData.businessType
      }
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب بيانات المستخدم' },
      { status: 500 }
    );
  }
});