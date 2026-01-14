import { NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/user/favorites - جلب المفضلة
export const GET = requireAuth(async (request: AuthenticatedRequest) => {
  try {
    const user = request.user;
    
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح بالدخول' }, { status: 401 });
    }

    // جلب المفضلة من الـ database
    const favorites = await prisma.favorite.findMany({
      where: {
        userId: user.userId,
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            images: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // إرجاع المنتجات فقط
    const products = favorites.map(fav => fav.product);

    return NextResponse.json({ 
      favorites: products,
      count: products.length 
    });

  } catch (error) {
    console.error('Get favorites error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب المفضلة' },
      { status: 500 }
    );
  }
});

// POST /api/user/favorites - إضافة إلى المفضلة
export const POST = requireAuth(async (request: AuthenticatedRequest) => {
  try {
    const user = request.user;
    
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح بالدخول' }, { status: 401 });
    }

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: 'معرف المنتج مطلوب' }, { status: 400 });
    }

    // التحقق من وجود المنتج
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: 'المنتج غير موجود' }, { status: 404 });
    }

    // التحقق من عدم وجوده مسبقاً
    const existing = await prisma.favorite.findFirst({
      where: {
        userId: user.userId,
        productId: productId,
      },
    });

    if (existing) {
      return NextResponse.json({ 
        message: 'المنتج موجود بالفعل في المفضلة',
        favorite: existing 
      });
    }

    // إضافة إلى المفضلة
    const favorite = await prisma.favorite.create({
      data: {
        userId: user.userId,
        productId: productId,
      },
      include: {
        product: true,
      },
    });

    return NextResponse.json({ 
      success: true,
      message: 'تم إضافة المنتج إلى المفضلة',
      favorite 
    });

  } catch (error) {
    console.error('Add to favorites error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إضافة المنتج' },
      { status: 500 }
    );
  }
});
