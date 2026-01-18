import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { getAppSettings } from '@/lib/appSettings'

function normalizePhone(input: unknown) {
  if (!input) return ''
  return String(input).replace(/[^0-9]/g, '')
}

// GET - جلب جميع المنتجات النشطة
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        status: 'ACTIVE'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            rating: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'خطأ في جلب المنتجات' }, { status: 500 })
  }
}

// POST - إضافة منتج جديد
export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { phone: true }
    })

    const settings = await getAppSettings()
    
    const data = await request.json()
    
    const { 
      title, description, price, condition, category, images,
      productType, carBrand, carModel, carYear, kilometers, color, contactPhone
    } = data
    
    // التحقق من البيانات المطلوبة
    if (!title || !price) {
      return NextResponse.json({ error: 'العنوان والسعر مطلوبان' }, { status: 400 })
    }

    // Enforce max products per user (excluding deleted)
    const existingCount = await prisma.product.count({
      where: {
        userId: user.userId,
        status: { not: 'DELETED' }
      }
    })

    if (existingCount >= settings.maxProductsPerUser) {
      return NextResponse.json(
        { error: `تجاوزت الحد الأقصى للمنتجات (${settings.maxProductsPerUser})` },
        { status: 400 }
      )
    }

    // Enforce contact phone matches profile phone
    const profilePhone = dbUser?.phone || null
    if (!profilePhone) {
      return NextResponse.json(
        { error: 'يرجى إضافة رقم الهاتف في الملف الشخصي أولاً' },
        { status: 400 }
      )
    }

    if (contactPhone) {
      const provided = normalizePhone(contactPhone)
      const registered = normalizePhone(profilePhone)
      if (provided && registered && provided !== registered) {
        return NextResponse.json(
          { error: 'رقم الهاتف يجب أن يطابق رقم الهاتف المسجل في الملف الشخصي' },
          { status: 400 }
        )
      }
    }

    // إنشاء المنتج باستخدام userId من token
    const product = await prisma.product.create({
      data: {
        title,
        description: description || '',
        price: parseFloat(price),
        condition: condition || 'USED',
        category: category || 'parts',
        productType: productType || 'PART',
        carBrand,
        carModel,
        carYear: carYear ? parseInt(carYear) : null,
        kilometers: kilometers ? parseInt(kilometers) : null,
        color,
        contactPhone: profilePhone,
        images: typeof images === 'string' ? images : JSON.stringify(images),
        userId: user.userId,
        // Non-admin products require approval (represented as INACTIVE)
        status: user.role === 'ADMIN' || settings.autoApprove ? 'ACTIVE' : 'INACTIVE'
      }
    })
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Products API: Error creating product:', error)
    return NextResponse.json({ 
      error: 'خطأ في إضافة المنتج',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}