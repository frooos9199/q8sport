import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const now = new Date();
    
    const advertisements = await prisma.advertisement.findMany({
      where: {
        active: true
      },
      orderBy: {
        id: 'desc'
      }
    });
    
    return NextResponse.json(advertisements);
  } catch (error) {
    console.error('Error fetching active advertisements:', error);
    return NextResponse.json({ error: 'فشل في جلب الإعلانات' }, { status: 500 });
  }
}