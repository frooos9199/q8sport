import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const advertisements = await prisma.advertisement.findMany({
      where: {
        active: true
      },
      select: {
        id: true,
        title: true,
        description: true,
        link: true,
        imageUrl: true,
        active: true,
        clickCount: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(advertisements);
  } catch (error) {
    console.error('Error fetching advertisements:', error);
    return NextResponse.json({ error: 'Failed to fetch advertisements' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, imageUrl, link, active = true } = body;

    // Validate required fields
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    const advertisement = await prisma.advertisement.create({
      data: {
        title,
        description,
        imageUrl: imageUrl || null,
        link: link || null,
        active
      }
    });

    return NextResponse.json(advertisement);
  } catch (error) {
    console.error('Error creating advertisement:', error);
    return NextResponse.json(
      { error: 'Failed to create advertisement' },
      { status: 500 }
    );
  }
}