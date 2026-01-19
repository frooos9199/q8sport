import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    const authUser = await verifyToken(request);
    if (!authUser) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const {
      name,
      phone,
      whatsapp,
      email,
      password,
      shopName,
      shopAddress,
      businessType,
      shopImage,
      avatar,
    } = await request.json();

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json({ error: 'الاسم والبريد الإلكتروني مطلوبان' }, { status: 400 });
    }

    // Check if email is already taken by another user
    if (email !== authUser.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser && existingUser.id !== authUser.userId) {
        return NextResponse.json({ error: 'البريد الإلكتروني مستخدم بالفعل' }, { status: 400 });
      }
    }

    // Prepare update data
    const updateData: Prisma.UserUpdateInput = {
      name,
      email,
      phone: phone || null,
      whatsapp: whatsapp || null,
    };

    if (shopName !== undefined) updateData.shopName = shopName || null;
    if (shopAddress !== undefined) updateData.shopAddress = shopAddress || null;
    if (businessType !== undefined) updateData.businessType = businessType || null;
    if (shopImage !== undefined) updateData.shopImage = shopImage || null;
    if (avatar !== undefined) updateData.avatar = avatar || null;

    // Hash password if provided
    if (password) {
      if (password.length < 6) {
        return NextResponse.json({ error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }, { status: 400 });
      }
      updateData.password = await bcryptjs.hash(password, 10);
    }

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: authUser.userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        whatsapp: true,
        avatar: true,
        status: true,
        role: true,
        createdAt: true,
        canManageProducts: true,
        canManageUsers: true,
        canViewReports: true,
        canManageOrders: true,
        canManageShop: true,
        shopName: true,
        shopAddress: true,
        businessType: true,
        shopImage: true,
      }
    });

    // Generate new token with updated info
    const newToken = jwt.sign(
      {
        userId: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    return NextResponse.json({
      success: true,
      user: {
        ...updatedUser,
        permissions: {
          canManageProducts: updatedUser.canManageProducts,
          canManageUsers: updatedUser.canManageUsers,
          canViewReports: updatedUser.canViewReports,
          canManageOrders: updatedUser.canManageOrders,
          canManageShop: updatedUser.canManageShop,
        },
        shopInfo: {
          shopName: updatedUser.shopName,
          shopAddress: updatedUser.shopAddress,
          businessType: updatedUser.businessType,
          shopImage: updatedUser.shopImage,
        },
      },
      token: newToken
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}