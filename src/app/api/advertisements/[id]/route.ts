import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, AuthenticatedRequest } from '@/lib/auth';

// PATCH /api/advertisements/[id] - Update ad (admin)
export const PATCH = requireAdmin(async (
  request: AuthenticatedRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) => {
  try {
    const params = await Promise.resolve(context?.params);
    const id = params?.id;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Advertisement ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { title, description, imageUrl, link, active } = body || {};

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl || null;
    if (link !== undefined) updateData.link = link || null;
    if (active !== undefined) updateData.active = Boolean(active);

    const updatedAd = await prisma.advertisement.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        link: true,
        active: true,
        clickCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, advertisement: updatedAd });
  } catch (error) {
    console.error('Error updating advertisement:', error);
    return NextResponse.json({ success: false, error: 'Failed to update advertisement' }, { status: 500 });
  }
});

// DELETE /api/advertisements/[id] - Delete ad (admin)
export const DELETE = requireAdmin(async (
  request: AuthenticatedRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) => {
  try {
    const params = await Promise.resolve(context?.params);
    const id = params?.id;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Advertisement ID is required' }, { status: 400 });
    }

    await prisma.advertisement.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'تم حذف الإعلان بنجاح', id });
  } catch (error) {
    console.error('Error deleting advertisement:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete advertisement' }, { status: 500 });
  }
});
