import { NextResponse } from 'next/server';
import { requireAdmin, AuthenticatedRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/auctions - Admin list all auctions (includes CANCELLED/DRAFT)
export const GET = requireAdmin(async (request: AuthenticatedRequest) => {
  try {
    // Keep statuses reasonably up to date without requiring a background job
    await prisma.auction.updateMany({
      where: {
        status: 'ACTIVE',
        endTime: { lt: new Date() },
      },
      data: { status: 'ENDED' },
    });

    const { searchParams } = new URL(request.url);
    const statusParam = (searchParams.get('status') || '').trim().toUpperCase();
    const category = searchParams.get('category');
    const carModel = searchParams.get('carModel');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') || '50', 10) || 50));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (statusParam && statusParam !== 'ALL') {
      where.status = statusParam;
    }

    if (category) {
      where.category = category;
    }

    if (carModel) {
      where.carModel = carModel;
    }

    const [auctions, total] = await Promise.all([
      prisma.auction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              rating: true,
              phone: true,
              whatsapp: true,
            },
          },
          bids: {
            orderBy: { amount: 'desc' },
            take: 1,
            include: {
              bidder: {
                select: {
                  id: true,
                  name: true,
                  phone: true,
                  whatsapp: true,
                },
              },
            },
          },
          _count: {
            select: { bids: true },
          },
        },
      }),
      prisma.auction.count({ where }),
    ]);

    const auctionsWithBids = auctions.map((auction: any) => {
      const highestBidderRaw = auction.bids[0]?.bidder || null;
      return {
        ...auction,
        currentBid: auction.bids[0]?.amount || auction.startingPrice,
        highestBidder: highestBidderRaw,
        totalBids: auction._count.bids,
      };
    });

    return NextResponse.json(
      {
        auctions: auctionsWithBids,
        pagination: {
          page,
          limit,
          total,
          pages: Math.max(1, Math.ceil(total / limit)),
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (error) {
    console.error('Admin auctions fetch error:', error);
    return NextResponse.json({ error: 'حدث خطأ في جلب المزادات' }, { status: 500 });
  }
});
