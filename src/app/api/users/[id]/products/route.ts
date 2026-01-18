import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// GET - جلب منتجات مستخدم محدد
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: userId } = await params

    const viewer = await verifyToken(request)
    const viewerId = viewer?.userId
    const isAdmin = viewer?.role === 'ADMIN'
    const isOwner = !!viewerId && viewerId === userId

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, status: true },
    })

    if (!user) {
      return NextResponse.json({ success: false, error: 'المستخدم غير موجود' }, { status: 404 })
    }

    if (user.status !== 'ACTIVE' && !isAdmin && !isOwner) {
      return NextResponse.json({ success: false, error: 'المستخدم غير موجود' }, { status: 404 })
    }

    const where: any = { userId }
    if (isAdmin || isOwner) {
      where.status = { not: 'DELETED' }
    } else {
      where.status = { in: ['ACTIVE', 'SOLD'] }
    }

    const products = await prisma.product.findMany({
      where: {
        ...where
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ 
      success: true,
      products: products.map(product => ({
        id: product.id,
        title: product.title,
        description: product.description,
        category: product.category,
        condition: product.condition,
        price: product.price,
        images: product.images,
        status: product.status.toLowerCase(), // تحويل ACTIVE إلى active
        createdAt: product.createdAt,
        soldPrice: product.soldPrice,
        soldDate: product.soldDate,
        buyerInfo: product.buyerInfo
      }))
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Error fetching user products:', error)
    return NextResponse.json({ 
      success: false,
      error: 'خطأ في جلب منتجات المستخدم' 
    }, { status: 500 })
  }
}