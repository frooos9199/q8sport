import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyTokenString } from '@/lib/auth';

/**
 * POST /api/moderation/action
 * Take moderation action on reported content (Admin only)
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

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const body = await req.json();
    const {
      reportId,
      actionType,
      reason,
      details,
      targetType,
      targetId,
      expiresAt,
      resolution,
    } = body;

    // Validate required fields
    if (!actionType || !reason || !targetType || !targetId) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      );
    }

    // Create moderation action
    const action = await prisma.moderationAction.create({
      data: {
        actionType,
        reason,
        details,
        targetType,
        targetId,
        moderatorId: decoded.userId,
        reportId: reportId || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    // Execute the action
    await executeModerationAction({
      actionType,
      targetType,
      targetId,
      reason,
      expiresAt,
    });

    // Update report status if reportId provided
    if (reportId) {
      await prisma.contentReport.update({
        where: { id: reportId },
        data: {
          status: 'RESOLVED',
          resolvedAt: new Date(),
          resolution: resolution || `Action taken: ${actionType}`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'تم تنفيذ الإجراء بنجاح',
      action,
    });
  } catch (error) {
    console.error('Error taking moderation action:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تنفيذ الإجراء' },
      { status: 500 }
    );
  }
}

/**
 * Execute moderation action
 */
async function executeModerationAction(params: {
  actionType: string;
  targetType: string;
  targetId: string;
  reason: string;
  expiresAt?: Date | null;
}) {
  const { actionType, targetType, targetId, reason, expiresAt } = params;

  switch (actionType) {
    case 'CONTENT_REMOVED':
      await removeContent(targetType, targetId, reason, expiresAt);
      break;

    case 'USER_SUSPENDED':
      await suspendUser(targetId, reason, expiresAt);
      break;

    case 'USER_BANNED':
      await banUser(targetId, reason);
      break;

    case 'WARNING':
      await sendWarning(targetId, reason);
      break;

    case 'CONTENT_EDITED':
      // Manual action - just log it
      break;

    case 'NO_ACTION':
      // No action needed
      break;
  }
}

/**
 * Remove content
 */
async function removeContent(
  contentType: string,
  contentId: string,
  reason: string,
  expiresAt?: Date | null
) {
  // Ban the content
  const existingBan = await prisma.bannedContent.findUnique({
    where: {
      contentType_contentId: {
        contentType: contentType as any,
        contentId,
      },
    },
  });

  if (!existingBan) {
    // Get content owner
    let userId: string | null = null;

    switch (contentType) {
      case 'PRODUCT':
        const product = await prisma.product.findUnique({
          where: { id: contentId },
          select: { userId: true },
        });
        userId = product?.userId || null;
        // Set product to INACTIVE
        if (product) {
          await prisma.product.update({
            where: { id: contentId },
            data: { status: 'DELETED' },
          });
        }
        break;

      case 'SHOWCASE':
        const showcase = await prisma.showcase.findUnique({
          where: { id: contentId },
          select: { userId: true },
        });
        userId = showcase?.userId || null;
        // Set showcase to REJECTED
        if (showcase) {
          await prisma.showcase.update({
            where: { id: contentId },
            data: { status: 'REJECTED' },
          });
        }
        break;

      case 'COMMENT':
        const comment = await prisma.showcaseComment.findUnique({
          where: { id: contentId },
          select: { userId: true },
        });
        userId = comment?.userId || null;
        // Delete comment
        if (comment) {
          await prisma.showcaseComment.delete({
            where: { id: contentId },
          });
        }
        break;

      case 'REQUEST':
        const request = await prisma.request.findUnique({
          where: { id: contentId },
          select: { userId: true },
        });
        userId = request?.userId || null;
        // Cancel request
        if (request) {
          await prisma.request.update({
            where: { id: contentId },
            data: { status: 'CANCELLED' },
          });
        }
        break;
    }

    if (userId) {
      await prisma.bannedContent.create({
        data: {
          contentType: contentType as any,
          contentId,
          reason,
          permanent: !expiresAt,
          expiresAt,
          userId,
        },
      });

      // Notify user
      await prisma.notification.create({
        data: {
          type: 'ACCOUNT_VERIFIED', // Using existing type
          title: 'تم حذف محتوى',
          message: `تم حذف محتواك بسبب: ${reason}`,
          userId,
          data: {
            contentType,
            contentId,
            reason,
          },
        },
      });
    }
  }
}

/**
 * Suspend user temporarily
 */
async function suspendUser(
  userId: string,
  reason: string,
  expiresAt?: Date | null
) {
  await prisma.user.update({
    where: { id: userId },
    data: { status: 'SUSPENDED' },
  });

  // Notify user
  await prisma.notification.create({
    data: {
      type: 'ACCOUNT_VERIFIED',
      title: 'تم إيقاف حسابك مؤقتاً',
      message: `تم إيقاف حسابك حتى ${expiresAt?.toLocaleDateString('ar-KW') || 'إشعار آخر'} بسبب: ${reason}`,
      userId,
      data: {
        reason,
        expiresAt,
      },
    },
  });
}

/**
 * Ban user permanently
 */
async function banUser(userId: string, reason: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { status: 'BANNED' },
  });

  // Notify user
  await prisma.notification.create({
    data: {
      type: 'ACCOUNT_VERIFIED',
      title: 'تم حظر حسابك نهائياً',
      message: `تم حظر حسابك نهائياً بسبب: ${reason}`,
      userId,
      data: {
        reason,
        permanent: true,
      },
    },
  });
}

/**
 * Send warning to user
 */
async function sendWarning(userId: string, reason: string) {
  await prisma.notification.create({
    data: {
      type: 'ACCOUNT_VERIFIED',
      title: '⚠️ تحذير',
      message: `تحذير: ${reason}. المخالفات المتكررة قد تؤدي إلى إيقاف أو حظر حسابك.`,
      userId,
      data: {
        warning: true,
        reason,
      },
    },
  });
}

/**
 * GET /api/moderation/action
 * Get moderation actions history (Admin only)
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

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const [actions, total] = await Promise.all([
      prisma.moderationAction.findMany({
        include: {
          moderator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          report: {
            select: {
              id: true,
              reason: true,
              contentType: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.moderationAction.count(),
    ]);

    return NextResponse.json({
      actions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching moderation actions:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الإجراءات' },
      { status: 500 }
    );
  }
}
