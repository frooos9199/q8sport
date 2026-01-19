import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyTokenString } from '@/lib/auth'

export async function GET(request: NextRequest) {
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

    const notifications = await prisma.notification.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    return NextResponse.json({ notifications })

  } catch (error) {
    console.error('Notifications error:', error)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
