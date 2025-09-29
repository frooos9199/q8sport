import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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