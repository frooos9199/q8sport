'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import AuthWrapper from '@/components/AuthWrapper'
import Link from 'next/link'
import ProductImage, { parseImages, getImageUrl } from '@/components/ProductImage'
import { PART_CONDITIONS_ARRAY, getConditionColor } from '@/utils/partConditions'
import { formatDateShort, formatDateLong } from '@/utils/dateUtils'

interface UserItem {
  id: string
  title: string
  description: string
  price: string
  condition: string
  category: string
  productType?: 'CAR' | 'PART'
  carBrand?: string
  carModel?: string
  carYear?: string
  kilometers?: string
  color?: string
  images: string[]
  status: 'active' | 'sold' | 'inactive'
  soldDate?: string
  soldPrice?: string
  buyerInfo?: {
    name: string
    phone: string
    email: string
  }
}

interface UserData {
  id: string
  name: string
  email: string
  phone: string
  whatsapp: string
  newPassword?: string
  confirmPassword?: string
}

interface Category {
  id: string
  nameArabic: string
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [showAddItem, setShowAddItem] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [userItems, setUserItems] = useState<UserItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const { user, token } = useAuth()
  
  const [userData, setUserData] = useState<UserData>({
    id: '',
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [newItem, setNewItem] = useState<Partial<UserItem>>({
    title: '',
    description: '',
    price: '',
    condition: 'مستعمل',
    category: 'قطع غيار',
    productType: 'PART',
    carBrand: '',
    carModel: '',
    carYear: '',
    kilometers: '',
    color: '',
    images: []
  })

  // Load user data from AuthContext on component mount
  useEffect(() => {
    const loadUserData = () => {
      if (user) {
        setUserData({
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          whatsapp: user.whatsapp || ''
        })
      }
    }

    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        const data = await response.json()
        
        if (data.success) {
          setCategories(data.categories.map((cat: any) => ({
            id: cat.id,
            nameArabic: cat.nameArabic
          })))
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }

    const fetchUserItems = async () => {
      if (!user?.id) {
        console.log('No user ID found')
        return
      }
      
      console.log('Fetching products for user:', user.id)
      
      try {
        const response = await fetch(`/api/users/${user.id}/products`)
        const data = await response.json()
        
        console.log('API Response:', data)
        
        if (data.success) {
          console.log(`Setting ${data.products?.length || 0} products`)
          setUserItems(data.products || [])
        } else {
          console.log('API returned success: false')
        }
      } catch (error) {
        console.error('Error fetching user items:', error)
      }
    }

    loadUserData()
    fetchCategories()
    fetchUserItems()
  }, [user])



  const handleUserDataChange = (field: keyof UserData, value: string) => {
    setUserData(prev => ({ ...prev, [field]: value }))
  }

  // دالة لتمييز المنتج كمباع
  const markAsSold = async (itemId: string) => {
    // تأكيد من المستخدم
    if (!confirm('هل أنت متأكد من تحديد المنتج كمباع؟')) {
      return
    }

    const buyerName = prompt('اسم المشتري:')
    const buyerPhone = prompt('رقم هاتف المشتري:')
    const soldPrice = prompt('سعر البيع النهائي:')
    
    if (!buyerName || !buyerPhone || !soldPrice) {
      alert('يرجى إدخال جميع البيانات المطلوبة')
      return
    }

    try {
      // تحديث حالة المنتج في قاعدة البيانات
      const response = await fetch(`/api/products/${itemId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'SOLD',
          soldPrice: parseFloat(soldPrice),
          buyerInfo: {
            name: buyerName,
            phone: buyerPhone,
            email: prompt('بريد المشتري الإلكتروني (اختياري):') || ''
          }
        })
      })

      if (response.ok) {
        // تحديث الحالة المحلية
        setUserItems(prev => prev.map(item => 
          item.id === itemId 
            ? { 
                ...item, 
                status: 'sold' as const,
                soldDate: new Date().toISOString(),
                soldPrice,
                buyerInfo: {
                  name: buyerName,
                  phone: buyerPhone,
                  email: prompt('بريد المشتري الإلكتروني (اختياري):') || ''
                }
              }
            : item
        ))
        alert('✅ تم البيع بنجاح!')
      } else {
        alert('حدث خطأ في تحديث حالة المنتج')
      }
    } catch (error) {
      console.error('Error marking as sold:', error)
      alert('حدث خطأ في تحديث حالة المنتج')
    }
  }

  // دالة لحذف المنتج
  const deleteItem = async (itemId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return

    try {
      const response = await fetch(`/api/products/${itemId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setUserItems(prev => prev.filter(item => item.id !== itemId))
        alert('تم حذف المنتج بنجاح!')
      } else {
        alert('حدث خطأ في حذف المنتج')
      }
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('حدث خطأ في حذف المنتج')
    }
  }

  // دالة لتعديل المنتج
  const editItem = (itemId: string) => {
    const item = userItems.find(i => i.id === itemId)
    if (item) {
      setNewItem({
        title: item.title,
        description: item.description,
        price: item.price,
        condition: item.condition,
        category: item.category,
        images: item.images
      })
      setShowAddItem(true)
    }
  }

  // دالة لتوليد الفاتورة
  const generateInvoice = (item: UserItem) => {
    const invoiceData = {
      invoiceNumber: `INV-${Date.now()}`,
      date: formatDateShort(new Date().toISOString()),
      seller: {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        whatsapp: userData.whatsapp
      },
      buyer: item.buyerInfo,
      product: {
        title: item.title,
        description: item.description,
        condition: item.condition,
        category: item.category,
        originalPrice: item.price,
        soldPrice: item.soldPrice || item.price
      },
      soldDate: item.soldDate ? formatDateShort(item.soldDate) : formatDateShort(new Date().toISOString())
    }

    // فتح نافذة الفاتورة
    openInvoiceWindow(invoiceData)
  }

  // دالة لفتح نافذة الفاتورة
  const openInvoiceWindow = (invoiceData: any) => {
    const invoiceHTML = generateInvoiceHTML(invoiceData)
    const newWindow = window.open('', '_blank', 'width=800,height=600')
    if (newWindow) {
      newWindow.document.write(invoiceHTML)
      newWindow.document.close()
    }
  }

  // دالة لتوليد HTML الفاتورة
  const generateInvoiceHTML = (data: any) => {
    return `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>فاتورة بيع - ${data.invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; background: white; }
          .invoice-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .invoice-title { font-size: 28px; font-weight: bold; color: #333; margin-bottom: 10px; }
          .invoice-number { font-size: 16px; color: #666; }
          .section { margin: 20px 0; }
          .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
          .info-row { display: flex; justify-content: space-between; margin: 8px 0; }
          .info-label { font-weight: bold; }
          .product-details { background: #f9f9f9; padding: 15px; border-radius: 5px; }
          .total-section { background: #e8f5e8; padding: 15px; border-radius: 5px; text-align: center; }
          .total-amount { font-size: 24px; font-weight: bold; color: #2d5a2d; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-header">
          <div class="invoice-title">Q8 Sport Car</div>
          <div class="invoice-number">فاتورة رقم: ${data.invoiceNumber}</div>
          <div>تاريخ: ${data.date}</div>
        </div>

        <div class="section">
          <div class="section-title">بيانات البائع</div>
          <div class="info-row"><span class="info-label">الاسم:</span> <span>${data.seller.name}</span></div>
          <div class="info-row"><span class="info-label">البريد الإلكتروني:</span> <span>${data.seller.email}</span></div>
          <div class="info-row"><span class="info-label">الهاتف:</span> <span>${data.seller.phone}</span></div>
          <div class="info-row"><span class="info-label">واتساب:</span> <span>${data.seller.whatsapp}</span></div>
        </div>

        <div class="section">
          <div class="section-title">بيانات المشتري</div>
          <div class="info-row"><span class="info-label">الاسم:</span> <span>${data.buyer?.name || 'غير محدد'}</span></div>
          <div class="info-row"><span class="info-label">الهاتف:</span> <span>${data.buyer?.phone || 'غير محدد'}</span></div>
          ${data.buyer?.email ? `<div class="info-row"><span class="info-label">البريد الإلكتروني:</span> <span>${data.buyer.email}</span></div>` : ''}
        </div>

        <div class="section">
          <div class="section-title">تفاصيل المنتج</div>
          <div class="product-details">
            <div class="info-row"><span class="info-label">اسم المنتج:</span> <span>${data.product.title}</span></div>
            <div class="info-row"><span class="info-label">الوصف:</span> <span>${data.product.description}</span></div>
            <div class="info-row"><span class="info-label">الحالة:</span> <span>${data.product.condition}</span></div>
            <div class="info-row"><span class="info-label">القسم:</span> <span>${data.product.category}</span></div>
            <div class="info-row"><span class="info-label">السعر المعروض:</span> <span>${data.product.originalPrice} د.ك</span></div>
            <div class="info-row"><span class="info-label">تاريخ البيع:</span> <span>${data.soldDate}</span></div>
          </div>
        </div>

        <div class="section">
          <div class="total-section">
            <div>السعر النهائي</div>
            <div class="total-amount">${data.product.soldPrice} دينار كويتي</div>
          </div>
        </div>

        <div class="footer">
          <p>شكراً لك على التعامل مع Q8 Sport Car</p>
          <p>هذه فاتورة رسمية ولها قيمة قانونية</p>
          <button class="no-print" onclick="window.print()" style="padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 20px;">طباعة الفاتورة</button>
        </div>
      </body>
      </html>
    `
  }

  const saveUserData = async () => {
    try {
      // Validate password change if requested
      if (userData.newPassword || userData.confirmPassword) {
        if (!userData.newPassword || !userData.confirmPassword) {
          alert('يرجى إدخال كلمة المرور الجديدة وتأكيدها');
          return;
        }
        
        if (userData.newPassword !== userData.confirmPassword) {
          alert('كلمة المرور الجديدة وتأكيدها غير متطابقين');
          return;
        }
        
        if (userData.newPassword.length < 6) {
          alert('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
          return;
        }
      }

      // Prepare update data
      const updateData: any = {
        name: userData.name,
        phone: userData.phone,
        whatsapp: userData.whatsapp
      };

      // Add password if changing
      if (userData.newPassword) {
        updateData.password = userData.newPassword;
      }

      // Call API to update user data
      const response = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      const result = await response.json();

      if (response.ok) {
        // Update local state
        setUserData(prev => ({
          ...prev,
          newPassword: '',
          confirmPassword: ''
        }));
        
        alert('تم حفظ البيانات بنجاح!');
      } else {
        alert(result.error || 'حدث خطأ في تحديث البيانات');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('خطأ في حفظ البيانات');
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const currentImageCount = Array.isArray(newItem.images) ? newItem.images.length : 0
    const remainingSlots = 8 - currentImageCount

    if (files.length > remainingSlots) {
      alert(`يمكنك رفع ${remainingSlots} صورة إضافية فقط`)
      return
    }

    // رفع الملفات للخادم
    const formData = new FormData()
    const validFiles: File[] = []

    for (let i = 0; i < Math.min(files.length, remainingSlots); i++) {
      const file = files[i]
      
      if (!file.type.startsWith('image/')) {
        alert(`الملف ${file.name} ليس صورة صالحة`)
        continue
      }

      if (file.size > 10 * 1024 * 1024) {
        alert(`حجم الصورة ${file.name} كبير جداً (حد أقصى 10MB)`)
        continue
      }

      validFiles.push(file)
      formData.append('images', file)
    }

    if (validFiles.length === 0) {
      alert('لا توجد ملفات صالحة للرفع')
      return
    }

    try {
      setUploadProgress(10)
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      setUploadProgress(50)
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'خطأ في رفع الصور')
      }

      setUploadProgress(80)
      
      setNewItem(prev => ({
        ...prev,
        images: [...(Array.isArray(prev.images) ? prev.images : []), ...result.files]
      }))

      setUploadProgress(100)
      setTimeout(() => setUploadProgress(0), 1000)
      
    } catch (error) {
      console.error('Error uploading images:', error)
      alert('خطأ في رفع الصور: ' + (error as Error).message)
      setUploadProgress(0)
    }

    if (event.target) {
      event.target.value = ''
    }
  }

  const removeImage = (index: number) => {
    setNewItem(prev => ({
      ...prev,
      images: Array.isArray(prev.images) ? prev.images.filter((_, i) => i !== index) : []
    }))
  }

  const saveItem = async () => {
    const errors: string[] = []
    if (!newItem.title?.trim()) errors.push('عنوان الإعلان مطلوب')
    if (!newItem.description?.trim()) errors.push('وصف الإعلان مطلوب')
    if (!newItem.price?.trim()) errors.push('السعر مطلوب')
    if (!Array.isArray(newItem.images) || newItem.images.length === 0) errors.push('يجب رفع صورة واحدة على الأقل')
    
    if (errors.length > 0) {
      alert('يرجى إكمال البيانات المطلوبة:\n' + errors.join('\n'))
      return
    }

    if (!userData.id) {
      alert('يجب تسجيل الدخول أولاً')
      return
    }

    try {
      setUploadProgress(10)
      const productData = {
        title: newItem.title,
        description: newItem.description,
        price: parseFloat(newItem.price || '0'),
        condition: newItem.condition,
        category: newItem.category,
        productType: newItem.productType || 'PART',
        carBrand: newItem.carBrand,
        carModel: newItem.carModel,
        carYear: newItem.carYear ? parseInt(newItem.carYear) : null,
        kilometers: newItem.kilometers ? parseInt(newItem.kilometers) : null,
        color: newItem.color,
        images: JSON.stringify(newItem.images),
        status: 'ACTIVE',
        userId: userData.id
      }

      setUploadProgress(60)
      
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      })

      setUploadProgress(80)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'فشل في حفظ المنتج')
      }

      const savedProduct = await response.json()

      setUserItems(prev => [...prev, {
        id: savedProduct.id,
        title: savedProduct.title,
        description: savedProduct.description,
        price: savedProduct.price.toString(),
        condition: savedProduct.condition,
        category: savedProduct.category,
        productType: savedProduct.productType,
        carBrand: savedProduct.carBrand,
        carModel: savedProduct.carModel,
        carYear: savedProduct.carYear?.toString(),
        kilometers: savedProduct.kilometers?.toString(),
        color: savedProduct.color,
        images: JSON.parse(savedProduct.images || '[]'),
        status: 'active'
      }])

      // Reset form
      setNewItem({
        title: '',
        description: '',
        price: '',
        condition: 'جديد',
        category: 'قطع غيار',
        productType: 'PART',
        carBrand: '',
        carModel: '',
        carYear: '',
        kilometers: '',
        color: '',
        images: []
      })

      setUploadProgress(100)
      setTimeout(() => {
        setUploadProgress(0)
        setShowAddItem(false)
        alert('تم حفظ المنتج بنجاح! سيظهر في الصفحة الرئيسية.')
      }, 1000)

    } catch (error) {
      console.error('Error saving item:', error)
      alert('خطأ في حفظ المنتج: ' + (error as Error).message)
      setUploadProgress(0)
    }
  }

  return (
    <AuthWrapper requireAuth={true}>
      <div className="min-h-screen bg-black text-right" dir="rtl">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-black text-white mb-2">الملف الشخصي</h1>
              <p className="text-gray-400 font-semibold">إدارة حسابك ومنتجاتك</p>
            </div>
            <div className="flex gap-4">
              <Link 
                href="/" 
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold transition-colors"
              >
                🏠 العودة للموقع
              </Link>
              <Link 
                href="/auctions" 
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 font-bold transition-colors border border-gray-700"
              >
                🔨 تصفح المزادات
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 mb-6">
          <div className="border-b border-gray-800">
            <nav className="flex space-x-8 space-x-reverse">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-3 px-6 text-sm font-black border-b-2 ${
                  activeTab === 'profile'
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-white hover:text-gray-300'
                }`}
              >
                البيانات الشخصية
              </button>
              <button
                onClick={() => setActiveTab('items')}
                className={`py-3 px-6 text-sm font-black border-b-2 ${
                  activeTab === 'items'
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-white hover:text-gray-300'
                }`}
              >
                منتجاتي ({userItems.length})
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={`py-3 px-6 text-sm font-black border-b-2 ${
                  activeTab === 'account'
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-white hover:text-gray-300'
                }`}
              >
                إدارة الحساب
              </button>
            </nav>
          </div>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h2 className="text-xl font-black mb-6 text-white">المعلومات الشخصية</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  الاسم الكامل *
                </label>
                <input
                  type="text"
                  value={userData.name}
                  onChange={(e) => handleUserDataChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-700 bg-black rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 text-white"
                  placeholder="أدخل اسمك الكامل"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  رقم الهاتف *
                </label>
                <input
                  type="tel"
                  value={userData.phone}
                  onChange={(e) => handleUserDataChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-700 bg-black rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 text-white"
                  placeholder="أدخل رقم الهاتف"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  البريد الإلكتروني *
                </label>
                <input
                  type="email"
                  value={userData.email}
                  onChange={(e) => handleUserDataChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-700 bg-black rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 text-white"
                  placeholder="أدخل البريد الإلكتروني"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  رقم الواتساب
                </label>
                <input
                  type="tel"
                  value={userData.whatsapp}
                  onChange={(e) => handleUserDataChange('whatsapp', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-700 bg-black rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 text-white"
                  placeholder="+965 xxxxxxxx"
                />
              </div>
            </div>

            {/* قسم تغيير كلمة المرور */}
            <div className="mt-8 pt-6 border-t border-gray-800">
              <h3 className="text-lg font-black mb-4 text-white">تغيير كلمة المرور</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-white mb-2">
                    كلمة المرور الجديدة
                  </label>
                  <input
                    type="password"
                    value={userData.newPassword || ''}
                    onChange={(e) => handleUserDataChange('newPassword', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-700 bg-black rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 text-white"
                    placeholder="اتركه فارغاً إذا لم ترد تغيير كلمة المرور"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    تأكيد كلمة المرور الجديدة
                  </label>
                  <input
                    type="password"
                    value={userData.confirmPassword || ''}
                    onChange={(e) => handleUserDataChange('confirmPassword', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="أعد إدخال كلمة المرور الجديدة"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button 
                onClick={saveUserData}
                className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                حفظ التغييرات
              </button>
            </div>
          </div>
        )}

        {/* Account Management Tab */}
        {activeTab === 'account' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-black mb-6 text-gray-900">إدارة الحساب والصلاحيات</h2>
            
            {/* Account Info */}
            <div className="mb-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-bold text-blue-900 mb-4">معلومات الحساب</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">نوع العضوية:</span>
                  <span className={`mr-2 px-2 py-1 rounded-full text-xs font-bold ${
                    user?.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                    user?.role === 'SHOP_OWNER' ? 'bg-purple-100 text-purple-800' :
                    user?.role === 'SELLER' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user?.role === 'ADMIN' ? 'مدير' :
                     user?.role === 'SHOP_OWNER' ? 'صاحب محل' :
                     user?.role === 'SELLER' ? 'بائع' : 'مستخدم عادي'}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">تاريخ الانضمام:</span>
                  <span className="mr-2 text-sm text-gray-600">
                    {user ? formatDateLong(new Date().toISOString()) : 'غير محدد'}
                  </span>
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div className="mb-8 p-4 bg-green-50 rounded-lg">
              <h3 className="text-lg font-bold text-green-900 mb-4">الصلاحيات المتاحة</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <span className={`w-3 h-3 rounded-full mr-2 ${
                    user?.permissions?.canManageProducts ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                  <span className="text-sm text-gray-700">إدارة المنتجات</span>
                </div>
                <div className="flex items-center">
                  <span className={`w-3 h-3 rounded-full mr-2 ${
                    user?.permissions?.canManageOrders ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                  <span className="text-sm text-gray-700">إدارة الطلبات</span>
                </div>
                <div className="flex items-center">
                  <span className={`w-3 h-3 rounded-full mr-2 ${
                    user?.permissions?.canManageShop ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                  <span className="text-sm text-gray-700">إدارة المحل</span>
                </div>
                <div className="flex items-center">
                  <span className={`w-3 h-3 rounded-full mr-2 ${
                    user?.permissions?.canViewReports ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                  <span className="text-sm text-gray-700">عرض التقارير</span>
                </div>
              </div>
            </div>

            {/* Upgrade Options */}
            <div className="mb-8 p-4 bg-yellow-50 rounded-lg">
              <h3 className="text-lg font-bold text-yellow-900 mb-4">ترقية العضوية</h3>
              <p className="text-sm text-gray-700 mb-4">
                للحصول على المزيد من الصلاحيات والمميزات، يمكنك ترقية حسابك:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user?.role === 'USER' && (
                  <>
                    <div className="border border-blue-200 rounded-lg p-4">
                      <h4 className="font-bold text-blue-900 mb-2">عضوية البائع</h4>
                      <ul className="text-sm text-gray-700 mb-3">
                        <li>• إدارة المنتجات والمزادات</li>
                        <li>• تتبع المبيعات</li>
                        <li>• إحصائيات مفصلة</li>
                      </ul>
                      <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-bold">
                        طلب ترقية للبائع
                      </button>
                    </div>
                    <div className="border border-purple-200 rounded-lg p-4">
                      <h4 className="font-bold text-purple-900 mb-2">عضوية صاحب المحل</h4>
                      <ul className="text-sm text-gray-700 mb-3">
                        <li>• إدارة شاملة للمحل</li>
                        <li>• لوحة تحكم متقدمة</li>
                        <li>• تقارير مالية</li>
                      </ul>
                      <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 font-bold">
                        طلب ترقية لصاحب محل
                      </button>
                    </div>
                  </>
                )}
                {user?.role === 'SELLER' && (
                  <div className="border border-purple-200 rounded-lg p-4">
                    <h4 className="font-bold text-purple-900 mb-2">ترقية لصاحب المحل</h4>
                    <ul className="text-sm text-gray-700 mb-3">
                      <li>• إدارة شاملة للمحل</li>
                      <li>• لوحة تحكم متقدمة</li>
                      <li>• تقارير مالية</li>
                    </ul>
                    <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 font-bold">
                      طلب ترقية لصاحب محل
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Security Settings */}
            <div className="p-4 bg-red-50 rounded-lg">
              <h3 className="text-lg font-bold text-red-900 mb-4">إعدادات الأمان</h3>
              <div className="space-y-3">
                <button className="w-full md:w-auto bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 font-bold">
                  🔄 تغيير كلمة المرور
                </button>
                <button className="w-full md:w-auto bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-bold mr-0 md:mr-3">
                  🗑️ حذف الحساب
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-3">
                تحذير: حذف الحساب سيؤدي إلى فقدان جميع البيانات والمنتجات نهائياً
              </p>
            </div>
          </div>
        )}

        {/* Items Tab */}
        {activeTab === 'items' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">منتجاتي</h2>
                <button
                  onClick={() => setShowAddItem(!showAddItem)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  {showAddItem ? 'إلغاء' : 'إضافة منتج جديد'}
                </button>
              </div>

              {/* Add Item Form */}
              {showAddItem && (
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-bold mb-4">إضافة منتج جديد</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        عنوان الإعلان *
                      </label>
                      <input
                        type="text"
                        value={newItem.title || ''}
                        onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="أدخل عنوان الإعلان"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        نوع المنتج *
                      </label>
                      <select
                        value={newItem.productType || 'PART'}
                        onChange={(e) => setNewItem(prev => ({ ...prev, productType: e.target.value as 'CAR' | 'PART' }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="PART">قطعة غيار</option>
                        <option value="CAR">سيارة كاملة</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        السعر *
                      </label>
                      <input
                        type="text"
                        value={newItem.price || ''}
                        onChange={(e) => setNewItem(prev => ({ ...prev, price: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="السعر بالدينار الكويتي"
                      />
                    </div>

                    {/* معلومات السيارة */}
                    {newItem.productType === 'CAR' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            الماركة *
                          </label>
                          <select
                            value={newItem.carBrand || ''}
                            onChange={(e) => setNewItem(prev => ({ ...prev, carBrand: e.target.value, carModel: '' }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          >
                            <option value="">اختر الماركة</option>
                            <option value="Ford">Ford</option>
                            <option value="Chevrolet">Chevrolet</option>
                            <option value="Toyota">Toyota</option>
                            <option value="Dodge">Dodge</option>
                            <option value="Nissan">Nissan</option>
                            <option value="BMW">BMW</option>
                            <option value="Mercedes">Mercedes</option>
                            <option value="Porsche">Porsche</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            الموديل *
                          </label>
                          <input
                            type="text"
                            value={newItem.carModel || ''}
                            onChange={(e) => setNewItem(prev => ({ ...prev, carModel: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="مثال: Mustang, Corvette"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            سنة الصنع
                          </label>
                          <input
                            type="number"
                            value={newItem.carYear || ''}
                            onChange={(e) => setNewItem(prev => ({ ...prev, carYear: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="2020"
                            min="1980"
                            max="2026"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            الكيلومترات
                          </label>
                          <input
                            type="number"
                            value={newItem.kilometers || ''}
                            onChange={(e) => setNewItem(prev => ({ ...prev, kilometers: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="50000"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            اللون
                          </label>
                          <input
                            type="text"
                            value={newItem.color || ''}
                            onChange={(e) => setNewItem(prev => ({ ...prev, color: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="أحمر, أزرق, أبيض"
                          />
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الحالة *
                      </label>
                      <select
                        value={newItem.condition || 'مستعمل'}
                        onChange={(e) => setNewItem(prev => ({ ...prev, condition: e.target.value }))}
                        title="اختر حالة المنتج"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        {PART_CONDITIONS_ARRAY.map(condition => (
                          <option key={condition} value={condition}>{condition}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-black mb-2">
                      وصف المنتج *
                    </label>
                    <textarea
                      value={newItem.description || ''}
                      onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black font-medium"
                      placeholder="وصف تفصيلي للمنتج..."
                    />
                  </div>

                  {/* Image Upload */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      صور المنتج * (1-8 صور)
                    </label>
                    
                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                      <label className="flex-1 cursor-pointer">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="mt-2 text-sm text-gray-600">اختر الصور أو اسحبها هنا</p>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF حتى 10MB لكل صورة</p>
                        </div>
                      </label>
                    </div>

                    {/* Upload Progress */}
                    {uploadProgress > 0 && (
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>رفع الصور...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Image Preview Gallery */}
                    {newItem.images && Array.isArray(newItem.images) && newItem.images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {newItem.images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`صورة ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border-2 border-gray-300"
                            />
                            <button
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-gray-500">
                      يمكن رفع {Array.isArray(newItem.images) ? newItem.images.length : 0} من 8 صور
                    </p>
                  </div>

                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => setShowAddItem(false)}
                      className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={saveItem}
                      className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      حفظ المنتج
                    </button>
                  </div>
                </div>
              )}

              {/* Items List */}
              {userItems.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2m-2 0h-4m-4 0H6m16 0a2 2 0 002-2V9a2 2 0 00-2-2h-2M6 7h16" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد منتجات</h3>
                  <p className="mt-1 text-sm text-gray-500">ابدأ بإضافة منتجك الأول</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userItems.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      {/* صورة المنتج مع حالة البيع */}
                      <div className="relative">
                        <ProductImage 
                          images={item.images}
                          title={item.title}
                          className={`w-full h-48 object-cover ${item.status === 'sold' ? 'opacity-50' : ''}`}
                        />
                        
                        {/* شارة "مباع" */}
                        {item.status === 'sold' && (
                          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                            <div className="bg-red-600 text-white px-6 py-3 rounded-lg font-black text-xl transform -rotate-12">
                              مباع
                            </div>
                          </div>
                        )}
                        
                        {/* حالة المنتج */}
                        <div className="absolute top-2 right-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            item.status === 'active' ? 'bg-green-500 text-white' :
                            item.status === 'sold' ? 'bg-red-500 text-white' :
                            'bg-gray-500 text-white'
                          }`}>
                            {item.status === 'active' ? 'نشط' :
                             item.status === 'sold' ? 'مباع' : 'غير نشط'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-black text-lg text-gray-900">{item.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            item.productType === 'CAR' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
                          }`}>
                            {item.productType === 'CAR' ? 'سيارة' : 'قطعة غيار'}
                          </span>
                        </div>
                        
                        {/* معلومات السيارة */}
                        {item.productType === 'CAR' && (
                          <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
                            {item.carBrand && (
                              <span className="bg-gray-100 px-2 py-1 rounded text-gray-800 font-bold">
                                {item.carBrand}
                              </span>
                            )}
                            {item.carModel && (
                              <span className="bg-gray-100 px-2 py-1 rounded text-gray-800 font-bold">
                                {item.carModel}
                              </span>
                            )}
                            {item.carYear && (
                              <span className="bg-blue-100 px-2 py-1 rounded text-blue-800 font-bold">
                                {item.carYear}
                              </span>
                            )}
                            {item.kilometers && (
                              <span className="bg-orange-100 px-2 py-1 rounded text-orange-800 font-bold">
                                {item.kilometers} كم
                              </span>
                            )}
                          </div>
                        )}
                        
                        <p className="text-black font-bold text-sm mb-2 line-clamp-2">{item.description}</p>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-lg font-black text-green-600">{item.price} د.ك</span>
                          <span className="text-sm text-black font-bold">{item.condition}</span>
                        </div>
                        
                        {/* أزرار الإدارة */}
                        <div className="flex gap-2">
                          {item.status === 'active' && (
                            <>
                              <button
                                onClick={() => markAsSold(item.id)}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md font-bold text-sm transition-colors"
                              >
                                تم البيع
                              </button>
                              <button
                                onClick={() => editItem(item.id)}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md font-bold text-sm transition-colors"
                              >
                                تعديل
                              </button>
                            </>
                          )}
                          
                          {item.status === 'sold' && (
                            <button
                              onClick={() => generateInvoice(item)}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md font-bold text-sm transition-colors"
                            >
                              📄 فاتورة
                            </button>
                          )}
                          
                          <button
                            onClick={() => deleteItem(item.id)}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-md font-bold text-sm transition-colors"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
    </AuthWrapper>
  )
}
