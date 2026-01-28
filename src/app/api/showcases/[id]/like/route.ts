import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: showcaseId } = await params;
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 })
    }

    await prisma.showcaseLike.create({
      data: {
        userId: user.userId,
        showcaseId
      }
    })

    await prisma.showcase.update({
      where: { id: showcaseId },
      data: { likes: { increment: 1 } }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error liking showcase:', error)
    return NextResponse.json({ error: 'خطأ في الإعجاب' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: showcaseId } = await params;
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 })
    }

    await prisma.showcaseLike.deleteMany({
      where: {
        userId: user.userId,
        showcaseId
      }
    })

    await prisma.showcase.update({
      where: { id: showcaseId },
      data: { likes: { decrement: 1 } }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error unliking showcase:', error)
    return NextResponse.json({ error: 'خطأ في إلغاء الإعجاب' }, { status: 500 })
  }
}
