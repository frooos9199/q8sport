import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyTokenString } from '@/lib/auth';

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
    // Debug: طبع جميع Headers
    const allHeaders: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      allHeaders[key] = value;
    });
    console.log('📨 Requests API - All Headers:', allHeaders);
    console.log('📨 Requests API - URL:', req.url);
    
    // التحقق من token المصادقة - جرب عدة طرق
    let token = '';
    let authHeader = req.headers.get('authorization') || 
                     req.headers.get('x-authorization') ||
                     req.headers.get('Authorization') ||
                     req.headers.get('X-Authorization');
    console.log('🔐 Requests API: Authorization header:', !!authHeader);
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
      console.log('✅ Token from Authorization header');
    } else {
      // جرب من query parameter
      const { searchParams } = new URL(req.url);
      const tokenFromQuery = searchParams.get('token');
      if (tokenFromQuery) {
        token = tokenFromQuery;
        console.log('✅ Token from query parameter');
      }
    }
    
    if (!token) {
      console.error('❌ Requests API: No token found');
      console.error('   Authorization header:', authHeader);
      console.error('   All headers:', allHeaders);
      return NextResponse.json(
        { success: false, error: 'يجب تسجيل الدخول أولاً' },
        { status: 401 }
      );
    }

    const decoded = await verifyTokenString(token)
    
    if (!decoded || !decoded.userId) {
      console.error('❌ Requests API: Invalid token or missing userId')
      return NextResponse.json(
        { success: false, error: 'رمز المصادقة غير صالح' },
        { status: 401 }
      );
    }

    console.log('✅ Requests API: User authenticated:', decoded.userId)

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
        userId: decoded.userId,
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
