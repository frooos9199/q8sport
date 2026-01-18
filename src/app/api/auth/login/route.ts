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

    // Find user by email in database
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        whatsapp: true,
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
      }
    });

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
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في النظام' },
      { status: 500 }
    );
  }
}