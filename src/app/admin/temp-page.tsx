'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthWrapper from '@/components/AuthWrapper';
import { Car, LogOut } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    router.push('/');
  };

  return (
    <AuthWrapper requireAuth={true} requireAdmin={true}>
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <Car className="h-8 w-8 text-blue-600 ml-3" />
                <h1 className="text-2xl font-bold text-gray-900">لوحة الإدارة</h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">مرحباً، الأدمن (summit_kw@hotmail.com)</span>
                <button 
                  onClick={handleLogout}
                  className="flex items-center px-3 py-2 text-gray-700 hover:text-red-600"
                >
                  <LogOut className="h-5 w-5 ml-2" />
                  تسجيل الخروج
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">مرحباً بك في لوحة الإدارة</h2>
            <p className="text-gray-600">تم تسجيل دخولك بنجاح كأدمن. النظام يعمل بشكل صحيح!</p>
          </div>
        </div>
      </div>
    </AuthWrapper>
  );
}