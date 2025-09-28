import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';

// GET /api/auctions - Get all auctions with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const carModel = searchParams.get('carModel');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (category) {
      where.category = category;
    }
    
    if (carModel) {
      where.carModel = carModel;
    }

    // Get auctions with related data
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
              rating: true
            }
          },
          bids: {
            orderBy: { amount: 'desc' },
            take: 1,
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
      }),
      prisma.auction.count({ where })
    ]);

    // Add current highest bid to each auction
    const auctionsWithBids = auctions.map((auction: any) => ({
      ...auction,
      currentBid: auction.bids[0]?.amount || auction.startingPrice,
      highestBidder: auction.bids[0]?.bidder || null,
      totalBids: auction._count.bids
    }));

    return NextResponse.json({
      auctions: auctionsWithBids,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Auctions fetch error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب المزادات' },
      { status: 500 }
    );
  }
}

// POST /api/auctions - Create new auction (authenticated)
export const POST = requireAuth(async (request: AuthenticatedRequest) => {
  try {
    const body = await request.json();
    const {
      title,
      description,
      category,
      carModel,
      carYear,
      partNumber,
      condition,
      startingPrice,
      reservePrice,
      duration,
      images
    } = body;

    // Validate required fields
    if (!title || !description || !category || !carModel || !startingPrice || !duration) {
      return NextResponse.json(
        { error: 'جميع الحقول المطلوبة يجب ملؤها' },
        { status: 400 }
      );
    }

    // Calculate end time
    const endTime = new Date(Date.now() + duration * 60 * 60 * 1000);

    // Create auction
    const auction = await prisma.auction.create({
      data: {
        title,
        description,
        category,
        carModel,
        carYear: carYear ? parseInt(carYear) : null,
        partNumber,
        condition,
        startingPrice: parseFloat(startingPrice),
        reservePrice: reservePrice ? parseFloat(reservePrice) : null,
        currentPrice: parseFloat(startingPrice),
        endTime,
        images: images || [],
        sellerId: request.user!.userId,
        status: 'ACTIVE'
      },
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
      message: 'تم إنشاء المزاد بنجاح',
      auction
    }, { status: 201 });

  } catch (error) {
    console.error('Auction creation error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في إنشاء المزاد' },
      { status: 500 }
    );
  }
});