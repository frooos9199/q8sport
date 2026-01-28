import { NextRequest, NextResponse } from 'next/server';
import { Prisma, UserRole, UserStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';


function parseIntSafe(value: string | null, defaultValue: number) {
  if (!value) return defaultValue;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : defaultValue;
}

function parseRolesParam(roleParam: string | null): UserRole[] | undefined {
  if (!roleParam) return undefined;
  const parts = roleParam
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);

  const roles = parts
    .map((p) => p.toUpperCase())
    .filter((p) => Object.prototype.hasOwnProperty.call(UserRole, p)) as UserRole[];

  return roles.length ? roles : undefined;
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);

    const page = parseIntSafe(url.searchParams.get('page'), 1);
    const limit = Math.min(parseIntSafe(url.searchParams.get('limit'), 20), 100);
    const q = (url.searchParams.get('q') || '').trim();

    const roles = parseRolesParam(url.searchParams.get('role'));
    const statusParam = (url.searchParams.get('status') || 'ACTIVE').toUpperCase();
    const status = (Object.prototype.hasOwnProperty.call(UserStatus, statusParam)
      ? (statusParam as UserStatus)
      : UserStatus.ACTIVE);

    const where: Prisma.UserWhereInput = {
      status,
    };

    if (roles?.length) {
      where.role = { in: roles };
    } else {
      // Default to public marketplace actors
      where.role = { in: [UserRole.SELLER, UserRole.SHOP_OWNER] };
    }

    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { shopName: { contains: q, mode: 'insensitive' } },
        { businessType: { contains: q, mode: 'insensitive' } },
        { shopAddress: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: [{ verified: 'desc' }, { rating: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          avatar: true,
          shopImage: true,
          role: true,
          status: true,
          rating: true,
          verified: true,
          createdAt: true,
          lastLoginAt: true,
          shopName: true,
          shopAddress: true,
          businessType: true,
          _count: {
            select: {
              products: true,
              auctions: true,
              requests: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        avatar: u.avatar,
        shopImage: u.shopImage,
        role: u.role,
        status: u.status,
        rating: u.rating || 0,
        verified: u.verified,
        createdAt: u.createdAt,
        lastLoginAt: u.lastLoginAt,
        shopName: u.shopName,
        shopAddress: u.shopAddress,
        businessType: u.businessType,
        counts: u._count,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    console.error('Error listing users:', error);
    return NextResponse.json({ success: false, error: 'خطأ في جلب قائمة المستخدمين' }, { status: 500 });
  }
}
