import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

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
    const data = await request.json()
    
    const { 
      title, description, price, condition, category, images, userId, status,
      productType, carBrand, carModel, carYear, kilometers, color
    } = data
    
    // التحقق من البيانات المطلوبة
    if (!title || !description || !price || !images) {
      return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 })
    }

    // التحقق من وجود userId
    if (!userId) {
      return NextResponse.json({ error: 'معرف المستخدم مطلوب' }, { status: 400 })
    }

    // إنشاء المنتج مع userId صحيح
    const product = await prisma.product.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        condition: condition || 'جديد',
        category: category || 'قطع غيار',
        productType: productType || 'PART',
        carBrand,
        carModel,
        carYear: carYear ? parseInt(carYear) : null,
        kilometers: kilometers ? parseInt(kilometers) : null,
        color,
        images: typeof images === 'string' ? images : JSON.stringify(images),
        userId: userId,
        status: status || 'ACTIVE'
      }
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'خطأ في إضافة المنتج' }, { status: 500 })
  }
}