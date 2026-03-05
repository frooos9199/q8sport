import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { put } from '@vercel/blob'

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

    // Parse images (could be string or array)
    let imageArray: string[] = []
    try {
      imageArray = typeof images === 'string' ? JSON.parse(images) : images
    } catch (error) {
      return NextResponse.json({ error: 'صيغة الصور غير صحيحة' }, { status: 400 })
    }

    // Upload images to Vercel Blob and get URLs
    const uploadedImageUrls: string[] = []
    for (let i = 0; i < imageArray.length; i++) {
      const image = imageArray[i]
      
      try {
        // Skip if already a URL
        if (image.startsWith('http://') || image.startsWith('https://')) {
          uploadedImageUrls.push(image)
          console.log(`✅ Image ${i + 1}: Already a URL`)
        } 
        // Upload base64 images to Vercel Blob
        else if (image.startsWith('data:image')) {
          // Extract base64 data
          const matches = image.match(/^data:image\/(\w+);base64,(.+)$/)
          if (!matches) {
            console.warn(`⚠️ Image ${i + 1}: Invalid base64 format`)
            continue
          }

          const imageType = matches[1]
          const base64Data = matches[2]
          const buffer = Buffer.from(base64Data, 'base64')
          
          // Upload to Vercel Blob
          const filename = `showcase_${Date.now()}_${i}.${imageType}`
          const blob = await put(filename, buffer, {
            access: 'public',
            contentType: `image/${imageType}`
          })
          
          uploadedImageUrls.push(blob.url)
          console.log(`✅ Image ${i + 1}: Uploaded to Vercel Blob - ${blob.url.substring(0, 60)}...`)
        } else {
          console.warn(`⚠️ Image ${i + 1}: Invalid format`)
        }
      } catch (error) {
        console.error(`❌ Error uploading image ${i + 1}:`, error)
        // Continue with other images even if one fails
      }
    }

    if (uploadedImageUrls.length === 0) {
      return NextResponse.json({ error: 'فشل رفع الصور' }, { status: 500 })
    }

    const imagesJson = JSON.stringify(uploadedImageUrls)

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
