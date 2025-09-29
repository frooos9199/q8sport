import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest, canManageUsers, setUserPermissions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

// GET /api/admin/users - Get all users with filters
export const GET = requireAuth(async (request: AuthenticatedRequest) => {
  const user = request.user;
  
  if (!canManageUsers(user) && user?.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'ليس لديك صلاحية لعرض المستخدمين' },
      { status: 403 }
    );
  }

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

    // Get users with stats and permissions
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
          shopName: true,
          shopAddress: true,
          businessType: true,
          canManageProducts: true,
          canManageUsers: true,
          canViewReports: true,
          canManageOrders: true,
          canManageShop: true,
          createdAt: true,
          lastLoginAt: true,
          _count: {
            select: {
              auctions: true,
              bids: true,
              products: true,
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

// POST /api/admin/users - Create new user
export const POST = requireAuth(async (request: AuthenticatedRequest) => {
  const user = request.user;
  
  if (!canManageUsers(user) && user?.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'ليس لديك صلاحية لإنشاء مستخدمين' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { name, email, password, phone, whatsapp, role, shopName, shopAddress, businessType } = body;

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

    // Set permissions based on role
    const permissions = setUserPermissions(role || 'USER');

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        whatsapp: whatsapp || phone || null,
        role: role || 'USER',
        status: 'ACTIVE',
        shopName: shopName || null,
        shopAddress: shopAddress || null,
        businessType: businessType || null,
        canManageProducts: permissions.canManageProducts,
        canManageUsers: permissions.canManageUsers,
        canViewReports: permissions.canViewReports,
        canManageOrders: permissions.canManageOrders,
        canManageShop: permissions.canManageShop
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        whatsapp: true,
        role: true,
        status: true,
        shopName: true,
        shopAddress: true,
        businessType: true,
        canManageProducts: true,
        canManageUsers: true,
        canViewReports: true,
        canManageOrders: true,
        canManageShop: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      message: 'تم إنشاء المستخدم بنجاح',
      user: newUser
    }, { status: 201 });

  } catch (error) {
    console.error('User creation error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في إنشاء المستخدم' },
      { status: 500 }
    );
  }
});

// PUT /api/admin/users - Update user role and permissions
export const PUT = requireAuth(async (request: AuthenticatedRequest) => {
  const user = request.user;
  
  if (!canManageUsers(user) && user?.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'ليس لديك صلاحية لتعديل المستخدمين' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { userId, role, status, permissions, shopName, shopAddress, businessType } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'معرف المستخدم مطلوب' },
        { status: 400 }
      );
    }

    // Set permissions based on role
    const rolePermissions = role ? setUserPermissions(role) : {};
    const finalPermissions = permissions ? { ...rolePermissions, ...permissions } : rolePermissions;

    const updateData: any = {};
    
    if (role) updateData.role = role;
    if (status) updateData.status = status;
    if (shopName !== undefined) updateData.shopName = shopName;
    if (shopAddress !== undefined) updateData.shopAddress = shopAddress;
    if (businessType !== undefined) updateData.businessType = businessType;
    
    if (finalPermissions) {
      updateData.canManageProducts = finalPermissions.canManageProducts;
      updateData.canManageUsers = finalPermissions.canManageUsers;
      updateData.canViewReports = finalPermissions.canViewReports;
      updateData.canManageOrders = finalPermissions.canManageOrders;
      updateData.canManageShop = finalPermissions.canManageShop;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        shopName: true,
        shopAddress: true,
        businessType: true,
        canManageProducts: true,
        canManageUsers: true,
        canViewReports: true,
        canManageOrders: true,
        canManageShop: true
      }
    });

    return NextResponse.json({
      message: 'تم تحديث المستخدم بنجاح',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث المستخدم' },
      { status: 500 }
    );
  }
});