import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export async function verifyToken(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, status: true }
    });

    if (!user || user.status !== 'ACTIVE') {
      return null;
    }

    return {
      userId: user.id,
      email: user.email,
      role: user.role
    };
  } catch (error) {
    return null;
  }
}

export function requireAuth(handler: (request: AuthenticatedRequest, context?: any) => Promise<NextResponse>) {
  return async (request: NextRequest, context?: any) => {
    const user = await verifyToken(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'غير مصرح بالدخول' },
        { status: 401 }
      );
    }

    (request as AuthenticatedRequest).user = user;
    return handler(request as AuthenticatedRequest, context);
  };
}

export function requireAdmin(handler: (request: AuthenticatedRequest, context?: any) => Promise<NextResponse>) {
  return async (request: NextRequest, context?: any) => {
    const user = await verifyToken(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'غير مصرح بالدخول' },
        { status: 401 }
      );
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'صلاحيات إدارية مطلوبة' },
        { status: 403 }
      );
    }

    (request as AuthenticatedRequest).user = user;
    return handler(request as AuthenticatedRequest, context);
  };
}