import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyTokenString } from '@/lib/auth';
import { filterContent } from '@/lib/contentFilter';

/**
 * POST /api/moderation/report
 * Report objectionable content
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
    const { contentType, contentId, reason, details } = body;

    // Validate required fields
    if (!contentType || !contentId || !reason) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      );
    }

    // Check if user already reported this content
    const existingReport = await prisma.contentReport.findFirst({
      where: {
        contentType,
        contentId,
        reportedById: decoded.userId,
        status: {
          in: ['PENDING', 'REVIEWING'],
        },
      },
    });

    if (existingReport) {
      return NextResponse.json(
        { error: 'لقد قمت بالإبلاغ عن هذا المحتوى مسبقاً' },
        { status: 400 }
      );
    }

    // Determine priority based on reason
    let priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM';
    const criticalReasons = [
      'VIOLENT_CONTENT',
      'HATE_SPEECH',
      'ADULT_CONTENT',
      'ILLEGAL_ACTIVITY',
    ];
    const highReasons = ['HARASSMENT', 'FRAUD'];

    if (criticalReasons.includes(reason)) {
      priority = 'CRITICAL';
    } else if (highReasons.includes(reason)) {
      priority = 'HIGH';
    } else if (reason === 'SPAM') {
      priority = 'LOW';
    }

    // Filter the details text for bad words
    let filteredDetails = details;
    if (details) {
      const filterResult = await filterContent(details);
      if (!filterResult.isClean) {
        filteredDetails = `[تحذير: يحتوي على كلمات غير لائقة] ${details}`;
      }
    }

    // Create the report
    const report = await prisma.contentReport.create({
      data: {
        contentType,
        contentId,
        reason,
        details: filteredDetails,
        priority,
        reportedById: decoded.userId,
      },
      include: {
        reportedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // If critical, auto-hide the content immediately
    if (priority === 'CRITICAL') {
      await autoModerateContent(contentType, contentId, reason);
    }

    return NextResponse.json({
      success: true,
      message: 'تم إرسال البلاغ بنجاح. سيتم مراجعته خلال 24 ساعة.',
      report,
    });
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إرسال البلاغ' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/moderation/report
 * Get all reports (admin only)
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
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const [reports, total] = await Promise.all([
      prisma.contentReport.findMany({
        where,
        include: {
          reportedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          moderationActions: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.contentReport.count({ where }),
    ]);

    return NextResponse.json({
      reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب البلاغات' },
      { status: 500 }
    );
  }
}

/**
 * Auto-moderate critical content
 */
async function autoModerateContent(
  contentType: string,
  contentId: string,
  reason: string
) {
  try {
    // Get the content owner
    let ownerId: string | null = null;

    switch (contentType) {
      case 'PRODUCT':
        const product = await prisma.product.findUnique({
          where: { id: contentId },
          select: { userId: true },
        });
        ownerId = product?.userId || null;
        // Hide the product
        if (product) {
          await prisma.product.update({
            where: { id: contentId },
            data: { status: 'INACTIVE' },
          });
        }
        break;

      case 'SHOWCASE':
        const showcase = await prisma.showcase.findUnique({
          where: { id: contentId },
          select: { userId: true },
        });
        ownerId = showcase?.userId || null;
        // Reject the showcase
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
        ownerId = comment?.userId || null;
        // Delete the comment
        if (comment) {
          await prisma.showcaseComment.delete({
            where: { id: contentId },
          });
        }
        break;
    }

    // Ban the content
    if (ownerId) {
      await prisma.bannedContent.create({
        data: {
          contentType: contentType as any,
          contentId,
          reason: `Auto-moderated: ${reason}`,
          permanent: false,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          userId: ownerId,
        },
      });
    }
  } catch (error) {
    console.error('Error auto-moderating content:', error);
  }
}
