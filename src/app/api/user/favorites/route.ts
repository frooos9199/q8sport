import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyTokenString } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const decoded = await verifyTokenString(token)
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'رمز المصادقة غير صالح' }, { status: 401 })
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: decoded.userId },
      include: { product: true }
    })

    return NextResponse.json({ favorites })

  } catch (error) {
    console.error('Favorites error:', error)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const decoded = await verifyTokenString(token)
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'رمز المصادقة غير صالح' }, { status: 401 })
    }

    const { productId } = await request.json()

    const favorite = await prisma.favorite.create({
      data: {
        userId: decoded.userId,
        productId
      }
    })

    return NextResponse.json({ favorite })

  } catch (error) {
    console.error('Add favorite error:', error)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
