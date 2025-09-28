'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, LogOut } from 'lucide-react';

export default function UserActions() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const adminStatus = localStorage.getItem('isAdmin') === 'true';
        const email = localStorage.getItem('userEmail') || '';
        
        setIsLoggedIn(loggedIn);
        setIsAdmin(adminStatus);
        setUserEmail(email);
      }
    };

    checkAuth();
    
    // Listen for storage changes
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    
    setIsLoggedIn(false);
    setIsAdmin(false);
    setUserEmail('');
    
    router.push('/');
  };

  const handleProfileClick = () => {
    if (isAdmin) {
      router.push('/admin');
    } else {
      router.push('/profile');
    }
  };

  if (isLoggedIn) {
    return (
      <div className="flex items-center space-x-3">
        <span className="text-gray-700 text-sm hidden md:block">
          مرحباً، {isAdmin ? 'الأدمن' : userEmail.split('@')[0]}
        </span>
        <button
          onClick={handleProfileClick}
          className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          title={isAdmin ? 'لوحة الإدارة' : 'الملف الشخصي'}
        >
          <User className="h-5 w-5" />
        </button>
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