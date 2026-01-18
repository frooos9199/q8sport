'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthWrapper from '@/components/AuthWrapper'
import { formatDateShort } from '@/utils/dateUtils'
import { useAuth } from '@/contexts/AuthContext'

interface Product {
  id: string
  title: string
  description: string
  price: number
  condition: string
  category: string
  productType: 'CAR' | 'PART'
  carBrand?: string
  carModel?: string
  carYear?: number
  kilometers?: number
  color?: string
  images: string
  status: 'ACTIVE' | 'SOLD' | 'INACTIVE'
  views: number
  createdAt: string
  soldPrice?: number
  soldDate?: string
}

interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: string
}

export default function UserProductsPage() {
  const params = useParams()
  const router = useRouter()
  const { token } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    if (params.id) {
      loadUserAndProducts(params.id as string)
    }
  }, [params.id])

  const loadUserAndProducts = async (userId: string) => {
    try {
      setLoading(true)
      setLoadError(null)

      if (!token) {
        setUser(null)
        setProducts([])
        setLoadError('الرجاء تسجيل الدخول مرة أخرى')
        return
      }

      const res = await fetch(`/api/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data?.error || 'فشل تحميل بيانات المستخدم')
      }

      setUser({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone || undefined,
        role: data.user.role
      })

      setProducts(data.products || [])
    } catch (error) {
      console.error('خطأ في تحميل البيانات:', error)
      setUser(null)
      setProducts([])
      setLoadError(error instanceof Error ? error.message : 'فشل تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setShowEditModal(true)
  }

  const handleSaveProduct = async () => {
    if (!editingProduct) return

    try {
      if (!token) {
        alert('غير مصرح')
        return
      }

      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: editingProduct.title,
          description: editingProduct.description,
          price: editingProduct.price,
          productType: editingProduct.productType,
          category: editingProduct.category,
          carBrand: editingProduct.carBrand,
          carModel: editingProduct.carModel,
          carYear: editingProduct.carYear,
          condition: editingProduct.condition,
          status: editingProduct.status,
          images: editingProduct.images
        })
      })

      const data = await res.json()
      if (!res.ok || data?.success === false) {
        throw new Error(data?.error || 'حدث خطأ في تحديث المنتج')
      }

      setProducts(prev => prev.map(p => (p.id === editingProduct.id ? { ...p, ...editingProduct } : p)))
      setShowEditModal(false)
      setEditingProduct(null)
      alert('تم تحديث المنتج بنجاح')
    } catch (error) {
      console.error('خطأ في تحديث المنتج:', error)
      alert(error instanceof Error ? error.message : 'حدث خطأ في تحديث المنتج')
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return

    try {
      if (!token) {
        alert('غير مصرح')
        return
      }

      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await res.json()
      if (!res.ok || data?.success === false) {
        throw new Error(data?.error || 'حدث خطأ في حذف المنتج')
      }

      setProducts(prev => prev.filter(p => p.id !== productId))
      alert('تم حذف المنتج بنجاح')
    } catch (error) {
      console.error('خطأ في حذف المنتج:', error)
      alert(error instanceof Error ? error.message : 'حدث خطأ في حذف المنتج')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'SOLD': return 'bg-blue-100 text-blue-800'
      case 'INACTIVE': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'نشط'
      case 'SOLD': return 'مباع'
      case 'INACTIVE': return 'غير نشط'
      default: return 'غير معروف'
    }
  }

  if (loading) {
    return (
      <AuthWrapper requireAuth={true} requireAdmin={true}>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-800">جاري تحميل المنتجات...</p>
          </div>
        </div>
      </AuthWrapper>
    )
  }

  if (!user) {
    return (
      <AuthWrapper requireAuth={true} requireAdmin={true}>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center max-w-md">
            <p className="text-gray-900 font-semibold mb-2">تعذر تحميل بيانات المستخدم</p>
            <p className="text-gray-600 mb-4">{loadError || 'المستخدم غير موجود'}</p>
            <Link href="/admin/users" className="inline-flex items-center px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
              العودة لقائمة المستخدمين
            </Link>
          </div>
        </div>
      </AuthWrapper>
    )
  }

  return (
    <AuthWrapper requireAuth={true} requireAdmin={true}>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white shadow-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <Link href="/admin/users" className="flex items-center text-white/80 hover:text-white ml-4 transition-colors">
                  ← العودة لإدارة المستخدمين
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-white">منتجات المستخدم</h1>
                  {user && (
                    <p className="text-white/80 mt-1">{user.name} - {user.email}</p>
                  )}
                </div>
              </div>
              <div className="text-white/80">
                {products.length} منتج
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  📦
                </div>
                <div className="mr-4">
                  <p className="text-sm text-gray-600">إجمالي المنتجات</p>
                  <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  ✅
                </div>
                <div className="mr-4">
                  <p className="text-sm text-gray-600">منتجات نشطة</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {products.filter(p => p.status === 'ACTIVE').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  💰
                </div>
                <div className="mr-4">
                  <p className="text-sm text-gray-600">منتجات مباعة</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {products.filter(p => p.status === 'SOLD').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                  👁️
                </div>
                <div className="mr-4">
                  <p className="text-sm text-gray-600">إجمالي المشاهدات</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {products.reduce((sum, p) => sum + p.views, 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* قائمة المنتجات */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">جميع المنتجات</h2>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📦</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد منتجات</h3>
                <p className="text-gray-600">هذا المستخدم لم يضف أي منتجات بعد</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المنتج</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">النوع</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">السعر</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المشاهدات</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تاريخ الإضافة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center ml-3">
                              {product.productType === 'CAR' ? '🚗' : '🔧'}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{product.title}</p>
                              <p className="text-sm text-gray-500 line-clamp-1">{product.description}</p>
                              {product.productType === 'CAR' && (
                                <p className="text-xs text-gray-400">
                                  {product.carBrand} {product.carModel} {product.carYear}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            product.productType === 'CAR' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {product.productType === 'CAR' ? 'سيارة' : 'قطعة غيار'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 font-medium">
                            {product.price.toLocaleString()} د.ك
                          </div>
                          {product.soldPrice && (
                            <div className="text-xs text-green-600">
                              بيع بـ {product.soldPrice.toLocaleString()} د.ك
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                            {getStatusText(product.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {product.views}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDateShort(product.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="text-blue-600 hover:text-blue-900 text-lg cursor-pointer"
                              title="تعديل المنتج"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600 hover:text-red-900 text-lg cursor-pointer"
                              title="حذف المنتج"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modal تعديل المنتج */}
        {showEditModal && editingProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">تعديل المنتج</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
                  <input
                    type="text"
                    value={editingProduct.title}
                    onChange={(e) => setEditingProduct(prev => prev ? {...prev, title: e.target.value} : null)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                  <textarea
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct(prev => prev ? {...prev, description: e.target.value} : null)}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">السعر</label>
                    <input
                      type="number"
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct(prev => prev ? {...prev, price: parseFloat(e.target.value)} : null)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
                    <select
                      value={editingProduct.status}
                      onChange={(e) => setEditingProduct(prev => prev ? {...prev, status: e.target.value as any} : null)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="ACTIVE">نشط</option>
                      <option value="INACTIVE">غير نشط</option>
                      <option value="SOLD">مباع</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleSaveProduct}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    💾 حفظ التغييرات
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthWrapper>
  )
}