import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - جلب بيانات مستخدم محدد مع منتجاته
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: userId } = await params
    
    const user = await prisma.user.findUnique({
      where: {
        id: userId
      },
      include: {
        products: {
          where: { status: { not: 'DELETED' } },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 })
    }

    // تحويل البيانات لتتناسب مع واجهة الموقع
    const sellerProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      whatsapp: user.whatsapp,
      avatar: user.avatar,
      rating: user.rating || 4.0,
      verified: user.verified,
      joinDate: user.createdAt.toISOString(),
      totalProducts: user.products.length,
      activeProducts: user.products.filter(p => p.status === 'ACTIVE').length,
      soldProducts: user.products.filter(p => p.status === 'SOLD').length
    }

    // تحويل المنتجات
    const products = user.products.map(product => ({
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      condition: product.condition,
      category: product.category,
      images: product.images,
      status: product.status.toLowerCase(),
      views: product.views,
      soldPrice: product.soldPrice,
      soldDate: product.soldDate?.toISOString(),
      buyerInfo: product.buyerInfo ? JSON.parse(product.buyerInfo) : null,
      createdAt: product.createdAt.toISOString(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        rating: user.rating || 4.0
      }
    }))

    return NextResponse.json({
      success: true,
      seller: sellerProfile,
      products
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'خطأ في جلب بيانات المستخدم' }, { status: 500 })
  }
}