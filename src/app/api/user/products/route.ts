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

    // Get user products with full details
    const products = await prisma.product.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        condition: true,
        category: true,
        images: true,
        status: true,
        featured: true,
        views: true,
        soldPrice: true,
        soldDate: true,
        buyerInfo: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json({ products });

  } catch (error) {
    console.error('Get user products error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب المنتجات' },
      { status: 500 }
    );
  }
});