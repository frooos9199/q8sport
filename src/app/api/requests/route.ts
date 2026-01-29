import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { Prisma } from '@prisma/client';

function normalizePhone(input: unknown) {
  if (!input) return '';
  return String(input).replace(/[^0-9]/g, '');
}

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
            phone: true,
            whatsapp: true,
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

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2022') {
      return NextResponse.json(
        {
          success: false,
          error: 'قاعدة البيانات غير محدثة. يرجى تشغيل prisma db push / migrate ثم إعادة المحاولة',
        },
        { status: 503 }
      );
    }

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

    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { phone: true, whatsapp: true },
    });

    const body = await req.json();
    const {
      title,
      description,
      carBrand,
      carModel,
      carYear,
      category,
      partName,
      condition,
      budget,
      urgent,
      contactPhone,
      contactWhatsapp,
      phone,
      whatsapp,
      images
    } = body;

    // Validation
    if (!title || !description) {
      return NextResponse.json(
        { success: false, error: 'العنوان والوصف مطلوبان' },
        { status: 400 }
      );
    }

    // Enforce WhatsApp matches the one used at registration/profile
    const registeredWhatsapp = dbUser?.whatsapp || dbUser?.phone || null;
    const providedWhatsappRaw = contactWhatsapp ?? whatsapp ?? null;
    if (providedWhatsappRaw) {
      const providedDigits = normalizePhone(providedWhatsappRaw);
      const registeredDigits = normalizePhone(registeredWhatsapp);
      if (registeredDigits && providedDigits && providedDigits !== registeredDigits) {
        return NextResponse.json(
          { success: false, error: 'رقم الواتساب يجب أن يطابق رقم الواتساب المسجل في الحساب' },
          { status: 400 }
        );
      }
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
        images: images ? (typeof images === 'string' ? images : JSON.stringify(images)) : null,
        // Keep backward compat: accept phone/whatsapp but store normalized contact fields.
        contactPhone: contactPhone || phone || dbUser?.phone || null,
        contactWhatsapp: registeredWhatsapp,
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

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2022') {
      return NextResponse.json(
        {
          success: false,
          error: 'قاعدة البيانات غير محدثة (طلبات). يلزم تحديث الـ DB ثم إعادة المحاولة.',
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'فشل إضافة الطلب' },
      { status: 500 }
    );
  }
}
