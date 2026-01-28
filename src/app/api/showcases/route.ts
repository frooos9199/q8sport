import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// GET - جلب جميع العروض المعتمدة
export async function GET() {
  try {
    const showcases = await prisma.showcase.findMany({
      where: {
        status: 'APPROVED'
      },
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

    const imagesJson = typeof images === 'string' ? images : JSON.stringify(images)

    const showcase = await prisma.showcase.create({
      data: {
        carBrand,
        carModel,
        carYear: parseInt(carYear),
        horsepower: horsepower ? parseInt(horsepower) : null,
        description,
        images: imagesJson,
        userId: user.userId,
        status: 'PENDING'
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
