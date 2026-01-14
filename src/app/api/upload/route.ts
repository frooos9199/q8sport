import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

const MAX_FILE_SIZE = 10485760 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('images') as File[]
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files to upload' }, { status: 400 })
    }

    if (files.length > 8) {
      return NextResponse.json({ error: 'Maximum 8 files allowed' }, { status: 400 })
    }

    const uploadedFiles: string[] = []

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({ 
          error: `File type ${file.type} not allowed`
        }, { status: 400 })
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ 
          error: `File ${file.name} is too large. Maximum: 10MB` 
        }, { status: 400 })
      }

      const blob = await put(file.name, file, {
        access: 'public',
      })

      uploadedFiles.push(blob.url)
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

export const runtime = 'edge'
