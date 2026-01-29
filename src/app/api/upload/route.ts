import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('images') as File[];
    const singleFile = formData.get('file') as File | null;

    const uploadFiles = files.length > 0 ? files : singleFile ? [singleFile] : [];

    if (uploadFiles.length === 0) {
      return NextResponse.json({ success: false, error: 'لم يتم رفع ملف' }, { status: 400 });
    }

    const results = [] as Array<{ url: string; publicId: string; size: number }>;

    for (const file of uploadFiles) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // تحسين الصورة
      const optimizedBuffer = await sharp(buffer)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();

      // رفع على Cloudinary
      const base64Image = `data:image/webp;base64,${optimizedBuffer.toString('base64')}`;
      const result = await cloudinary.uploader.upload(base64Image, {
        folder: process.env.CLOUDINARY_FOLDER || 'q8sport',
        transformation: [{ quality: 'auto' }, { fetch_format: 'auto' }]
      });

      results.push({
        url: result.secure_url,
        publicId: result.public_id,
        size: result.bytes,
      });
    }

    return NextResponse.json({
      success: true,
      url: results[0]?.url,
      publicId: results[0]?.publicId,
      size: results[0]?.size,
      files: results.map((r) => r.url),
      publicIds: results.map((r) => r.publicId),
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json({ success: false, error: 'خطأ في رفع الصورة' }, { status: 500 });
  }
}
