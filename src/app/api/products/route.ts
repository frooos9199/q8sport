import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyTokenString } from '@/lib/auth'

const prisma = new PrismaClient()

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
    // التحقق من token المصادقة - جرب عدة طرق
    let token = '';
    let authHeader = request.headers.get('authorization') || 
                     request.headers.get('x-authorization') ||
                     request.headers.get('Authorization') ||
                     request.headers.get('X-Authorization');
    console.log('🔐 Products API: Authorization header received:', !!authHeader);
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
      console.log('✅ Token from Authorization header');
    } else {
      // جرب من query parameter
      const { searchParams } = new URL(request.url);
      const tokenFromQuery = searchParams.get('token');
      if (tokenFromQuery) {
        token = tokenFromQuery;
        console.log('✅ Token from query parameter');
      }
    }
    
    if (!token) {
      console.error('❌ Products API: No token found');
      console.error('   Authorization header:', authHeader);
      return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 })
    }

    const decoded = await verifyTokenString(token)
    
    if (!decoded || !decoded.userId) {
      console.error('❌ Products API: Invalid token or missing userId')
      return NextResponse.json({ error: 'رمز المصادقة غير صالح' }, { status: 401 })
    }

    console.log('✅ Products API: User authenticated:', decoded.userId)
    
    const data = await request.json()
    
    const { 
      title, description, price, condition, category, images,
      productType, carBrand, carModel, carYear, kilometers, color, contactPhone
    } = data
    
    // التحقق من البيانات المطلوبة
    if (!title || !price) {
      return NextResponse.json({ error: 'العنوان والسعر مطلوبان' }, { status: 400 })
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
        contactPhone,
        images: typeof images === 'string' ? images : JSON.stringify(images),
        userId: decoded.userId, // استخدام userId من token
        status: 'ACTIVE'
      }
    })

    console.log('✅ Products API: Product created successfully:', product.id)
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('❌ Products API: Error creating product:', error)
    return NextResponse.json({ 
      error: 'خطأ في إضافة المنتج',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}