import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// DELETE /api/user/favorites/[id] - حذف من المفضلة
export const DELETE = requireAuth(async (
  request: AuthenticatedRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    const params = await context.params;
    const productId = params.id;
    const user = request.user;
    
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح بالدخول' }, { status: 401 });
    }

    // البحث عن المفضلة
    const favorite = await prisma.favorite.findFirst({
      where: {
        userId: user.userId,
        productId: productId,
      },
    });

    if (!favorite) {
      return NextResponse.json({ error: 'المنتج غير موجود في المفضلة' }, { status: 404 });
    }

    // حذف من المفضلة
    await prisma.favorite.delete({
      where: {
        id: favorite.id,
      },
    });

    return NextResponse.json({ 
      success: true,
      message: 'تم حذف المنتج من المفضلة'
    });

  } catch (error) {
    console.error('Delete from favorites error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف المنتج' },
      { status: 500 }
    );
  }
});
