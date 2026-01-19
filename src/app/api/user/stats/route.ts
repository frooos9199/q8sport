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

    const [totalProducts, activeProducts, soldProducts, totalViews, totalRevenue, favoritesCount] = await Promise.all([
      prisma.product.count({ where: { userId: decoded.userId } }),
      prisma.product.count({ where: { userId: decoded.userId, status: 'ACTIVE' } }),
      prisma.product.count({ where: { userId: decoded.userId, status: 'SOLD' } }),
      prisma.product.aggregate({ where: { userId: decoded.userId }, _sum: { views: true } }),
      prisma.product.aggregate({ where: { userId: decoded.userId, status: 'SOLD' }, _sum: { soldPrice: true } }),
      prisma.favorite.count({ where: { userId: decoded.userId } })
    ])

    return NextResponse.json({
      totalProducts,
      activeProducts,
      soldProducts,
      totalViews: totalViews._sum.views || 0,
      totalRevenue: totalRevenue._sum.soldPrice || 0,
      favoriteCount: favoritesCount
    })

  } catch (error) {
    console.error('User stats error:', error)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
