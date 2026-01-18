import { NextResponse } from 'next/server';
import { requireAdmin, AuthenticatedRequest } from '../../../../../../lib/auth';
import { prisma } from '../../../../../../lib/prisma';

// PATCH /api/admin/products/:id/block - Block/unblock a product
// Body: { blocked: boolean }
// Note: Prisma schema doesn't have a BLOCKED status. We use DELETED as blocked/rejected (soft-delete).
export const PATCH = requireAdmin(async (
  request: AuthenticatedRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const blocked = Boolean(body?.blocked);

    const updated = await prisma.product.update({
      where: { id },
      data: { status: blocked ? 'DELETED' : 'ACTIVE' },
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
    console.error('Admin block product error:', error);
    return NextResponse.json({ error: 'فشل تحديث حالة المنتج' }, { status: 500 });
  }
});
