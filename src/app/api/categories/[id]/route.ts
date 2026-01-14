import { NextRequest, NextResponse } from 'next/server'

// PUT - تحديث قسم
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { name, nameArabic, description } = await request.json()
    const { id } = params

    if (!name || !nameArabic) {
      return NextResponse.json(
        { success: false, message: 'اسم القسم مطلوب باللغتين' },
        { status: 400 }
      )
    }

    // في التطبيق الحقيقي، سيتم تحديث البيانات في قاعدة البيانات
    const updatedCategory = {
      id,
      name,
      nameArabic,
      description: description || '',
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      message: 'تم تحديث القسم بنجاح',
      category: updatedCategory
    })
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ في تحديث القسم' },
      { status: 500 }
    )
  }
}

// DELETE - حذف قسم
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // في التطبيق الحقيقي، سيتم حذف القسم من قاعدة البيانات
    return NextResponse.json({
      success: true,
      message: 'تم حذف القسم بنجاح',
      id
    })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ في حذف القسم' },
      { status: 500 }
    )
  }
}

// PATCH - تحديث حالة القسم (تفعيل/إيقاف)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { active } = await request.json()
    const { id } = params

    // في التطبيق الحقيقي، سيتم تحديث حالة القسم في قاعدة البيانات
    return NextResponse.json({
      success: true,
      message: active ? 'تم تفعيل القسم' : 'تم إيقاف القسم',
      category: {
        id,
        active,
        updatedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error updating category status:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ في تحديث حالة القسم' },
      { status: 500 }
    )
  }
}
