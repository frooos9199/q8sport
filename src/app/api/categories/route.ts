import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, AuthenticatedRequest } from '@/lib/auth'

function slugify(input: string) {
  return `${input}`
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
}

export async function GET() {
  try {
    const categories = await prisma.partCategory.findMany({
      select: {
        id: true,
        name: true,
        nameArabic: true,
        description: true,
        active: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      categories,
      count: categories.length
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ في جلب الكاتيجوري' },
      { status: 500 }
    )
  }
}

export const POST = requireAdmin(async (request: AuthenticatedRequest) => {
  try {
    const { name, nameArabic, description } = await request.json()

    if (!name || !nameArabic) {
      return NextResponse.json(
        { success: false, message: 'اسم القسم مطلوب باللغتين' },
        { status: 400 }
      )
    }

    const category = await prisma.partCategory.create({
      data: {
        name,
        nameArabic,
        description: description || null,
        slug: slugify(name),
        active: true
      },
      select: {
        id: true,
        name: true,
        nameArabic: true,
        description: true,
        active: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'تم إضافة القسم بنجاح',
      category
    })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ في إضافة القسم' },
      { status: 500 }
    )
  }
})