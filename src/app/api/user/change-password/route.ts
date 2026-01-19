import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyTokenString } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const decoded = await verifyTokenString(token)
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'رمز المصادقة غير صالح' }, { status: 401 })
    }

    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 })
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password)
    
    if (!isValidPassword) {
      return NextResponse.json({ error: 'كلمة المرور الحالية غير صحيحة' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id: decoded.userId },
      data: { password: hashedPassword }
    })

    return NextResponse.json({ message: 'تم تغيير كلمة المرور بنجاح' })

  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json({ 
      error: 'حدث خطأ في تغيير كلمة المرور' 
    }, { status: 500 })
  }
}
