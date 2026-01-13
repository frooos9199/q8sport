import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let decoded: any;
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    } catch (error) {
      return NextResponse.json({ error: 'رمز غير صالح' }, { status: 401 });
    }

    const { name, phone, whatsapp, email, password } = await request.json();

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json({ error: 'الاسم والبريد الإلكتروني مطلوبان' }, { status: 400 });
    }

    // Check if email is already taken by another user
    if (email !== decoded.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser && existingUser.id !== decoded.id) {
        return NextResponse.json({ error: 'البريد الإلكتروني مستخدم بالفعل' }, { status: 400 });
      }
    }

    // Prepare update data
    const updateData: any = {
      name,
      email,
      phone: phone || null,
      whatsapp: whatsapp || null,
    };

    // Hash password if provided
    if (password) {
      if (password.length < 6) {
        return NextResponse.json({ error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }, { status: 400 });
      }
      updateData.password = await bcryptjs.hash(password, 10);
    }

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: decoded.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        whatsapp: true,
        role: true,
        createdAt: true
      }
    });

    // Generate new token with updated info
    const newToken = jwt.sign(
      {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      success: true,
      user: updatedUser,
      token: newToken
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}