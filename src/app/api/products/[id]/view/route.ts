import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params

    // زيادة عدد المشاهدات
    await prisma.product.update({
      where: { id: productId },
      data: {
        views: {
          increment: 1
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating views:', error)
    return NextResponse.json({ error: 'خطأ في تسجيل المشاهدة' }, { status: 500 })
  }
}