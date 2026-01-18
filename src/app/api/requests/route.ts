import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

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
            phone: true,
            rating: true,
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
    const user = await verifyToken(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'يجب تسجيل الدخول أولاً' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { title, description, carBrand, carModel, carYear, category, partName, condition, budget, urgent, contactPhone, contactWhatsapp } = body;

    // Validation
    if (!title || !description) {
      return NextResponse.json(
        { success: false, error: 'العنوان والوصف مطلوبان' },
        { status: 400 }
      );
    }

    const request = await prisma.request.create({
      data: {
        userId: user.userId,
        title,
        description,
        category: category || 'قطع غيار',
        carBrand: carBrand || null,
        carModel: carModel || null,
        carYear: carYear ? parseInt(carYear) : null,
        partName: partName || null,
        condition: condition || null,
        budget: budget ? parseFloat(budget) : null,
        urgent: urgent || false,
        contactPhone: contactPhone || null,
        contactWhatsapp: contactWhatsapp || null,
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
