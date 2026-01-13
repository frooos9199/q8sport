import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    // الكاتيجوري الافتراضية لقطع السيارات
    const categories = [
      { id: 'cat-1', name: 'Engine Parts', nameArabic: 'قطع المحرك', description: 'جميع قطع غيار المحرك', active: true },
      { id: 'cat-2', name: 'Transmission', nameArabic: 'ناقل الحركة', description: 'قطع غيار ناقل الحركة', active: true },
      { id: 'cat-3', name: 'Brakes', nameArabic: 'الفرامل', description: 'أجزاء نظام الفرامل', active: true },
      { id: 'cat-4', name: 'Suspension', nameArabic: 'نظام التعليق', description: 'قطع غيار نظام التعليق', active: true },
      { id: 'cat-5', name: 'Electrical', nameArabic: 'الكهرباء', description: 'القطع الكهربائية', active: true },
      { id: 'cat-6', name: 'Body Parts', nameArabic: 'قطع الهيكل', description: 'أجزاء هيكل السيارة', active: true },
      { id: 'cat-7', name: 'Interior', nameArabic: 'الداخلية', description: 'قطع غيار داخلية', active: true },
      { id: 'cat-8', name: 'Tires & Wheels', nameArabic: 'الإطارات والجنوط', description: 'الإطارات والجنوط', active: true },
      { id: 'cat-9', name: 'Fluids & Oils', nameArabic: 'الزيوت والسوائل', description: 'زيوت وسوائل السيارة', active: true },
      { id: 'cat-10', name: 'Accessories', nameArabic: 'الإكسسوارات', description: 'إكسسوارات السيارة', active: true }
    ]

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

export async function POST(request: NextRequest) {
  try {
    const { name, nameArabic, description } = await request.json()

    if (!name || !nameArabic) {
      return NextResponse.json(
        { success: false, message: 'اسم القسم مطلوب باللغتين' },
        { status: 400 }
      )
    }

    const newCategory = {
      id: `cat-${Date.now()}`,
      name,
      nameArabic,
      description: description || '',
      active: true,
      createdAt: new Date().toISOString()
    }

    // في التطبيق الحقيقي، سيتم حفظ البيانات في قاعدة البيانات
    // هنا نرجع فقط البيانات للعرض

    return NextResponse.json({
      success: true,
      message: 'تم إضافة القسم بنجاح',
      category: newCategory
    })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ في إضافة القسم' },
      { status: 500 }
    )
  }
}