'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const adminStatus = localStorage.getItem('isAdmin') === 'true';
        
        setIsAuthenticated(loggedIn);
        setIsAdmin(adminStatus);

        // Redirect if not authenticated and auth is required
        if (requireAuth && !loggedIn) {
          router.push('/auth');
          return;
        }

        // Redirect if not admin and admin is required
        if (requireAdmin && (!loggedIn || !adminStatus)) {
          router.push('/auth');
          return;
        }
      }
    };

    checkAuth();
  }, [requireAuth, requireAdmin, router]);

  // Show loading while checking authentication
  if (isAuthenticated === null) {
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
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (requireAdmin && (!isAuthenticated || !isAdmin)) {
    return null;
  }

  return <>{children}</>;
}