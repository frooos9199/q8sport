import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
        status: 'ACTIVE'
      },
      include: {
        user: {
          select: {
            name: true,
            phone: true
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json({ error: 'المنتج غير موجود' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'خطأ في جلب المنتج' }, { status: 500 })
  }
}