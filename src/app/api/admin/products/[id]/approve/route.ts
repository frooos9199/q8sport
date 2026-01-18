import { NextResponse } from 'next/server';
import { requireAdmin, AuthenticatedRequest } from '../../../../../../lib/auth';
import { prisma } from '../../../../../../lib/prisma';

// PATCH /api/admin/products/:id/approve - Approve product (set ACTIVE)
export const PATCH = requireAdmin(async (
  _request: AuthenticatedRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await context.params;

    const updated = await prisma.product.update({
      where: { id },
      data: { status: 'ACTIVE' },
      select: {
        id: true,
        title: true,
        price: true,
        images: true,
        status: true,
        user: { select: { id: true, name: true, shopName: true, role: true } },
      },
    });

    const { user, ...rest } = updated;
    return NextResponse.json({
      success: true,
      product: { ...rest, seller: user },
    });
  } catch (error) {
    console.error('Admin approve product error:', error);
    return NextResponse.json({ error: 'فشل الموافقة على المنتج' }, { status: 500 });
  }
});
