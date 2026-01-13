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

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, description, imageUrl, link, active } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Advertisement ID is required' },
        { status: 400 }
      );
    }

    // بناء البيانات المحدثة
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (link !== undefined) updateData.link = link;
    if (active !== undefined) updateData.active = active;

    const updatedAd = await prisma.advertisement.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedAd, { status: 200 });
  } catch (error) {
    console.error('Error updating advertisement:', error);
    return NextResponse.json(
      { error: 'Failed to update advertisement' },
      { status: 500 }
    );
  }
}