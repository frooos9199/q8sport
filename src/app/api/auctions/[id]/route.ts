import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '../../../../lib/auth';
import { verifyToken } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

// GET /api/auctions/[id] - Get specific auction
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const auctionId = params.id;

    const auction = await prisma.auction.findUnique({
      where: { id: auctionId },
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

    // Hide stopped/draft auctions from public views
    const viewer = await verifyToken(request);
    const viewerId = viewer?.userId;
    const isAdmin = viewer?.role === 'ADMIN';
    const isSeller = !!viewerId && viewerId === auction.sellerId;

    if ((auction.status === 'CANCELLED' || auction.status === 'DRAFT') && !isAdmin && !isSeller) {
      return NextResponse.json(
        { error: 'المزاد غير موجود' },
        { status: 404 }
      );
    }

    // Calculate time remaining
    const timeRemaining = auction.endTime.getTime() - Date.now();
    const isExpired = timeRemaining <= 0;

    // Load bids for display (latest)
    const bids = await prisma.bid.findMany({
      where: { auctionId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        bidder: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Highest bid (by amount)
    const highestBid = await prisma.bid.findFirst({
      where: { auctionId },
      orderBy: { amount: 'desc' },
      include: {
        bidder: {
          select: {
            id: true,
            name: true,
            phone: true,
            whatsapp: true
          }
        }
      }
    });

    // viewer already loaded above
    const canSeeHighestBidderContact =
      !!viewerId &&
      (viewerId === auction.sellerId || viewerId === highestBid?.bidderId || viewer?.role === 'ADMIN');

    const highestBidder = highestBid?.bidder
      ? {
          id: highestBid.bidder.id,
          name: highestBid.bidder.name,
          ...(canSeeHighestBidderContact
            ? { phone: highestBid.bidder.phone, whatsapp: highestBid.bidder.whatsapp }
            : {})
        }
      : null;

    // Update status if expired
    if (isExpired && auction.status === 'ACTIVE') {
      await prisma.auction.update({
        where: { id: auctionId },
        data: {
          status: 'ENDED',
          winningBidId: highestBid?.id || null
        }
      });
      auction.status = 'ENDED';
    }

    const result = {
      ...auction,
      timeRemaining: Math.max(0, timeRemaining),
      isExpired,
      bids,
      currentBid: highestBid?.amount || auction.startingPrice,
      highestBidder,
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
  context: { params: Promise<{ id: string }> | { id: string } }
) => {
  try {
    const params = await Promise.resolve(context?.params);
    const auctionId = params?.id;
    if (!auctionId) {
      return NextResponse.json(
        { error: 'معرف المزاد غير صحيح' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Whitelist allowed fields to avoid accidental privilege escalation
    const allowedFields = new Set([
      'title',
      'description',
      'category',
      'carModel',
      'carYear',
      'partNumber',
      'condition',
      'startingPrice',
      'reservePrice',
      'currentPrice',
      'buyNowPrice',
      'endTime',
      'status',
      'images',
      'featured',
      'carModelId'
    ]);

    const updateData: Record<string, any> = {};
    for (const key of Object.keys(body || {})) {
      if (allowedFields.has(key)) updateData[key] = (body as any)[key];
    }

    // Normalize endTime (if provided)
    if (Object.prototype.hasOwnProperty.call(updateData, 'endTime')) {
      const raw = updateData.endTime;
      if (raw) {
        const d = new Date(raw);
        if (Number.isNaN(d.getTime())) {
          return NextResponse.json(
            { error: 'وقت انتهاء المزاد غير صحيح' },
            { status: 400 }
          );
        }
        updateData.endTime = d;
      }
    }

    // Normalize numeric fields
    for (const numericKey of ['startingPrice', 'reservePrice', 'currentPrice'] as const) {
      if (Object.prototype.hasOwnProperty.call(updateData, numericKey)) {
        const raw = updateData[numericKey];
        if (raw === null || raw === undefined || String(raw).trim() === '') {
          updateData[numericKey] = null;
        } else {
          const n = typeof raw === 'number' ? raw : Number(String(raw).trim());
          if (!Number.isFinite(n) || n < 0) {
            return NextResponse.json(
              { error: 'قيمة رقمية غير صحيحة' },
              { status: 400 }
            );
          }
          updateData[numericKey] = n;
        }
      }
    }

    // Normalize buyNowPrice updates (allow null/empty to clear)
    if (Object.prototype.hasOwnProperty.call(body, 'buyNowPrice')) {
      const raw = body.buyNowPrice;
      if (raw === null || raw === undefined || String(raw).trim() === '') {
        updateData.buyNowPrice = null;
      } else {
        const n = typeof raw === 'number' ? raw : Number(String(raw).trim());
        if (!Number.isFinite(n) || n <= 0) {
          return NextResponse.json(
            { error: 'سعر اشتر الآن غير صحيح' },
            { status: 400 }
          );
        }
        updateData.buyNowPrice = n;
      }
    }
    
    // Check if auction exists and user is seller or admin
    const auction = await prisma.auction.findUnique({
      where: { id: auctionId },
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

    // Only admin can edit ended/cancelled auctions
    if (auction.status !== 'ACTIVE' && request.user!.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'لا يمكن تعديل المزاد المنتهي' },
        { status: 400 }
      );
    }

    // Update auction
    const updatedAuction = await prisma.auction.update({
      where: { id: auctionId },
      data: updateData,
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
  context: { params: Promise<{ id: string }> | { id: string } }
) => {
  try {
    const params = await Promise.resolve(context?.params);
    const auctionId = params?.id;
    if (!auctionId) {
      return NextResponse.json(
        { error: 'معرف المزاد غير صحيح' },
        { status: 400 }
      );
    }

    // Check if auction exists and user is seller or admin
    const auction = await prisma.auction.findUnique({
      where: { id: auctionId },
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

    if (auction._count.bids > 0 && request.user!.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'لا يمكن حذف مزاد يحتوي على مزايدات' },
        { status: 400 }
      );
    }

    // Admin can force-delete auctions with bids/messages
    if (request.user!.role === 'ADMIN') {
      await prisma.$transaction(async (tx) => {
        // Clear winning bid reference first to avoid FK/unique issues
        await tx.auction.update({
          where: { id: auctionId },
          data: { winningBidId: null }
        });

        await tx.message.deleteMany({ where: { auctionId } });
        await tx.bid.deleteMany({ where: { auctionId } });
        await tx.auction.delete({ where: { id: auctionId } });
      });
    } else {
      await prisma.auction.delete({
        where: { id: auctionId }
      });
    }

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