import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: showcaseId } = await params;

    // زيادة عداد المشاهدات عند المشاركة
    await prisma.showcase.update({
      where: { id: showcaseId },
      data: { views: { increment: 1 } }
    });

    // إرجاع رابط المشاركة
    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/showcases/${showcaseId}`;
    
    return NextResponse.json({ 
      success: true, 
      shareUrl,
      message: 'تم نسخ الرابط'
    });
  } catch (error) {
    console.error('Error sharing showcase:', error);
    return NextResponse.json({ error: 'خطأ في المشاركة' }, { status: 500 });
  }
}
