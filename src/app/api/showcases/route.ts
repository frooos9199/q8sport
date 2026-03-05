import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// GET - جلب جميع السيارات (بدون اعتماد مسبق)
export async function GET(request: NextRequest) {
  try {
    const showcases = await prisma.showcase.findMany({
      where: {},
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        showcaseComments: {
          include: {
            user: {
              select: {
                name: true,
                avatar: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: [
        { featured: 'desc' },
        { likes: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({ showcases })
  } catch (error) {
    console.error('Error fetching showcases:', error)
    return NextResponse.json({ error: 'خطأ في جلب العروض' }, { status: 500 })
  }
}

// POST - إضافة عرض جديد
export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 })
    }

    const data = await request.json()
    const { carBrand, carModel, carYear, horsepower, description, images } = data

    if (!carBrand || !carModel || !carYear || !description || !images) {
      return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 })
    }

    // Parse images (should be Firebase Storage URLs from the app)
    let imageArray: string[] = []
    try {
      imageArray = typeof images === 'string' ? JSON.parse(images) : images
    } catch (error) {
      return NextResponse.json({ error: 'صيغة الصور غير صحيحة' }, { status: 400 })
    }

    // Validate that images are URLs (from Firebase or other sources)
    const validImages = imageArray.filter(img => 
      img.startsWith('http://') || img.startsWith('https://')
    )

    if (validImages.length === 0) {
      return NextResponse.json({ error: 'لا توجد صور صالحة' }, { status: 400 })
    }

    console.log(`✅ Received ${validImages.length} image URLs from Firebase Storage`)

    const imagesJson = JSON.stringify(validImages)

    const showcase = await prisma.showcase.create({
      data: {
        carBrand,
        carModel,
        carYear: parseInt(carYear),
        horsepower: horsepower ? parseInt(horsepower) : null,
        description,
        images: imagesJson,
        userId: user.userId,
        status: 'APPROVED'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    })

    return NextResponse.json({ showcase }, { status: 201 })
  } catch (error) {
    console.error('Error creating showcase:', error)
    return NextResponse.json({ error: 'خطأ في إضافة العرض' }, { status: 500 })
  }
}
