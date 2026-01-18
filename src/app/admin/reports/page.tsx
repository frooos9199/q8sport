"use client";

import Link from "next/link";
import AuthWrapper from "@/components/AuthWrapper";
import { BarChart3 } from "lucide-react";

export default function AdminReports() {
  return (
    <AuthWrapper requireAuth requireAdmin>
      <div className="min-h-screen bg-black">
        <header className="bg-gradient-to-r from-black via-gray-900 to-black border-b border-red-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center">
                <Link
                  href="/admin"
                  className="text-gray-400 hover:text-white ml-4 transition-colors"
                >
                  العودة للوحة الإدارة
                </Link>
                <BarChart3 className="h-8 w-8 text-red-600 ml-3" />
                <div>
                  <h1 className="text-2xl font-bold text-white">التقارير والإحصائيات</h1>
                  <p className="text-gray-400">Reports</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-bold text-white mb-2">قيد التطوير</h2>
            <p className="text-gray-300 mb-6">
              قبل الإطلاق تم إزالة بيانات التقارير التجريبية. سيتم ربط هذه الصفحة بتقارير حقيقية من قاعدة البيانات لاحقًا.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/admin"
                className="bg-black border border-gray-800 rounded-lg p-4 text-white hover:border-red-600 transition"
              >
                لوحة الإدارة
              </Link>
              <Link
                href="/admin/users"
                className="bg-black border border-gray-800 rounded-lg p-4 text-white hover:border-red-600 transition"
              >
                إدارة المستخدمين
              </Link>
              <Link
                href="/admin/advertisements"
                className="bg-black border border-gray-800 rounded-lg p-4 text-white hover:border-red-600 transition"
              >
                إدارة الإعلانات
              </Link>
            </div>
          </div>
        </main>
      </div>
    </AuthWrapper>
  );
}