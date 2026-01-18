import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET /api/requests/[id] - جلب طلب واحد (عامة)
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const request = await prisma.request.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            whatsapp: true,
            rating: true,
            avatar: true
          }
        }
      }
    });

    if (!request) {
      return NextResponse.json(
        { success: false, error: 'الطلب غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, request });
  } catch (error) {
    console.error('Error fetching request:', error);
    return NextResponse.json(
      { success: false, error: 'فشل جلب الطلب' },
      { status: 500 }
    );
  }
}

// PATCH /api/requests/[id] - تعديل طلب
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyToken(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'يجب تسجيل الدخول أولاً' },
        { status: 401 }
      );
    }

    const params = await context.params;
    const { id } = params;
    const body = await req.json();

    // Check ownership
    const existingRequest = await prisma.request.findUnique({
      where: { id },
    });

    if (!existingRequest) {
      return NextResponse.json(
        { success: false, error: 'الطلب غير موجود' },
        { status: 404 }
      );
    }

    if (existingRequest.userId !== user.userId && user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'غير مصرح لك بتعديل هذا الطلب' },
        { status: 403 }
      );
    }

    const updateData: Record<string, unknown> = {};
    
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.carBrand !== undefined) updateData.carBrand = body.carBrand || null;
    if (body.carModel !== undefined) updateData.carModel = body.carModel || null;
    if (body.carYear !== undefined) updateData.carYear = body.carYear ? parseInt(body.carYear) : null;
    // Request model uses contactPhone/contactWhatsapp (keep backward compat with phone/whatsapp)
    if (body.contactPhone !== undefined) updateData.contactPhone = body.contactPhone || null;
    if (body.contactWhatsapp !== undefined) updateData.contactWhatsapp = body.contactWhatsapp || null;
    if (body.phone !== undefined) updateData.contactPhone = body.phone || null;
    if (body.whatsapp !== undefined) updateData.contactWhatsapp = body.whatsapp || null;
    if (body.status !== undefined) updateData.status = body.status;

    const updatedRequest = await prisma.request.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json({
      success: true,
      request: updatedRequest,
      message: 'تم تحديث الطلب بنجاح',
    });
  } catch (error) {
    console.error('Error updating request:', error);
    return NextResponse.json(
      { success: false, error: 'فشل تحديث الطلب' },
      { status: 500 }
    );
  }
}

// DELETE /api/requests/[id] - حذف طلب
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyToken(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'يجب تسجيل الدخول أولاً' },
        { status: 401 }
      );
    }

    const params = await context.params;
    const { id } = params;

    // Check ownership
    const existingRequest = await prisma.request.findUnique({
      where: { id },
    });

    if (!existingRequest) {
      return NextResponse.json(
        { success: false, error: 'الطلب غير موجود' },
        { status: 404 }
      );
    }

    if (existingRequest.userId !== user.userId && user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'غير مصرح لك بحذف هذا الطلب' },
        { status: 403 }
      );
    }

    await prisma.request.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'تم حذف الطلب بنجاح',
    });
  } catch (error) {
    console.error('Error deleting request:', error);
    return NextResponse.json(
      { success: false, error: 'فشل حذف الطلب' },
      { status: 500 }
    );
  }
}
