import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

/**
 * DELETE /api/blocks/[userId]
 * Unblock a user
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const user = await verifyToken(request);
    
    if (!user?.userId) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول' },
        { status: 401 }
      );
    }

    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: 'معرف المستخدم مطلوب' },
        { status: 400 }
      );
    }

    // Delete the block
    await prisma.blockedUser.delete({
      where: {
        userId_blockedById: {
          userId: userId,
          blockedById: user.userId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'تم إلغاء حظر المستخدم بنجاح',
    });
  } catch (error: any) {
    console.error('Unblock user error:', error);
    
    // Check if block doesn't exist
    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: 'المستخدم غير محظور' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'حدث خطأ أثناء إلغاء الحظر' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/blocks/check/[userId]
 * Check if a user is blocked
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const user = await verifyToken(request);
    
    if (!user?.userId) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول' },
        { status: 401 }
      );
    }

    const { userId } = await params;

    const block = await prisma.blockedUser.findUnique({
      where: {
        userId_blockedById: {
          userId: userId,
          blockedById: user.userId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      isBlocked: !!block,
    });
  } catch (error) {
    console.error('Check block error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء التحقق' },
      { status: 500 }
    );
  }
}
