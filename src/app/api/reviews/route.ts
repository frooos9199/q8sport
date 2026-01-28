import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    const { rating, comment, productId, reviewedUserId, type = 'PRODUCT' } = await req.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, error: 'التقييم يجب أن يكون بين 1 و 5' }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        type,
        userId: decoded.userId,
        productId: type === 'PRODUCT' ? productId : null,
        reviewedUserId: type === 'SELLER' ? reviewedUserId : null,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    if (type === 'SELLER' && reviewedUserId) {
      const avgRating = await prisma.review.aggregate({
        where: { reviewedUserId, type: 'SELLER' },
        _avg: { rating: true },
      });
      
      await prisma.user.update({
        where: { id: reviewedUserId },
        data: { rating: avgRating._avg.rating || 0 },
      });
    }

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ success: false, error: 'خطأ في إضافة التقييم' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const productId = url.searchParams.get('productId');
    const userId = url.searchParams.get('userId');
    const type = url.searchParams.get('type') || 'PRODUCT';

    const where: any = { type };
    if (productId) where.productId = productId;
    if (userId) where.reviewedUserId = userId;

    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const avgRating = await prisma.review.aggregate({
      where,
      _avg: { rating: true },
      _count: true,
    });

    return NextResponse.json({
      success: true,
      reviews,
      stats: {
        average: avgRating._avg.rating || 0,
        total: avgRating._count,
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ success: false, error: 'خطأ في جلب التقييمات' }, { status: 500 });
  }
}
