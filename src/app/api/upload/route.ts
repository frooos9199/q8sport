import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

const MAX_FILE_SIZE = 4500000 // 4.5MB (Vercel Blob server upload limit)
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('images') as File[]
    const singleFile = formData.get('file') as File | null
    
    const allFiles = files.length > 0 ? files : singleFile ? [singleFile] : []
    
    if (!allFiles || allFiles.length === 0) {
      return NextResponse.json({ error: 'No files to upload' }, { status: 400 })
    }

    if (allFiles.length > 8) {
      return NextResponse.json({ error: 'Maximum 8 files allowed' }, { status: 400 })
    }

    const uploadedFiles: string[] = []

    for (const file of allFiles) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({ 
          error: `File type ${file.type} not allowed`
        }, { status: 400 })
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ 
          error: `File ${file.name} is too large. Maximum: 4.5MB for server uploads` 
        }, { status: 400 })
      }

      try {
        // Upload to Vercel Blob
        const blob = await put(file.name, file, {
          access: 'public',
        })

        uploadedFiles.push(blob.url)
      } catch (blobError) {
        console.error('Blob upload error:', blobError)
        // Fallback to base64 if Blob fails
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const base64 = `data:${file.type};base64,${buffer.toString('base64')}`
        uploadedFiles.push(base64)
      }
    }

    return NextResponse.json({ 
      success: true, 
      files: uploadedFiles,
      message: `Successfully uploaded ${uploadedFiles.length} file(s)`
    })

  } catch (error) {
    console.error('Error uploading files:', error)
    return NextResponse.json({ 
      error: 'Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 })
  }
}
