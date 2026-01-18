import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

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
    const updateData: Prisma.AdvertisementUpdateInput = {};
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