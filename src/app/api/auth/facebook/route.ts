import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { facebookId, name, email, picture, accessToken } = await request.json()

    // Verify Facebook access token (optional - for extra security)
    // You can add Facebook token verification here

    if (!facebookId || !email || !name) {
      return NextResponse.json({ error: 'بيانات فيس بوك غير مكتملة' }, { status: 400 })
    }

    // Check if user exists with this Facebook ID
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { facebookId: facebookId }
        ]
      }
    })

    if (user) {
      // User exists, update Facebook info if needed
      if (!user.facebookId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            facebookId: facebookId,
            avatar: picture || user.avatar
          }
        })
      }
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: email,
          name: name,
          facebookId: facebookId,
          avatar: picture,
          password: crypto.randomBytes(32).toString('hex'), // Random password for Facebook users
          role: 'USER',
          status: 'ACTIVE',
          verified: true, // Facebook users are pre-verified
          phone: '',
          whatsapp: ''
        }
      })
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        facebookAuth: true
      },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    )

    // Return user data and token
    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        whatsapp: user.whatsapp,
        role: user.role,
        avatar: user.avatar
      }
    })

  } catch (error) {
    console.error('Facebook auth error:', error)
    return NextResponse.json({ 
      error: 'خطأ في تسجيل الدخول بالفيس بوك' 
    }, { status: 500 })
  }
}