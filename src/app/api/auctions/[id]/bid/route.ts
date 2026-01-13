import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '../../../../../lib/auth';
import { prisma } from '../../../../../lib/prisma';

// POST /api/auctions/[id]/bid - Place a bid
export const POST = requireAuth(async (
  request: AuthenticatedRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const body = await request.json();
    const { amount } = body;
    const auctionId = params.id;
    const bidderId = request.user!.userId;

    // Validate bid amount
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'مبلغ المزايدة غير صحيح' },
        { status: 400 }
      );
    }

    // Get auction details
    const auction = await prisma.auction.findUnique({
      where: { id: auctionId },
      include: {
        seller: { select: { id: true } },
        bids: {
          orderBy: { amount: 'desc' },
          take: 1
        }
      }
    });

    if (!auction) {
      return NextResponse.json(
        { error: 'المزاد غير موجود' },
        { status: 404 }
      );
    }

    // Check if auction is active
    if (auction.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'المزاد غير نشط' },
        { status: 400 }
      );
    }

    // Check if auction has ended
    if (auction.endTime <= new Date()) {
      // Update auction status
      await prisma.auction.update({
        where: { id: auctionId },
        data: { status: 'ENDED' }
      });
      
      return NextResponse.json(
        { error: 'المزاد منتهي' },
        { status: 400 }
      );
    }

    // Check if bidder is not the seller
    if (auction.seller.id === bidderId) {
      return NextResponse.json(
        { error: 'لا يمكنك المزايدة على مزادك الخاص' },
        { status: 400 }
      );
    }

    // Check if bid is higher than current highest bid
    const currentHighestBid = auction.bids[0]?.amount || auction.startingPrice;
    
    if (amount <= currentHighestBid) {
      return NextResponse.json(
        { error: `يجب أن تكون المزايدة أعلى من ${currentHighestBid} دينار` },
        { status: 400 }
      );
    }

    // Create bid in transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Create the bid
      const bid = await tx.bid.create({
        data: {
          amount: parseFloat(amount.toString()),
          bidderId,
          auctionId
        },
        include: {
          bidder: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      // Update auction current price
      await tx.auction.update({
        where: { id: auctionId },
        data: {
          currentPrice: parseFloat(amount.toString())
        }
      });

      return bid;
    });

    // TODO: Send real-time notification via Socket.IO
    // TODO: Send WhatsApp notification to previous highest bidder

    return NextResponse.json({
      message: 'تم قبول المزايدة بنجاح',
      bid: result
    }, { status: 201 });

  } catch (error) {
    console.error('Bid creation error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في قبول المزايدة' },
      { status: 500 }
    );
  }
});