import { NextResponse } from 'next/server';
import { requireAdmin, AuthenticatedRequest } from '../../../../../../lib/auth';
import { prisma } from '../../../../../../lib/prisma';

// PATCH /api/admin/users/:id/block - Block/unblock a user
// Body: { blocked: boolean }
export const PATCH = requireAdmin(async (
  request: AuthenticatedRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const blocked = Boolean(body?.blocked);

    const status = blocked ? 'SUSPENDED' : 'ACTIVE';

    const user = await prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        blocked: user.status !== 'ACTIVE',
      },
    });
  } catch (error) {
    console.error('Admin block user error:', error);
    return NextResponse.json({ error: 'فشل تحديث حالة المستخدم' }, { status: 500 });
  }
});
