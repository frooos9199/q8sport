import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

/**
 * POST /api/blocks
 * Block a user
 */
export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    
    if (!user?.userId) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول لحظر مستخدم' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { blockedUserId } = body;

    if (!blockedUserId) {
      return NextResponse.json(
        { error: 'معرف المستخدم مطلوب' },
        { status: 400 }
      );
    }

    // Can't block yourself
    if (blockedUserId === user.userId) {
      return NextResponse.json(
        { error: 'لا يمكنك حظر نفسك' },
        { status: 400 }
      );
    }

    // Check if already blocked
    const existingBlock = await prisma.blockedUser.findUnique({
      where: {
        userId_blockedById: {
          userId: blockedUserId,
          blockedById: user.userId,
        },
      },
    });

    if (existingBlock) {
      return NextResponse.json(
        { error: 'المستخدم محظور بالفعل' },
        { status: 409 }
      );
    }

    // Create block
    const block = await prisma.blockedUser.create({
      data: {
        userId: blockedUserId,
        blockedById: user.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'تم حظر المستخدم بنجاح',
      block,
    });
  } catch (error) {
    console.error('Block user error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حظر المستخدم' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/blocks
 * Get list of blocked users
 */
export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    
    if (!user?.userId) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول' },
        { status: 401 }
      );
    }

    const blockedUsers = await prisma.blockedUser.findMany({
      where: {
        blockedById: user.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      blockedUsers,
    });
  } catch (error) {
    console.error('Get blocked users error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحميل المستخدمين المحظورين' },
      { status: 500 }
    );
  }
}
