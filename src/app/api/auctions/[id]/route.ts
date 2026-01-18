import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

// GET /api/auctions/[id] - Get specific auction
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const auction = await prisma.auction.findUnique({
      where: { id: params.id },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            rating: true,
            phone: true,
            whatsapp: true
          }
        },
        bids: {
          orderBy: { createdAt: 'desc' },
          include: {
            bidder: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        _count: {
          select: { bids: true }
        }
      }
    });

    if (!auction) {
      return NextResponse.json(
        { error: 'المزاد غير موجود' },
        { status: 404 }
      );
    }

    // Calculate time remaining
    const timeRemaining = auction.endTime.getTime() - Date.now();
    const isExpired = timeRemaining <= 0;

    // Update status if expired
    if (isExpired && auction.status === 'ACTIVE') {
      await prisma.auction.update({
        where: { id: params.id },
        data: { status: 'ENDED' }
      });
      auction.status = 'ENDED';
    }

    const result = {
      ...auction,
      timeRemaining: Math.max(0, timeRemaining),
      isExpired,
      currentBid: auction.bids[0]?.amount || auction.startingPrice,
      highestBidder: auction.bids[0]?.bidder || null,
      totalBids: auction._count.bids
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Auction fetch error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب المزاد' },
      { status: 500 }
    );
  }
}

// PUT /api/auctions/[id] - Update auction (seller only)
export const PUT = requireAuth(async (
  request: AuthenticatedRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const body = await request.json();
    
    // Check if auction exists and user is seller or admin
    const auction = await prisma.auction.findUnique({
      where: { id: params.id },
      select: { sellerId: true, status: true }
    });

    if (!auction) {
      return NextResponse.json(
        { error: 'المزاد غير موجود' },
        { status: 404 }
      );
    }

    if (auction.sellerId !== request.user!.userId && request.user!.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'غير مسموح بتعديل هذا المزاد' },
        { status: 403 }
      );
    }

    if (auction.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'لا يمكن تعديل المزاد المنتهي' },
        { status: 400 }
      );
    }

    // Update auction
    const updatedAuction = await prisma.auction.update({
      where: { id: params.id },
      data: body,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            rating: true
          }
        }
      }
    });

    return NextResponse.json({
      message: 'تم تحديث المزاد بنجاح',
      auction: updatedAuction
    });

  } catch (error) {
    console.error('Auction update error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في تحديث المزاد' },
      { status: 500 }
    );
  }
});

// DELETE /api/auctions/[id] - Delete auction (seller/admin only)
export const DELETE = requireAuth(async (
  request: AuthenticatedRequest,
  { params }: { params: { id: string } }
) => {
  try {
    // Check if auction exists and user is seller or admin
    const auction = await prisma.auction.findUnique({
      where: { id: params.id },
      select: { sellerId: true, status: true, _count: { select: { bids: true } } }
    });

    if (!auction) {
      return NextResponse.json(
        { error: 'المزاد غير موجود' },
        { status: 404 }
      );
    }

    if (auction.sellerId !== request.user!.userId && request.user!.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'غير مسموح بحذف هذا المزاد' },
        { status: 403 }
      );
    }

    if (auction._count.bids > 0) {
      return NextResponse.json(
        { error: 'لا يمكن حذف مزاد يحتوي على مزايدات' },
        { status: 400 }
      );
    }

    // Delete auction
    await prisma.auction.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      message: 'تم حذف المزاد بنجاح'
    });

  } catch (error) {
    console.error('Auction delete error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في حذف المزاد' },
      { status: 500 }
    );
  }
});