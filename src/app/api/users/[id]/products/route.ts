import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - جلب منتجات مستخدم محدد
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id
    
    const products = await prisma.product.findMany({
      where: {
        userId: userId
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
    })
  } catch (error) {
    console.error('Error fetching user products:', error)
    return NextResponse.json({ 
      success: false,
      error: 'خطأ في جلب منتجات المستخدم' 
    }, { status: 500 })
  }
}