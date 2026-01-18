import { NextResponse } from 'next/server';
import { requireAdmin, AuthenticatedRequest } from '../../../../../lib/auth';
import { prisma } from '../../../../../lib/prisma';

// DELETE /api/admin/products/:id - Hard delete product (admin only)
export const DELETE = requireAdmin(async (
  _request: AuthenticatedRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await context.params;

    // Deleting product will cascade favorites due to schema onDelete: Cascade
    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'تم حذف المنتج نهائياً' });
  } catch (error) {
    console.error('Admin hard delete product error:', error);
    return NextResponse.json({ error: 'فشل حذف المنتج نهائياً' }, { status: 500 });
  }
});
