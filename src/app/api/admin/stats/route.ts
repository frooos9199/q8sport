import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { requireAdmin, AuthenticatedRequest } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

type RecentAuction = Prisma.AuctionGetPayload<{
  include: {
    seller: { select: { name: true } };
    _count: { select: { bids: true } };
  };
}>;

type TopBidder = Prisma.UserGetPayload<{
  include: {
    _count: { select: { bids: true } };
  };
}>;

// GET /api/admin/stats - Get admin dashboard statistics
export const GET = requireAdmin(async (request: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days
    const startDate = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);

    // Get all statistics in parallel
    const [
      totalUsers,
      activeUsers,
      recentlyActiveUsers,
      suspendedUsers,
      bannedUsers,
      shopOwners,
      totalProducts,
      activeProducts,
      pendingProducts,
      soldProducts,
      totalAuctions,
      activeAuctions,
      completedAuctions,
      totalBids,
      totalRevenue,
      recentAuctions,
      topBidders,
      recentUsers
    ] = await Promise.all([
      // Total users
      prisma.user.count(),
      
      // Active users (account status)
      prisma.user.count({
        where: {
          status: 'ACTIVE'
        }
      }),

      // Recently active users (logged in during period)
      prisma.user.count({
        where: {
          status: 'ACTIVE',
          lastLoginAt: {
            gte: startDate
          }
        }
      }),

      // Suspended users
      prisma.user.count({
        where: {
          status: 'SUSPENDED'
        }
      }),

      // Banned users
      prisma.user.count({
        where: {
          status: 'BANNED'
        }
      }),

      // Shop owners
      prisma.user.count({
        where: {
          role: 'SHOP_OWNER'
        }
      }),

      // Total products (excluding deleted)
      prisma.product.count({
        where: {
          status: { not: 'DELETED' }
        }
      }),

      // Active products
      prisma.product.count({
        where: {
          status: 'ACTIVE'
        }
      }),

      // Pending products (this project uses INACTIVE as a moderation/pending state)
      prisma.product.count({
        where: {
          status: 'INACTIVE'
        }
      }),

      // Sold products
      prisma.product.count({
        where: {
          status: 'SOLD'
        }
      }),
      
      // Total auctions
      prisma.auction.count(),
      
      // Active auctions
      prisma.auction.count({
        where: {
          status: 'ACTIVE',
          endTime: {
            gt: new Date()
          }
        }
      }),
      
      // Completed auctions
      prisma.auction.count({
        where: {
          status: 'ENDED'
        }
      }),
      
      // Total bids
      prisma.bid.count(),
      
      // Total revenue (sum of winning bids)
      prisma.auction.aggregate({
        where: {
          status: 'ENDED',
          currentPrice: {
            gt: 0
          }
        },
        _sum: {
          currentPrice: true
        }
      }),
      
      // Recent auctions
      prisma.auction.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          seller: {
            select: { name: true }
          },
          _count: {
            select: { bids: true }
          }
        }
      }),
      
      // Top bidders
      prisma.user.findMany({
        take: 5,
        orderBy: {
          bids: {
            _count: 'desc'
          }
        },
        include: {
          _count: {
            select: { bids: true }
          }
        }
      }),
      
      // Recent users
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          status: true
        }
      })
    ]);

    // Calculate growth percentages (simplified)
    const previousPeriodStart = new Date(Date.now() - parseInt(period) * 2 * 24 * 60 * 60 * 1000);
    const previousUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: previousPeriodStart,
          lt: startDate
        }
      }
    });

    const currentUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: startDate
        }
      }
    });

    const userGrowth = previousUsers > 0 
      ? ((currentUsers - previousUsers) / previousUsers * 100).toFixed(1)
      : '0';

    return NextResponse.json({
      overview: {
        totalUsers,
        activeUsers,
        recentlyActiveUsers,
        suspendedUsers,
        bannedUsers,
        disabledUsers: suspendedUsers + bannedUsers,
        shopOwners,
        newUsers: currentUsers,
        totalProducts,
        activeProducts,
        pendingProducts,
        soldProducts,
        totalAuctions,
        activeAuctions,
        completedAuctions,
        totalBids,
        totalRevenue: totalRevenue._sum.currentPrice || 0,
        userGrowth: `${userGrowth}%`
      },
      recentAuctions: recentAuctions.map((auction: RecentAuction) => ({
        id: auction.id,
        title: auction.title,
        seller: auction.seller?.name ?? '',
        currentPrice: auction.currentPrice,
        totalBids: auction._count.bids,
        status: auction.status,
        endTime: auction.endTime
      })),
      topBidders: topBidders.map((user: TopBidder) => ({
        id: user.id,
        name: user.name,
        totalBids: user._count.bids,
        rating: user.rating
      })),
      recentUsers
    });

  } catch (error) {
    console.error('Stats fetch error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب الإحصائيات' },
      { status: 500 }
    );
  }
});