'use client';

import { useAuth, PermissionGuard } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, LogOut } from 'lucide-react';

export default function UserActions() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    
    // Clear old localStorage items
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    
    router.push('/');
  };

  const handleProfileClick = () => {
    if (user?.role === 'ADMIN') {
      router.push('/admin');
    } else if (user?.role === 'SHOP_OWNER' || user?.role === 'SELLER') {
      router.push('/admin/enhanced');
    } else {
      router.push('/profile');
    }
  };

  if (user) {
    return (
      <div className="flex items-center space-x-3">
        <span className="text-white text-sm hidden md:block font-medium">
          مرحباً، {user.name}
        </span>
        <button
          onClick={handleProfileClick}
          className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          title={user.role === 'ADMIN' ? 'لوحة الإدارة' : user.role === 'SHOP_OWNER' || user.role === 'SELLER' ? 'لوحة التحكم' : 'الملف الشخصي'}
        >
          <User className="h-5 w-5" />
        </button>
        
        <PermissionGuard adminOnly fallback={null}>
          <Link 
            href="/admin" 
            className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-md transition-colors"
          >
            الإدارة
          </Link>
        </PermissionGuard>

        <PermissionGuard role={['SHOP_OWNER', 'SELLER']} fallback={null}>
          <Link 
            href="/admin/enhanced" 
            className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-md transition-colors"
          >
            لوحة التحكم
          </Link>
        </PermissionGuard>

        <button
          onClick={handleLogout}
          className="flex items-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
          title="تسجيل الخروج"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    );
  }

  return (
    <Link href="/auth" className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
      <User className="h-5 w-5 ml-2" />
      تسجيل الدخول
    </Link>
  );
}