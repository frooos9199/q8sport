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

// PUT - تحديث قسم
export const PUT = requireAdmin(async (
  request: AuthenticatedRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    const params = await context.params
    const { name, nameArabic, description } = await request.json()

    if (!name || !nameArabic) {
      return NextResponse.json(
        { success: false, message: 'اسم القسم مطلوب باللغتين' },
        { status: 400 }
      )
    }

    const category = await prisma.partCategory.update({
      where: { id: params.id },
      data: {
        name,
        nameArabic,
        description: description || null,
        slug: slugify(name)
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
      message: 'تم تحديث القسم بنجاح',
      category
    })
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ في تحديث القسم' },
      { status: 500 }
    )
  }
})

// DELETE - حذف قسم
export const DELETE = requireAdmin(async (
  request: AuthenticatedRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    const params = await context.params
    await prisma.partCategory.delete({ where: { id: params.id } })

    return NextResponse.json({
      success: true,
      message: 'تم حذف القسم بنجاح',
      id: params.id
    })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ في حذف القسم' },
      { status: 500 }
    )
  }
})

// PATCH - تحديث حالة القسم (تفعيل/إيقاف)
export const PATCH = requireAdmin(async (
  request: AuthenticatedRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    const params = await context.params
    const { active } = await request.json()

    const category = await prisma.partCategory.update({
      where: { id: params.id },
      data: { active: Boolean(active) },
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
      message: active ? 'تم تفعيل القسم' : 'تم إيقاف القسم',
      category
    })
  } catch (error) {
    console.error('Error updating category status:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ في تحديث حالة القسم' },
      { status: 500 }
    )
  }
})
