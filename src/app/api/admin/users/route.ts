import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, AuthenticatedRequest } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

// GET /api/admin/users - Get all users with filters (admin only)
export const GET = requireAdmin(async (request: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (role) {
      where.role = role;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get users with stats
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          whatsapp: true,
          role: true,
          status: true,
          rating: true,
          createdAt: true,
          lastLoginAt: true,
          _count: {
            select: {
              auctions: true,
              bids: true,
              sentMessages: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Users fetch error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب المستخدمين' },
      { status: 500 }
    );
  }
});

// POST /api/admin/users - Create new user (admin only)
export const POST = requireAdmin(async (request: AuthenticatedRequest) => {
  try {
    const body = await request.json();
    const { name, email, password, phone, whatsapp, role } = body;

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'الاسم والبريد الإلكتروني وكلمة المرور مطلوبة' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'المستخدم موجود بالفعل' },
        { status: 409 }
      );
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        whatsapp: whatsapp || phone || null,
        role: role || 'USER',
        status: 'ACTIVE'
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        whatsapp: true,
        role: true,
        status: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      message: 'تم إنشاء المستخدم بنجاح',
      user
    }, { status: 201 });

  } catch (error) {
    console.error('User creation error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في إنشاء المستخدم' },
      { status: 500 }
    );
  }
});