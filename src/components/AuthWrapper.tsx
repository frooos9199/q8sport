'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AuthWrapperProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

export default function AuthWrapper({ 
  children, 
  requireAuth = false, 
  requireAdmin = false 
}: AuthWrapperProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Redirect if not authenticated and auth is required
      if (requireAuth && !user) {
        router.push('/auth');
        return;
      }

      // Redirect if not admin and admin is required
      if (requireAdmin && (!user || user.role !== 'ADMIN')) {
        router.push('/auth');
        return;
      }
    }
  }, [user, loading, requireAuth, requireAdmin, router]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحقق من تسجيل الدخول...</p>
        </div>
      </div>
    );
  }

  // Don't render protected content if not authorized
  if (requireAuth && !user) {
    return null;
  }

  if (requireAdmin && (!user || user.role !== 'ADMIN')) {
    return null;
  }

  return <>{children}</>;
}