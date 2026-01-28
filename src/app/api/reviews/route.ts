import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await verifyToken(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, rating, comment, reviewedUserId, type } = await req.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        userId: user.userId,
        productId: type === 'PRODUCT' ? productId : null,
        reviewedUserId: type === 'SELLER' ? reviewedUserId : null,
        rating,
        comment,
        type: type || 'PRODUCT'
      },
      include: {
        user: { select: { name: true, avatar: true } }
      }
    });

    // تحديث متوسط التقييم للبائع
    if (type === 'SELLER' && reviewedUserId) {
      const avgRating = await prisma.review.aggregate({
        where: { reviewedUserId, type: 'SELLER' },
        _avg: { rating: true }
      });
      
      await prisma.user.update({
        where: { id: reviewedUserId },
        data: { rating: avgRating._avg.rating || 0 }
      });
    }

    return NextResponse.json({ review });
  } catch (error) {
    console.error('Review error:', error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const userId = searchParams.get('userId');
    const type = searchParams.get('type') || 'PRODUCT';

    const reviews = await prisma.review.findMany({
      where: {
        ...(productId ? { productId } : {}),
        ...(userId ? { reviewedUserId: userId } : {}),
        type: type as any
      },
      include: {
        user: { select: { name: true, avatar: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Get reviews error:', error);
    return NextResponse.json({ error: 'Failed to get reviews' }, { status: 500 });
  }
}
