import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'

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

// POST - إضافة منتج جديد (يتطلب تسجيل دخول)
export async function POST(request: NextRequest) {
  try {
    // التحقق من المصادقة
    const authHeader = request.headers.get('authorization');
    console.log('Authorization header:', authHeader?.substring(0, 30) + '...');
    
    const authUser = await verifyToken(request);
    console.log('Auth user result:', authUser ? 'Authenticated' : 'Not authenticated');
    
    if (!authUser) {
      return NextResponse.json({ 
        error: 'يجب عليك تسجيل الدخول أولاً لإضافة منتج' 
      }, { status: 401 })
    }
    
    const data = await request.json()
    
    const { 
      title, description, price, condition, category, images,
      productType, carBrand, carModel, carYear, kilometers, color,
      contactPhone
    } = data
    
    // التحقق من البيانات المطلوبة
    if (!title || !price || !images) {
      return NextResponse.json({ error: 'العنوان والسعر والصور مطلوبة' }, { status: 400 })
    }

    // استخدام userId من المصادقة بدلاً من البيانات المرسلة
    const userId = authUser.userId;

    // إنشاء المنتج مع userId من المستخدم المسجل
    const product = await prisma.product.create({
      data: {
        title,
        description: description || '',
        price: parseFloat(price),
        condition: condition || 'NEW',
        category: category || 'قطع غيار',
        productType: productType || 'PART',
        carBrand,
        carModel,
        carYear: carYear ? parseInt(carYear) : null,
        kilometers: kilometers ? parseInt(kilometers) : null,
        color,
        contactPhone,
        images: typeof images === 'string' ? images : JSON.stringify(images),
        userId: userId,
        status: 'ACTIVE'
      }
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'خطأ في إضافة المنتج' }, { status: 500 })
  }
}