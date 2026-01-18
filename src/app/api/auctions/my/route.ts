import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET /api/auctions/my - جلب مزاداتي (للبائع)
export async function GET(req: NextRequest) {
  try {
    const user = await verifyToken(req);
    if (!user) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول أولاً' }, { status: 401 });
    }

    const auctions = await prisma.auction.findMany({
      where: { sellerId: user.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { bids: true } },
      },
    });

    // Keep shape similar to /api/auctions
    const now = Date.now();
    const result = auctions.map((a: any) => ({
      ...a,
      isExpired: a.endTime?.getTime ? a.endTime.getTime() <= now : false,
      totalBids: a._count?.bids ?? 0,
    }));

    return NextResponse.json({ success: true, auctions: result, count: result.length });
  } catch (error) {
    console.error('Error fetching my auctions:', error);
    return NextResponse.json({ success: false, error: 'فشل جلب مزاداتك' }, { status: 500 });
  }
}
