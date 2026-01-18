import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin, AuthenticatedRequest } from '@/lib/auth';

export const GET = requireAdmin(async (request: AuthenticatedRequest) => {
  try {
    const advertisements = await prisma.advertisement.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        link: true,
        imageUrl: true,
        active: true,
        clickCount: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // تحويل البيانات للشكل المطلوب
    const formattedAds = advertisements.map((ad: Prisma.AdvertisementGetPayload<{ select: {
      id: true;
      title: true;
      description: true;
      link: true;
      imageUrl: true;
      active: true;
      clickCount: true;
      createdAt: true;
      updatedAt: true;
    } }>) => ({
      id: ad.id,
      title: ad.title,
      description: ad.description,
      imageUrl: ad.imageUrl || '',
      link: ad.link || '',
      isActive: ad.active,
      position: 'header', // قيمة افتراضية لأنها غير مخزنة في قاعدة البيانات
      createdAt: ad.createdAt.toISOString().split('T')[0],
      updatedAt: ad.updatedAt.toISOString().split('T')[0]
    }));

    return NextResponse.json(formattedAds);
  } catch (error) {
    console.error('Error fetching advertisements for admin:', error);
    return NextResponse.json({ error: 'Failed to fetch advertisements' }, { status: 500 });
  }
});