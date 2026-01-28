import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني وكلمة المرور مطلوبان' },
        { status: 400 }
      );
    }

    const userSelect = {
      id: true,
      email: true,
      name: true,
      phone: true,
      whatsapp: true,
      avatar: true,
      shopImage: true,
      password: true,
      role: true,
      status: true,
      canManageProducts: true,
      canManageUsers: true,
      canViewReports: true,
      canManageOrders: true,
      canManageShop: true,
      shopName: true,
      shopAddress: true,
      businessType: true
    } as const;

    // Find user by email in database (with demo fallback)
    let user = await prisma.user.findUnique({
      where: { email },
      select: userSelect,
    });

    const demoEmail = process.env.DEMO_USER_EMAIL || 'test@test.com';
    const demoPassword = process.env.DEMO_USER_PASSWORD || '123123';

    if (!user && email === demoEmail && password === demoPassword) {
      const hashedDemoPassword = await bcrypt.hash(demoPassword, 12);

      await prisma.user.upsert({
        where: { email: demoEmail },
        update: {
          password: hashedDemoPassword,
          status: 'ACTIVE',
          role: 'ADMIN',
          name: 'Demo User',
          verified: true,
          canManageProducts: true,
          canManageUsers: true,
          canViewReports: true,
          canManageOrders: true,
          canManageShop: true,
        },
        create: {
          email: demoEmail,
          password: hashedDemoPassword,
          name: 'Demo User',
          status: 'ACTIVE',
          role: 'ADMIN',
          verified: true,
          phone: null,
          whatsapp: null,
          canManageProducts: true,
          canManageUsers: true,
          canViewReports: true,
          canManageOrders: true,
          canManageShop: true,
        },
      });

      user = await prisma.user.findUnique({
        where: { email: demoEmail },
        select: userSelect,
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: 'البيانات غير صحيحة' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'الحساب غير مفعل. تواصل مع الإدارة' },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'البيانات غير صحيحة' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: 'تم تسجيل الدخول بنجاح',
      user: {
        ...userWithoutPassword,
        permissions: {
          canManageProducts: user.canManageProducts,
          canManageUsers: user.canManageUsers,
          canViewReports: user.canViewReports,
          canManageOrders: user.canManageOrders,
          canManageShop: user.canManageShop
        },
        shopInfo: {
          shopName: user.shopName,
          shopAddress: user.shopAddress,
          businessType: user.businessType
        }
      },
      token
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في النظام' },
      { status: 500 }
    );
  }
}