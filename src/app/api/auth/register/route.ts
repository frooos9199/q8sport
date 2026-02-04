import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getAppSettings } from '@/lib/appSettings';

export async function POST(request: NextRequest) {
  try {
    const settings = await getAppSettings();
    if (!settings.allowRegistrations) {
      return NextResponse.json(
        { error: 'التسجيل مغلق حالياً' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, email, password, phone, whatsapp, acceptedTerms } = body;

    // Validate input (make phone optional to comply with privacy guidelines)
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'الاسم، البريد الإلكتروني، وكلمة المرور مطلوبة' },
        { status: 400 }
      );
    }

    // CRITICAL: Terms acceptance is REQUIRED (Apple Guideline 1.2)
    if (!acceptedTerms) {
      return NextResponse.json(
        { error: 'يجب الموافقة على شروط الخدمة للمتابعة' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUserByEmail) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مستخدم بالفعل' },
        { status: 409 }
      );
    }

    // Check if phone already exists (only when provided)
    if (phone) {
      const existingUserByPhone = await prisma.user.findUnique({
        where: { phone }
      });

      if (existingUserByPhone) {
        return NextResponse.json(
          { error: 'رقم الهاتف مستخدم بالفعل' },
          { status: 409 }
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with terms acceptance timestamp
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        whatsapp: whatsapp || phone || null,
        role: 'USER',
        status: 'ACTIVE',
        acceptedTermsAt: new Date(),
        termsVersion: '1.0', // Update this when terms change
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        whatsapp: true,
        role: true,
        status: true,
        createdAt: true,
        acceptedTermsAt: true,
      }
    });

    return NextResponse.json({
      message: 'تم إنشاء الحساب بنجاح',
      user
    }, {
      status: 201,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في النظام' },
      { status: 500 }
    );
  }
}