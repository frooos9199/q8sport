import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { requireAdmin, AuthenticatedRequest } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

// GET /api/admin/products - Admin products list (supports status filter)
export const GET = requireAdmin(async (request: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};

    if (statusParam && statusParam !== 'ALL') {
      if (statusParam === 'PENDING') {
        // This project doesn't have a PENDING status in Prisma. We treat INACTIVE as pending/moderation.
        where.status = 'INACTIVE';
      } else {
        where.status = statusParam as any;
      }
    } else {
      // Default: hide deleted
      where.status = { not: 'DELETED' };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          productType: true,
          condition: true,
          category: true,
          carBrand: true,
          carModel: true,
          carYear: true,
          kilometers: true,
          color: true,
          images: true,
          status: true,
          views: true,
          createdAt: true,
          soldPrice: true,
          soldDate: true,
          user: {
            select: {
              id: true,
              name: true,
              shopName: true,
              shopAddress: true,
              role: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    const mapped = products.map((p) => {
      const status = p.status === 'INACTIVE' ? 'PENDING' : p.status;
      const { user, ...rest } = p;
      return {
        ...rest,
        status,
        seller: user,
      };
    });

    return NextResponse.json({
      products: mapped,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admin products list error:', error);
    return NextResponse.json({ error: 'حدث خطأ في جلب المنتجات' }, { status: 500 });
  }
});
