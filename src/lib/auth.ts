import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    email: string;
    role: string;
    permissions?: {
      canManageProducts: boolean;
      canManageUsers: boolean;
      canViewReports: boolean;
      canManageOrders: boolean;
      canManageShop: boolean;
    };
  };
}

export interface UserPayload {
  id: string
  email: string
  name: string
  role: 'USER' | 'SELLER' | 'SHOP_OWNER' | 'ADMIN'
  permissions: {
    canManageProducts: boolean
    canManageUsers: boolean
    canViewReports: boolean
    canManageOrders: boolean
    canManageShop: boolean
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  // دعم أكثر من اسم للهيدر + دعم token في query (مفيد للموبايل/الاختبارات)
  const authHeader =
    request.headers.get('authorization') ||
    request.headers.get('x-authorization') ||
    request.headers.get('Authorization') ||
    request.headers.get('X-Authorization');

  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  try {
    const { searchParams } = new URL(request.url);
    return searchParams.get('token');
  } catch {
    return null;
  }
}

export async function verifyToken(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      console.log('No valid authorization token found');
      return null;
    }
    console.log('Verifying token:', token.substring(0, 20) + '...');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    console.log('Token decoded successfully, userId:', decoded.userId);
    
    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { 
        id: true, 
        email: true, 
        role: true, 
        status: true,
        canManageProducts: true,
        canManageUsers: true,
        canViewReports: true,
        canManageOrders: true,
        canManageShop: true
      }
    });

    if (!user || user.status !== 'ACTIVE') {
      console.log('User not found or not active');
      return null;
    }

    console.log('Token verified successfully for user:', user.email);
    
    return {
      userId: user.id,
      email: user.email,
      role: user.role,
      permissions: {
        canManageProducts: user.canManageProducts,
        canManageUsers: user.canManageUsers,
        canViewReports: user.canViewReports,
        canManageOrders: user.canManageOrders,
        canManageShop: user.canManageShop
      }
    };
  } catch (error) {
    return null;
  }
}

export function getUserFromToken(request: NextRequest): UserPayload | null {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) return null

    const payload = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as UserPayload
    return payload
  } catch (error) {
    return null
  }
}

// دالة للتحقق من token string مباشرة
export async function verifyTokenString(tokenString: string): Promise<{ userId: string; email: string } | null> {
  try {
    console.log('🔐 Verifying token:', tokenString.substring(0, 30) + '...');
    
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    console.log('🔑 Using JWT_SECRET:', secret ? `${secret.substring(0, 20)}...` : 'NOT SET');
    
    const decoded = jwt.verify(tokenString, secret) as any;
    
    console.log('✅ Token decoded successfully:', {
      userId: decoded.userId,
      email: decoded.email
    });
    
    if (!decoded.userId) {
      console.error('❌ Token missing userId');
      return null;
    }
    
    return {
      userId: decoded.userId,
      email: decoded.email
    };
  } catch (error) {
    console.error('❌ Error verifying token:', error instanceof Error ? error.message : String(error));
    return null;
  }
}

export function hasPermission(user: any, permission: string): boolean {
  if (!user) return false
  
  // Admin has all permissions
  if (user.role === 'ADMIN') return true
  
  return user.permissions && user.permissions[permission]
}

export function canAccessAdminPanel(user: any): boolean {
  if (!user) return false
  
  return user.role === 'ADMIN' || 
         user.role === 'SHOP_OWNER' || 
         hasPermission(user, 'canManageUsers') ||
         hasPermission(user, 'canViewReports')
}

export function canManageProducts(user: any): boolean {
  return hasPermission(user, 'canManageProducts')
}

export function canManageUsers(user: any): boolean {
  return hasPermission(user, 'canManageUsers')
}

export function canViewReports(user: any): boolean {
  return hasPermission(user, 'canViewReports')
}

export function canManageOrders(user: any): boolean {
  return hasPermission(user, 'canManageOrders')
}

export function canManageShop(user: any): boolean {
  return hasPermission(user, 'canManageShop')
}

export function getRoleDisplayName(role: string): string {
  const roleNames = {
    'USER': 'مستخدم',
    'SELLER': 'بائع',
    'SHOP_OWNER': 'صاحب محل',
    'ADMIN': 'إدمن'
  }
  return roleNames[role as keyof typeof roleNames] || role
}

export function setUserPermissions(role: 'USER' | 'SELLER' | 'SHOP_OWNER' | 'ADMIN') {
  switch (role) {
    case 'ADMIN':
      return {
        canManageProducts: true,
        canManageUsers: true,
        canViewReports: true,
        canManageOrders: true,
        canManageShop: true
      }
    
    case 'SHOP_OWNER':
      return {
        canManageProducts: true,
        canManageUsers: false,
        canViewReports: true,
        canManageOrders: true,
        canManageShop: true
      }
    
    case 'SELLER':
      return {
        canManageProducts: true,
        canManageUsers: false,
        canViewReports: false,
        canManageOrders: false,
        canManageShop: false
      }
    
    default:
      return {
        canManageProducts: false,
        canManageUsers: false,
        canViewReports: false,
        canManageOrders: false,
        canManageShop: false
      }
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

export function requirePermission(permission: string) {
  return (handler: (request: AuthenticatedRequest, context?: any) => Promise<NextResponse>) => {
    return async (request: NextRequest, context?: any) => {
      const user = await verifyToken(request);
      
      if (!user) {
        return NextResponse.json(
          { error: 'غير مصرح بالدخول' },
          { status: 401 }
        );
      }

      if (!hasPermission(user, permission)) {
        return NextResponse.json(
          { error: 'ليس لديك صلاحية للوصول لهذه الميزة' },
          { status: 403 }
        );
      }

      (request as AuthenticatedRequest).user = user;
      return handler(request as AuthenticatedRequest, context);
    };
  };
}