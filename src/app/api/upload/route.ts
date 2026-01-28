import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ success: false, error: 'لم يتم رفع ملف' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // تحسين الصورة باستخدام sharp
    const optimizedBuffer = await sharp(buffer)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();

    const filename = `${Date.now()}-${file.name.replace(/\.[^/.]+$/, '')}.webp`;
    const filepath = join(process.cwd(), 'public', 'uploads', filename);
    
    await writeFile(filepath, optimizedBuffer);

    return NextResponse.json({
      success: true,
      url: `/uploads/${filename}`,
      size: optimizedBuffer.length,
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json({ success: false, error: 'خطأ في رفع الصورة' }, { status: 500 });
  }
}
