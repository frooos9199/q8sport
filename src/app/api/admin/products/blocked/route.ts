import { NextResponse } from 'next/server';
import { requireAdmin, AuthenticatedRequest } from '../../../../../lib/auth';
import { prisma } from '../../../../../lib/prisma';

// GET /api/admin/products/blocked - List blocked products
// NOTE: This project does not have a BLOCKED status. We treat DELETED as blocked/rejected (soft-delete).
export const GET = requireAdmin(async (_request: AuthenticatedRequest) => {
  try {
    const products = await prisma.product.findMany({
      where: { status: 'DELETED' },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        images: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            shopName: true,
            shopAddress: true,
            role: true,
          },
        },
      },
    });

    const mapped = products.map((p) => {
      const { user, ...rest } = p;
      return {
        ...rest,
        status: 'BLOCKED',
        blockReason: 'تم رفض/إيقاف المنتج',
        seller: user,
      };
    });

    return NextResponse.json({ products: mapped });
  } catch (error) {
    console.error('Admin blocked products error:', error);
    return NextResponse.json({ error: 'حدث خطأ في جلب المنتجات المحظورة' }, { status: 500 });
  }
});
