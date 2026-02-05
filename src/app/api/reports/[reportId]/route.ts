import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

/**
 * PATCH /api/reports/[reportId]
 * Update report status (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const user = await verifyToken(request);
    
    // Check admin permissions
    if (!user?.userId || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'غير مصرح لك بهذا الإجراء' },
        { status: 403 }
      );
    }

    const { reportId } = await params;
    const body = await request.json();
    const { action } = body;

    let updateData: any = {};

    switch (action) {
      case 'review':
        updateData.status = 'REVIEWING';
        updateData.reviewedAt = new Date();
        break;
      
      case 'resolve':
        updateData.status = 'RESOLVED';
        updateData.resolvedAt = new Date();
        break;
      
      case 'dismiss':
        updateData.status = 'DISMISSED';
        updateData.resolvedAt = new Date();
        break;
      
      case 'escalate':
        updateData.priority = 'CRITICAL';
        break;
      
      default:
        return NextResponse.json(
          { error: 'إجراء غير صالح' },
          { status: 400 }
        );
    }

    const report = await prisma.contentReport.update({
      where: { id: reportId },
      data: updateData,
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

    // If resolved or dismissed, create moderation action
    if (action === 'resolve' || action === 'dismiss') {
      await prisma.moderationAction.create({
        data: {
          actionType: action === 'resolve' ? 'CONTENT_REMOVED' : 'NO_ACTION',
          reason: report.reason,
          details: report.details,
          reportId: report.id,
          moderatorId: user.userId,
          targetType: report.contentType as any,
          targetId: report.contentId,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'تم تحديث البلاغ بنجاح',
      report,
    });
  } catch (error) {
    console.error('Update report error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث البلاغ' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/reports/[reportId]
 * Get single report details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const user = await verifyToken(request);
    
    if (!user?.userId) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول' },
        { status: 401 }
      );
    }

    const { reportId } = await params;

    const report = await prisma.contentReport.findUnique({
      where: { id: reportId },
      include: {
        reportedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        moderationActions: {
          include: {
            moderator: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json(
        { error: 'البلاغ غير موجود' },
        { status: 404 }
      );
    }

    // Check permissions
    const isAdmin = user.role === 'ADMIN';
    const isReporter = report.reportedById === user.userId;

    if (!isAdmin && !isReporter) {
      return NextResponse.json(
        { error: 'غير مصرح لك بعرض هذا البلاغ' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error) {
    console.error('Get report error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحميل البلاغ' },
      { status: 500 }
    );
  }
}
