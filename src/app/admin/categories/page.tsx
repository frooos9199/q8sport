'use client'

import { useState, useEffect } from 'react'

interface Category {
  id: string
  name: string
  nameArabic: string
  description: string
  active: boolean
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
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
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-black text-gray-900 mb-2">إدارة أقسام قطع الغيار</h1>
          <p className="text-gray-900 font-semibold">إدارة وتنظيم أقسام المنتجات في الموقع</p>
        </div>

        {/* Add Category Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {showAddForm ? 'إلغاء' : 'إضافة قسم جديد'}
          </button>
        </div>

        {/* Add Category Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-black text-gray-900 mb-4">إضافة قسم جديد</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  اسم القسم بالإنجليزية *
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                  placeholder="Engine Parts"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  اسم القسم بالعربية *
                </label>
                <input
                  type="text"
                  value={newCategory.nameArabic}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, nameArabic: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                  placeholder="قطع المحرك"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  وصف القسم
                </label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                  placeholder="وصف مختصر للقسم..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-900 font-bold hover:bg-gray-50"
              >
                إلغاء
              </button>
              <button
                onClick={handleAddCategory}
                className="px-6 py-2 bg-green-600 text-white font-bold rounded-md hover:bg-green-700"
              >
                حفظ القسم
              </button>
            </div>
          </div>
        )}

        {/* Categories List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-black text-gray-900">أقسام قطع الغيار ({categories.length})</h2>
          </div>

          <div className="p-6">
            {categories.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-900 font-semibold">لا توجد أقسام متاحة</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-black text-gray-900">{category.nameArabic}</h3>
                        <p className="text-sm text-gray-800 font-semibold">{category.name}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full font-bold ${
                        category.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {category.active ? 'نشط' : 'غير نشط'}
                      </span>
                    </div>

                    {category.description && (
                      <p className="text-sm text-gray-900 font-medium mb-4">{category.description}</p>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleCategoryStatus(category.id)}
                        className={`flex-1 py-2 px-3 text-sm font-bold rounded-md ${
                          category.active
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {category.active ? 'إيقاف' : 'تفعيل'}
                      </button>
                      <button
                        onClick={() => deleteCategory(category.id)}
                        className="flex-1 py-2 px-3 text-sm font-bold rounded-md bg-red-100 text-red-800 hover:bg-red-200"
                      >
                        حذف
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
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-black text-gray-900 mb-2">إجمالي الأقسام</h3>
            <p className="text-3xl font-black text-blue-600">{categories.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-black text-gray-900 mb-2">الأقسام النشطة</h3>
            <p className="text-3xl font-black text-green-600">{categories.filter(c => c.active).length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-black text-gray-900 mb-2">الأقسام غير النشطة</h3>
            <p className="text-3xl font-black text-red-600">{categories.filter(c => !c.active).length}</p>
          </div>
        </div>
      </div>
    </div>
  )
}