import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const UPLOAD_DIR = process.env.UPLOAD_DIR || './public/uploads'
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp']

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('images') as File[]
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'لا توجد ملفات للرفع' }, { status: 400 })
    }

    if (files.length > 8) {
      return NextResponse.json({ error: 'يمكن رفع 8 صور كحد أقصى' }, { status: 400 })
    }

    // إنشاء مجلد الرفع إذا لم يكن موجوداً
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true })
    }

    const uploadedFiles: string[] = []

    for (const file of files) {
      // التحقق من نوع الملف
      const fileExtension = path.extname(file.name).toLowerCase()
      if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
        return NextResponse.json({ 
          error: `نوع الملف ${fileExtension} غير مسموح. الأنواع المسموحة: ${ALLOWED_EXTENSIONS.join(', ')}` 
        }, { status: 400 })
      }

      // التحقق من حجم الملف
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ 
          error: `حجم الملف ${file.name} كبير جداً. الحد الأقصى: ${MAX_FILE_SIZE / 1024 / 1024}MB` 
        }, { status: 400 })
      }

      // إنشاء اسم فريد للملف
      const uniqueFileName = `${uuidv4()}${fileExtension}`
      const filePath = path.join(UPLOAD_DIR, uniqueFileName)

      // حفظ الملف
      const buffer = Buffer.from(await file.arrayBuffer())
      await writeFile(filePath, buffer)

      // إضافة مسار الملف للقائمة
      uploadedFiles.push(`/uploads/${uniqueFileName}`)
    }

    return NextResponse.json({ 
      success: true, 
      files: uploadedFiles,
      message: `تم رفع ${uploadedFiles.length} ملف بنجاح`
    })

  } catch (error) {
    console.error('Error uploading files:', error)
    return NextResponse.json({ error: 'خطأ في رفع الملفات' }, { status: 500 })
  }
}

// GET - للحصول على قائمة الملفات المرفوعة (للإدارة)
export async function GET() {
  try {
    const { readdir, stat } = await import('fs/promises')
    
    if (!existsSync(UPLOAD_DIR)) {
      return NextResponse.json({ files: [] })
    }

    const files = await readdir(UPLOAD_DIR)
    const filesInfo = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(UPLOAD_DIR, file)
        const stats = await stat(filePath)
        return {
          name: file,
          size: stats.size,
          url: `/uploads/${file}`,
          createdAt: stats.birthtime
        }
      })
    )

    return NextResponse.json({ files: filesInfo })
  } catch (error) {
    console.error('Error listing files:', error)
    return NextResponse.json({ error: 'خطأ في جلب قائمة الملفات' }, { status: 500 })
  }
}

// DELETE - لحذف ملف
export async function DELETE(request: NextRequest) {
  try {
    const { fileName } = await request.json()
    
    if (!fileName) {
      return NextResponse.json({ error: 'اسم الملف مطلوب' }, { status: 400 })
    }

    const filePath = path.join(UPLOAD_DIR, fileName)
    
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'الملف غير موجود' }, { status: 404 })
    }

    const { unlink } = await import('fs/promises')
    await unlink(filePath)

    return NextResponse.json({ success: true, message: 'تم حذف الملف بنجاح' })
  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json({ error: 'خطأ في حذف الملف' }, { status: 500 })
  }
}