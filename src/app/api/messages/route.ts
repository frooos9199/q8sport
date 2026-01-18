import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { requireAuth, AuthenticatedRequest } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';

// GET /api/messages - Get user's messages
export const GET = requireAuth(async (request: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all'; // 'sent', 'received', 'all'
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const userId = request.user!.userId;
    const where: Prisma.MessageWhereInput =
      type === 'sent'
        ? { senderId: userId }
        : type === 'received'
          ? { receiverId: userId }
          : {
            OR: [{ senderId: userId }, { receiverId: userId }]
          };

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          sender: {
            select: { id: true, name: true, avatar: true }
          },
          receiver: {
            select: { id: true, name: true, avatar: true }
          },
          auction: {
            select: { id: true, title: true, status: true }
          }
        }
      }),
      prisma.message.count({ where })
    ]);

    return NextResponse.json({
      messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Messages fetch error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب الرسائل' },
      { status: 500 }
    );
  }
});

// POST /api/messages - Send a message
export const POST = requireAuth(async (request: AuthenticatedRequest) => {
  try {
    const body = await request.json();
    const { receiverId, auctionId, content, type = 'TEXT' } = body;

    if (!receiverId || !content) {
      return NextResponse.json(
        { error: 'المستقبل ومحتوى الرسالة مطلوبان' },
        { status: 400 }
      );
    }

    // Verify receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      select: { id: true, name: true, status: true }
    });

    if (!receiver) {
      return NextResponse.json(
        { error: 'المستقبل غير موجود' },
        { status: 404 }
      );
    }

    if (receiver.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'المستقبل غير نشط' },
        { status: 400 }
      );
    }

    // Verify auction exists if provided
    if (auctionId) {
      const auction = await prisma.auction.findUnique({
        where: { id: auctionId },
        select: { id: true, status: true }
      });

      if (!auction) {
        return NextResponse.json(
          { error: 'المزاد غير موجود' },
          { status: 404 }
        );
      }
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        content,
        type,
        senderId: request.user!.userId,
        receiverId,
        auctionId: auctionId || undefined
      },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true }
        },
        receiver: {
          select: { id: true, name: true, avatar: true }
        },
        auction: {
          select: { id: true, title: true }
        }
      }
    });

    // TODO: Send real-time notification via Socket.IO
    // TODO: Send WhatsApp/Email notification if user preferences allow

    return NextResponse.json({
      message: 'تم إرسال الرسالة بنجاح',
      data: message
    }, { status: 201 });

  } catch (error) {
    console.error('Message send error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في إرسال الرسالة' },
      { status: 500 }
    );
  }
});