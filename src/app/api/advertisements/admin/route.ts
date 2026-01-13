import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
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
    const formattedAds = advertisements.map((ad: any) => ({
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
}