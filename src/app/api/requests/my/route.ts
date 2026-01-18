import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET /api/requests/my - جلب طلباتي
export async function GET(req: NextRequest) {
  try {
    const user = await verifyToken(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'يجب تسجيل الدخول أولاً' },
        { status: 401 }
      );
    }

    const requests = await prisma.request.findMany({
      where: {
        userId: user.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            whatsapp: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      requests,
      count: requests.length,
    });
  } catch (error) {
    console.error('Error fetching my requests:', error);
    return NextResponse.json(
      { success: false, error: 'فشل جلب طلباتك' },
      { status: 500 }
    );
  }
}
