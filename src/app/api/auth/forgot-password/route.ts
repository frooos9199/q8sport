import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'البريد الإلكتروني مطلوب' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json({ 
        message: 'إذا كان البريد الإلكتروني مسجلاً، سيتم إرسال رابط إعادة التعيين' 
      })
    }

    console.log('📧 Password reset requested for:', email)
    console.log('⚠️ Email sending not configured yet')

    return NextResponse.json({ 
      message: 'تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني' 
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ 
      error: 'حدث خطأ في إرسال البريد الإلكتروني' 
    }, { status: 500 })
  }
}
