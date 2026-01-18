import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

function safeJsonParse(value: string | null): unknown {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

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

    // Hide stopped shops/users from public views
    const viewer = await verifyToken(request)
    const viewerId = viewer?.userId
    const isAdmin = viewer?.role === 'ADMIN'
    const isOwner = !!viewerId && viewerId === user.id

    if (user.status !== 'ACTIVE' && !isAdmin && !isOwner) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 })
    }

    // Public behavior: only show ACTIVE/SOLD products; hide stopped (INACTIVE/DELETED)
    const visibleProducts = (isAdmin || isOwner)
      ? user.products
      : user.products.filter((p) => p.status === 'ACTIVE' || p.status === 'SOLD')

    // تحويل البيانات لتتناسب مع واجهة الموقع
    const sellerProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      whatsapp: user.whatsapp,
      avatar: user.avatar,
      role: user.role,
      status: user.status,
      lastLoginAt: user.lastLoginAt?.toISOString() || null,
      shopName: user.shopName,
      shopAddress: user.shopAddress,
      businessType: user.businessType,
      rating: user.rating || 4.0,
      verified: user.verified,
      joinDate: user.createdAt.toISOString(),
      totalProducts: visibleProducts.length,
      activeProducts: visibleProducts.filter(p => p.status === 'ACTIVE').length,
      soldProducts: visibleProducts.filter(p => p.status === 'SOLD').length
    }

    // تحويل المنتجات
    const products = visibleProducts.map(product => ({
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      condition: product.condition,
      category: product.category,
      carBrand: product.carBrand,
      carModel: product.carModel,
      carYear: product.carYear,
      images: product.images,
      status: product.status.toLowerCase(),
      views: product.views,
      soldPrice: product.soldPrice,
      soldDate: product.soldDate?.toISOString(),
      buyerInfo: safeJsonParse(product.buyerInfo),
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
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'خطأ في جلب بيانات المستخدم' }, { status: 500 })
  }
}