import { NextResponse } from 'next/server';
import { requireAdmin, AuthenticatedRequest } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfWeek(d: Date) {
  const x = startOfDay(d);
  // week starts Saturday in some locales, but for simplicity use Monday
  const day = x.getDay(); // 0 Sun .. 6 Sat
  const diff = (day + 6) % 7; // Monday=0
  x.setDate(x.getDate() - diff);
  return x;
}

function startOfMonth(d: Date) {
  const x = startOfDay(d);
  x.setDate(1);
  return x;
}

export const GET = requireAdmin(async (_request: AuthenticatedRequest) => {
  try {
    const now = new Date();
    const dayStart = startOfDay(now);
    const weekStart = startOfWeek(now);
    const monthStart = startOfMonth(now);

    const [
      dailyUsers,
      weeklyUsers,
      monthlyUsers,
      dailyProducts,
      weeklyProducts,
      monthlyProducts,
      soldToday,
      soldWeek,
      soldMonth,
      topViewedProducts,
      soldProductsMonth,
    ] = await Promise.all([
      prisma.user.count({ where: { createdAt: { gte: dayStart } } }),
      prisma.user.count({ where: { createdAt: { gte: weekStart } } }),
      prisma.user.count({ where: { createdAt: { gte: monthStart } } }),

      prisma.product.count({ where: { createdAt: { gte: dayStart }, status: { not: 'DELETED' } } }),
      prisma.product.count({ where: { createdAt: { gte: weekStart }, status: { not: 'DELETED' } } }),
      prisma.product.count({ where: { createdAt: { gte: monthStart }, status: { not: 'DELETED' } } }),

      prisma.product.aggregate({
        where: { status: 'SOLD', soldDate: { gte: dayStart } },
        _count: { id: true },
        _sum: { soldPrice: true },
      }),
      prisma.product.aggregate({
        where: { status: 'SOLD', soldDate: { gte: weekStart } },
        _count: { id: true },
        _sum: { soldPrice: true },
      }),
      prisma.product.aggregate({
        where: { status: 'SOLD', soldDate: { gte: monthStart } },
        _count: { id: true },
        _sum: { soldPrice: true },
      }),

      prisma.product.findMany({
        where: { status: { not: 'DELETED' } },
        orderBy: { views: 'desc' },
        take: 5,
        select: { id: true, title: true, views: true, price: true },
      }),

      prisma.product.findMany({
        where: { status: 'SOLD', soldDate: { gte: monthStart } },
        select: { soldPrice: true, userId: true, user: { select: { name: true } } },
      }),
    ]);

    const sellerAgg = new Map<string, { name: string; sales: number; revenue: number }>();
    for (const p of soldProductsMonth) {
      const key = p.userId;
      const prev = sellerAgg.get(key) || { name: p.user?.name || '—', sales: 0, revenue: 0 };
      sellerAgg.set(key, {
        name: prev.name,
        sales: prev.sales + 1,
        revenue: prev.revenue + (p.soldPrice || 0),
      });
    }

    const topSellers = Array.from(sellerAgg.values())
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5)
      .map((s) => ({
        name: s.name,
        sales: s.sales,
        revenue: Number(s.revenue.toFixed(2)),
      }));

    return NextResponse.json({
      dailyStats: {
        users: dailyUsers,
        products: dailyProducts,
        sales: soldToday._count.id || 0,
      },
      weeklyStats: {
        users: weeklyUsers,
        products: weeklyProducts,
        sales: soldWeek._count.id || 0,
      },
      monthlyStats: {
        users: monthlyUsers,
        products: monthlyProducts,
        sales: soldMonth._count.id || 0,
      },
      topSellers,
      topProducts: topViewedProducts,
      recentActivity: [],
    });
  } catch (error) {
    console.error('Admin reports error:', error);
    return NextResponse.json({ error: 'حدث خطأ في إنشاء التقارير' }, { status: 500 });
  }
});
