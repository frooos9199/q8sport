'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Users, 
  Settings, 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Store,
  UserCheck,
  Shield,
  Crown,
  User
} from 'lucide-react'

interface UserData {
  id: string
  name: string
  email: string
  role: 'USER' | 'SELLER' | 'SHOP_OWNER' | 'ADMIN'
  permissions: {
    canManageProducts: boolean
    canManageUsers: boolean
    canViewReports: boolean
    canManageOrders: boolean
    canManageShop: boolean
  }
}

export default function RoleBasedAdminPanel() {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // محاكاة جلب بيانات المستخدم
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
    setLoading(false)
  }, [])

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN': return <Crown className="h-5 w-5" />
      case 'SHOP_OWNER': return <Store className="h-5 w-5" />
      case 'SELLER': return <UserCheck className="h-5 w-5" />
      default: return <User className="h-5 w-5" />
    }
  }

  const getRoleName = (role: string) => {
    const roleNames = {
      'ADMIN': 'إدمن',
      'SHOP_OWNER': 'صاحب محل',
      'SELLER': 'بائع',
      'USER': 'مستخدم'
    }
    return roleNames[role as keyof typeof roleNames] || role
  }

  const getRoleColor = (role: string) => {
    const roleColors = {
      'ADMIN': 'bg-red-100 text-red-800',
      'SHOP_OWNER': 'bg-purple-100 text-purple-800',
      'SELLER': 'bg-blue-100 text-blue-800',
      'USER': 'bg-gray-100 text-gray-800'
    }
    return roleColors[role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">غير مصرح بالدخول</h1>
          <Link href="/auth" className="text-blue-600 hover:text-blue-800">
            تسجيل الدخول
          </Link>
        </div>
      </div>
    )
  }

  const canAccessAdmin = user.role === 'ADMIN' || 
                         user.role === 'SHOP_OWNER' || 
                         user.permissions.canManageUsers ||
                         user.permissions.canViewReports

  if (!canAccessAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">ليس لديك صلاحية للوصول</h1>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            العودة للرئيسية
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                <div className="flex items-center gap-1">
                  {getRoleIcon(user.role)}
                  {getRoleName(user.role)}
                </div>
              </div>
              <div className="text-sm text-gray-600">
                مرحباً، {user.name}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          
          {/* إدارة المنتجات */}
          {user.permissions.canManageProducts && (
            <Link href="/admin/products">
              <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Package className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="mr-3 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          إدارة المنتجات
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          المنتجات والمخزون
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* إدارة المستخدمين */}
          {user.permissions.canManageUsers && (
            <Link href="/admin/users">
              <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="mr-3 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          إدارة المستخدمين
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          البائعين والعملاء
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* عرض التقارير */}
          {user.permissions.canViewReports && (
            <Link href="/admin/reports">
              <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <BarChart3 className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="mr-3 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          التقارير والإحصائيات
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          المبيعات والأرباح
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* إدارة الطلبات */}
          {user.permissions.canManageOrders && (
            <Link href="/admin/orders">
              <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ShoppingCart className="h-8 w-8 text-orange-600" />
                    </div>
                    <div className="mr-3 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          إدارة الطلبات
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          متابعة المبيعات
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* إدارة المحل */}
          {user.permissions.canManageShop && (
            <Link href="/admin/shop">
              <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Store className="h-8 w-8 text-indigo-600" />
                    </div>
                    <div className="mr-3 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          إدارة المحل
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          معلومات المحل
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* الإعدادات العامة */}
          <Link href="/admin/settings">
            <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Settings className="h-8 w-8 text-gray-600" />
                  </div>
                  <div className="mr-3 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        الإعدادات
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        الإعدادات الشخصية
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* الإعلانات (للإدمن فقط) */}
          {user.role === 'ADMIN' && (
            <Link href="/admin/advertisements">
              <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Shield className="h-8 w-8 text-red-600" />
                    </div>
                    <div className="mr-3 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          إدارة الإعلانات
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          الإعلانات والترويج
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          )}

        </div>

        {/* الصلاحيات الحالية */}
        <div className="mt-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">الصلاحيات الحالية</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className={`text-center p-3 rounded-lg ${user.permissions.canManageProducts ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                  <Package className="h-6 w-6 mx-auto mb-1" />
                  <div className="text-sm font-medium">إدارة المنتجات</div>
                </div>
                <div className={`text-center p-3 rounded-lg ${user.permissions.canManageUsers ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                  <Users className="h-6 w-6 mx-auto mb-1" />
                  <div className="text-sm font-medium">إدارة المستخدمين</div>
                </div>
                <div className={`text-center p-3 rounded-lg ${user.permissions.canViewReports ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                  <BarChart3 className="h-6 w-6 mx-auto mb-1" />
                  <div className="text-sm font-medium">عرض التقارير</div>
                </div>
                <div className={`text-center p-3 rounded-lg ${user.permissions.canManageOrders ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                  <ShoppingCart className="h-6 w-6 mx-auto mb-1" />
                  <div className="text-sm font-medium">إدارة الطلبات</div>
                </div>
                <div className={`text-center p-3 rounded-lg ${user.permissions.canManageShop ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                  <Store className="h-6 w-6 mx-auto mb-1" />
                  <div className="text-sm font-medium">إدارة المحل</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}