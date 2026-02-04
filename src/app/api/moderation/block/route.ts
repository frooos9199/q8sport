import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyTokenString } from '@/lib/auth';

/**
 * POST /api/moderation/block
 * Block a user
 */
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = await verifyTokenString(token);
    if (!decoded) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const body = await req.json();
    const { userId, reason } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'معرف المستخدم مطلوب' },
        { status: 400 }
      );
    }

    // Can't block yourself
    if (userId === decoded.userId) {
      return NextResponse.json(
        { error: 'لا يمكنك حظر نفسك' },
        { status: 400 }
      );
    }

    // Check if already blocked
    const existingBlock = await prisma.blockedUser.findUnique({
      where: {
        userId_blockedById: {
          userId,
          blockedById: decoded.userId,
        },
      },
    });

    if (existingBlock) {
      return NextResponse.json(
        { error: 'هذا المستخدم محظور مسبقاً' },
        { status: 400 }
      );
    }

    // Verify the user exists
    const userToBlock = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true },
    });

    if (!userToBlock) {
      return NextResponse.json(
        { error: 'المستخدم غير موجود' },
        { status: 404 }
      );
    }

    // Create the block
    const block = await prisma.blockedUser.create({
      data: {
        userId,
        blockedById: decoded.userId,
        reason,
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
    });

    // Notify admin about the block (for monitoring abusive users)
    await prisma.notification.create({
      data: {
        type: 'ACCOUNT_VERIFIED', // Using existing type as placeholder
        title: 'حظر مستخدم',
        message: `المستخدم ${decoded.userId} قام بحظر المستخدم ${userId}${reason ? `: ${reason}` : ''}`,
        userId: decoded.userId, // Send to blocking user
        data: {
          blockedUserId: userId,
          reason,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'تم حظر المستخدم بنجاح. لن ترى محتواه بعد الآن.',
      block,
    });
  } catch (error) {
    console.error('Error blocking user:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حظر المستخدم' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/moderation/block?userId=xxx
 * Unblock a user
 */
export async function DELETE(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = await verifyTokenString(token);
    if (!decoded) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'معرف المستخدم مطلوب' },
        { status: 400 }
      );
    }

    // Find and delete the block
    const block = await prisma.blockedUser.findUnique({
      where: {
        userId_blockedById: {
          userId,
          blockedById: decoded.userId,
        },
      },
    });

    if (!block) {
      return NextResponse.json(
        { error: 'المستخدم غير محظور' },
        { status: 404 }
      );
    }

    await prisma.blockedUser.delete({
      where: { id: block.id },
    });

    return NextResponse.json({
      success: true,
      message: 'تم إلغاء حظر المستخدم بنجاح',
    });
  } catch (error) {
    console.error('Error unblocking user:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إلغاء الحظر' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/moderation/block
 * Get all blocked users for current user
 */
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = await verifyTokenString(token);
    if (!decoded) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const blockedUsers = await prisma.blockedUser.findMany({
      where: {
        blockedById: decoded.userId,
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
      blockedUsers,
      count: blockedUsers.length,
    });
  } catch (error) {
    console.error('Error fetching blocked users:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب المستخدمين المحظورين' },
      { status: 500 }
    );
  }
}
