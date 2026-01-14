import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// PATCH - تحديث حالة المنتج
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params
    const { status, soldPrice, buyerInfo } = await request.json()

    // جلب المنتج أولاً
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, message: 'المنتج غير موجود' },
        { status: 404 }
      )
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        status: status,
        ...(soldPrice && { price: soldPrice })
      }
    })

    return NextResponse.json({
      success: true,
      message: 'تم تحديث حالة المنتج بنجاح',
      product
    })
  } catch (error) {
    console.error('Error updating product status:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ في تحديث حالة المنتج' },
      { status: 500 }
    )
  }
}

// DELETE - حذف المنتج
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params

    // تحديث حالة المنتج بدلاً من حذفه نهائياً
    await prisma.product.update({
      where: { id: productId },
      data: { status: 'DELETED' }
    })

    return NextResponse.json({
      success: true,
      message: 'تم حذف المنتج بنجاح'
    })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ في حذف المنتج' },
      { status: 500 }
    )
  }
}