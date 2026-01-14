import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET /api/requests - جلب كل الطلبات (عامة)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'ACTIVE';

    const requests = await prisma.request.findMany({
      where: {
        status: status as any,
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
      requests,
      count: requests.length,
    });
  } catch (error) {
    console.error('Error fetching requests:', error);
    return NextResponse.json(
      { success: false, error: 'فشل جلب الطلبات' },
      { status: 500 }
    );
  }
}

// POST /api/requests - إنشاء طلب جديد (مصادقة)
export async function POST(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'يجب تسجيل الدخول أولاً' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { title, description, carBrand, carModel, carYear, image, phone } = body;

    // Validation
    if (!title || !description || !phone) {
      return NextResponse.json(
        { success: false, error: 'يرجى ملء جميع الحقول المطلوبة' },
        { status: 400 }
      );
    }

    const request = await prisma.request.create({
      data: {
        userId: user.id,
        title,
        description,
        carBrand: carBrand || null,
        carModel: carModel || null,
        carYear: carYear ? parseInt(carYear) : null,
        image: image || null,
        phone,
        status: 'ACTIVE',
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

    return NextResponse.json({
      success: true,
      request,
      message: 'تم إضافة الطلب بنجاح',
    });
  } catch (error) {
    console.error('Error creating request:', error);
    return NextResponse.json(
      { success: false, error: 'فشل إضافة الطلب' },
      { status: 500 }
    );
  }
}
