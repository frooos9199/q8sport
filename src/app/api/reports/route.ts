import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

/**
 * POST /api/reports
 * Submit a new report
 */
export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    
    if (!user?.userId) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول لتقديم بلاغ' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { contentType, contentId, reportedUserId, reason, details } = body;

    // Validate required fields
    if (!contentType || !contentId || !reportedUserId || !reason) {
      return NextResponse.json(
        { error: 'معلومات البلاغ غير مكتملة' },
        { status: 400 }
      );
    }

    // Check if user already reported this content
    const existingReport = await prisma.contentReport.findFirst({
      where: {
        reportedById: user.userId,
        contentType,
        contentId,
        status: {
          in: ['PENDING', 'REVIEWING'],
        },
      },
    });

    if (existingReport) {
      return NextResponse.json(
        { error: 'لقد قمت بالفعل بالإبلاغ عن هذا المحتوى' },
        { status: 409 }
      );
    }

    // Determine priority based on reason
    let priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM';
    const highPriorityReasons = [
      'INAPPROPRIATE_CONTENT',
      'HARASSMENT',
      'FRAUD',
      'HATE_SPEECH',
      'ADULT_CONTENT',
      'ILLEGAL_ACTIVITY',
    ];
    
    if (highPriorityReasons.includes(reason)) {
      priority = 'HIGH';
    }

    // Create the report
    const report = await prisma.contentReport.create({
      data: {
        contentType,
        contentId,
        reportedById: user.userId,
        reason,
        details: details || '',
        priority,
        status: 'PENDING',
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

    // TODO: Send notification to admin/moderators
    // await sendModeratorNotification(report);

    return NextResponse.json({
      success: true,
      message: 'تم إرسال البلاغ بنجاح. سيتم المراجعة خلال 24 ساعة.',
      report: {
        id: report.id,
        status: report.status,
        createdAt: report.createdAt,
      },
    });
  } catch (error) {
    console.error('Report submission error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تقديم البلاغ' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/reports
 * Get user's reports or all reports (for admins)
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

    const { searchParams } = new URL(request.url);
    const isAdmin = user.role === 'ADMIN';
    
    let reports;
    
    if (isAdmin) {
      // Admins can see all reports
      const status = searchParams.get('status');
      const priority = searchParams.get('priority');
      
      reports = await prisma.contentReport.findMany({
        where: {
          ...(status && { status: status as any }),
          ...(priority && { priority: priority as any }),
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
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' },
        ],
        take: 100,
      });
    } else {
      // Regular users can only see their own reports
      reports = await prisma.contentReport.findMany({
        where: {
          reportedById: user.userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 50,
      });
    }

    return NextResponse.json({
      success: true,
      reports,
    });
  } catch (error) {
    console.error('Get reports error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحميل البلاغات' },
      { status: 500 }
    );
  }
}
