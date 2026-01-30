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
    console.log('📥 Upload API called');
    const formData = await req.formData();
    
    // Log all form data keys
    const keys = Array.from(formData.keys());
    console.log('FormData keys:', keys);
    
    const files = formData.getAll('images') as File[];
    const singleFile = formData.get('file') as File | null;
    
    console.log(`Files received - images: ${files.length}, file: ${singleFile ? 'yes' : 'no'}`);
    
    // Log file details
    if (singleFile) {
      console.log('Single file details:', {
        name: singleFile.name,
        type: singleFile.type,
        size: singleFile.size
      });
    }
    files.forEach((f, i) => {
      console.log(`File ${i} details:`, {
        name: f.name,
        type: f.type,
        size: f.size
      });
    });

    const uploadFiles = files.length > 0 ? files : singleFile ? [singleFile] : [];

    if (uploadFiles.length === 0) {
      console.error('No files in request');
      return NextResponse.json({ success: false, error: 'لم يتم رفع ملف' }, { status: 400 });
    }

    const results = [] as Array<{ url: string; publicId: string; size: number }>;

    for (const file of uploadFiles) {
      try {
        // التحقق من نوع الملف
        if (!file || typeof file === 'string') {
          console.error('Invalid file type:', typeof file);
          return NextResponse.json({ success: false, error: 'نوع ملف غير صحيح' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // التحقق من حجم الملف
        if (buffer.length === 0) {
          console.error('Empty file received');
          return NextResponse.json({ success: false, error: 'الملف فارغ' }, { status: 400 });
        }

        console.log(`Processing image: ${file.name}, size: ${buffer.length} bytes`);

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
        
        console.log(`✅ Image uploaded successfully: ${result.secure_url}`);
      } catch (fileError) {
        console.error('❌ Error processing file:', fileError);
        console.error('Error type:', typeof fileError);
        console.error('Error stack:', fileError instanceof Error ? fileError.stack : 'No stack');
        const errorMessage = fileError instanceof Error ? fileError.message : JSON.stringify(fileError);
        return NextResponse.json({ 
          success: false, 
          error: `خطأ في معالجة الصورة: ${errorMessage}` 
        }, { status: 500 });
      }
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
