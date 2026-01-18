'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AuthWrapper from '@/components/AuthWrapper'
import { useAuth } from '@/contexts/AuthContext'

interface Category {
  id: string
  name: string
  nameArabic: string
  description: string
  active: boolean
}

export default function AdminCategoriesPage() {
  const { token } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [newCategory, setNewCategory] = useState({
    name: '',
    nameArabic: '',
    description: ''
  })

  // Default categories for car parts
  const defaultCategories = [
    { name: 'Engine Parts', nameArabic: 'قطع المحرك', description: 'جميع قطع غيار المحرك' },
    { name: 'Transmission', nameArabic: 'ناقل الحركة', description: 'قطع غيار ناقل الحركة' },
    { name: 'Brakes', nameArabic: 'الفرامل', description: 'أجزاء نظام الفرامل' },
    { name: 'Suspension', nameArabic: 'نظام التعليق', description: 'قطع غيار نظام التعليق' },
    { name: 'Electrical', nameArabic: 'الكهرباء', description: 'القطع الكهربائية' },
    { name: 'Body Parts', nameArabic: 'قطع الهيكل', description: 'أجزاء هيكل السيارة' },
    { name: 'Interior', nameArabic: 'الداخلية', description: 'قطع غيار داخلية' },
    { name: 'Tires & Wheels', nameArabic: 'الإطارات والجنوط', description: 'الإطارات والجنوط' },
    { name: 'Fluids & Oils', nameArabic: 'الزيوت والسوائل', description: 'زيوت وسوائل السيارة' },
    { name: 'Accessories', nameArabic: 'الإكسسوارات', description: 'إكسسوارات السيارة' }
  ]

  useEffect(() => {
    // جلب الكاتيجوري من API
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      
      if (data.success) {
        setCategories(data.categories)
      } else {
        alert('حدث خطأ في جلب البيانات')
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      alert('حدث خطأ في جلب البيانات')
    }
  }

  const handleAddCategory = async () => {
    if (!newCategory.name || !newCategory.nameArabic) {
      alert('يرجى إدخال اسم القسم باللغتين')
      return
    }

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(newCategory)
      })

      const data = await response.json()

      if (data.success) {
        // إضافة القسم الجديد للقائمة المحلية
        setCategories(prev => [...prev, data.category])
        setNewCategory({ name: '', nameArabic: '', description: '' })
        setShowAddForm(false)
        alert('تم إضافة القسم بنجاح!')
      } else {
        alert(data.message || 'حدث خطأ في إضافة القسم')
      }
    } catch (error) {
      console.error('Error adding category:', error)
      alert('حدث خطأ في إضافة القسم')
    }
  }

  const handleEditCategory = (category: Category) => {
    setIsEditMode(true)
    setEditingCategoryId(category.id)
    setNewCategory({
      name: category.name,
      nameArabic: category.nameArabic,
      description: category.description || ''
    })
    setShowAddForm(true)
  }

  const handleUpdateCategory = async () => {
    if (!newCategory.name || !newCategory.nameArabic) {
      alert('يرجى إدخال اسم القسم باللغتين')
      return
    }

    try {
      const response = await fetch(`/api/categories/${editingCategoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(newCategory)
      })

      const data = await response.json()

      if (data.success) {
        // تحديث القسم في القائمة المحلية
        setCategories(prev => prev.map(cat => 
          cat.id === editingCategoryId 
            ? { ...cat, ...newCategory }
            : cat
        ))
        setNewCategory({ name: '', nameArabic: '', description: '' })
        setShowAddForm(false)
        setIsEditMode(false)
        setEditingCategoryId(null)
        alert('تم تحديث القسم بنجاح!')
      } else {
        alert(data.message || 'حدث خطأ في تحديث القسم')
      }
    } catch (error) {
      console.error('Error updating category:', error)
      alert('حدث خطأ في تحديث القسم')
    }
  }

  const handleCancelEdit = () => {
    setShowAddForm(false)
    setIsEditMode(false)
    setEditingCategoryId(null)
    setNewCategory({ name: '', nameArabic: '', description: '' })
  }

  const toggleCategoryStatus = (id: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === id ? { ...cat, active: !cat.active } : cat
      )
    )
  }

  const deleteCategory = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا القسم؟')) {
      setCategories(prev => prev.filter(cat => cat.id !== id))
      alert('تم حذف القسم بنجاح!')
    }
  }

  return (
    <AuthWrapper requireAuth={true} requireAdmin={true}>
    <div className="min-h-screen bg-black" dir="rtl">
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-black via-gray-900 to-black border-b-2 border-red-600 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/admin"
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white rounded-lg transition-colors"
            >
              <span>←</span>
              <span>العودة للوحة التحكم</span>
            </Link>
          </div>
          <h1 className="text-3xl font-black text-white mb-2">إدارة أقسام قطع الغيار</h1>
          <p className="text-gray-300 font-semibold">إدارة وتنظيم أقسام المنتجات في الموقع</p>
        </div>

        {/* Add Category Button */}
        <div className="mb-6">
          <button
            onClick={() => {
              if (!showAddForm) {
                setIsEditMode(false)
                setEditingCategoryId(null)
                setNewCategory({ name: '', nameArabic: '', description: '' })
              }
              setShowAddForm(!showAddForm)
            }}
            className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
          >
            {showAddForm ? 'إلغاء' : '➕ إضافة قسم جديد'}
          </button>
        </div>

        {/* Add/Edit Category Form */}
        {showAddForm && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-black text-white mb-4">{isEditMode ? '✏️ تعديل القسم' : 'إضافة قسم جديد'}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  اسم القسم بالإنجليزية *
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-black border border-gray-700 text-white rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Engine Parts"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  اسم القسم بالعربية *
                </label>
                <input
                  type="text"
                  value={newCategory.nameArabic}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, nameArabic: e.target.value }))}
                  className="w-full px-3 py-2 bg-black border border-gray-700 text-white rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="قطع المحرك"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  وصف القسم
                </label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 bg-black border border-gray-700 text-white rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="وصف مختصر للقسم..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={handleCancelEdit}
                className="px-6 py-2 border border-gray-600 rounded-md text-gray-300 font-bold hover:bg-gray-800 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={isEditMode ? handleUpdateCategory : handleAddCategory}
                className="px-6 py-2 bg-red-600 text-white font-bold rounded-md hover:bg-red-700 transition-colors"
              >
                {isEditMode ? '💾 تحديث القسم' : '💾 حفظ القسم'}
              </button>
            </div>
          </div>
        )}

        {/* Categories List */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-xl font-black text-white">أقسام قطع الغيار ({categories.length})</h2>
          </div>

          <div className="p-6">
            {categories.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📁</div>
                <p className="text-gray-400 font-semibold text-lg">لا توجد أقسام متاحة</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <div key={category.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-red-600 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-black text-white">{category.nameArabic}</h3>
                        <p className="text-sm text-gray-400 font-semibold">{category.name}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full font-bold border ${
                        category.active 
                          ? 'bg-green-900/30 text-green-400 border-green-700' 
                          : 'bg-red-900/30 text-red-400 border-red-700'
                      }`}>
                        {category.active ? '✓ نشط' : '✗ غير نشط'}
                      </span>
                    </div>

                    {category.description && (
                      <p className="text-sm text-gray-400 font-medium mb-4">{category.description}</p>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="flex-1 py-2 px-3 text-sm font-bold rounded-md transition-colors bg-blue-900/30 text-blue-400 border border-blue-700 hover:bg-blue-900/50"
                      >
                        ✏️ تعديل
                      </button>
                      <button
                        onClick={() => toggleCategoryStatus(category.id)}
                        className={`flex-1 py-2 px-3 text-sm font-bold rounded-md transition-colors ${
                          category.active
                            ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-700 hover:bg-yellow-900/50'
                            : 'bg-green-900/30 text-green-400 border border-green-700 hover:bg-green-900/50'
                        }`}
                      >
                        {category.active ? '⏸️ إيقاف' : '✓ تفعيل'}
                      </button>
                      <button
                        onClick={() => deleteCategory(category.id)}
                        className="flex-1 py-2 px-3 text-sm font-bold rounded-md bg-red-900/30 text-red-400 border border-red-700 hover:bg-red-900/50 transition-colors"
                      >
                        🗑️ حذف
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-black text-gray-300 mb-2">📊 إجمالي الأقسام</h3>
            <p className="text-3xl font-black text-white">{categories.length}</p>
          </div>
          <div className="bg-gradient-to-br from-green-900/20 to-gray-900 border border-green-700 rounded-lg p-6">
            <h3 className="text-lg font-black text-gray-300 mb-2">✓ الأقسام النشطة</h3>
            <p className="text-3xl font-black text-green-400">{categories.filter(c => c.active).length}</p>
          </div>
          <div className="bg-gradient-to-br from-red-900/20 to-gray-900 border border-red-700 rounded-lg p-6">
            <h3 className="text-lg font-black text-gray-300 mb-2">✗ الأقسام غير النشطة</h3>
            <p className="text-3xl font-black text-red-400">{categories.filter(c => !c.active).length}</p>
          </div>
        </div>
      </div>
    </div>
    </AuthWrapper>
  )
}