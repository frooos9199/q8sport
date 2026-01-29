'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Phone, MessageCircle, Eye, Calendar, ArrowRight, Share2 } from 'lucide-react'

interface Product {
  id: string
  title: string
  description: string
  price: number
  condition: string
  productType: 'CAR' | 'PART'
  carBrand?: string
  carModel?: string
  carYear?: number
  kilometers?: number
  color?: string
  transmission?: string
  fuelType?: string
  engineSize?: string
  contactPhone?: string
  contactWhatsapp?: string
  preferredContact?: string
  images: string
  status: string
  views: number
  createdAt: string
  user?: {
    name: string
    phone?: string
  }
}

export default function ProductDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string)
    }
  }, [params.id])

  const fetchProduct = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`)
      if (response.ok) {
        const data = await response.json()
        setProduct(data)
        // تسجيل مشاهدة
        fetch(`/api/products/${id}/view`, { method: 'POST' })
      }
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  const parseImages = (images: string): string[] => {
    try {
      return JSON.parse(images)
    } catch {
      return []
    }
  }

  const parsePreferredContact = (contact?: string): string[] => {
    try {
      return contact ? JSON.parse(contact) : []
    } catch {
      return []
    }
  }

  const getImageUrl = (imageData: string) => {
    // إذا كان الرابط من Cloudinary أو رابط خارجي، أرجعه مباشرة
    if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
      return imageData
    }
    
    // إذا كان base64
    if (imageData.startsWith('data:')) return imageData
    
    // للمسارات المحلية
    if (imageData.startsWith('/')) return imageData
    
    return `/uploads/${imageData}`
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-KW', {
      style: 'currency',
      currency: 'KWD',
      minimumFractionDigits: 0
    }).format(price)
  }

  const shareProduct = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.title,
        text: product?.description,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('تم نسخ الرابط!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          <p className="text-white mt-4">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl">المنتج غير موجود</p>
          <Link href="/" className="text-red-600 hover:text-red-500 mt-4 inline-block">
            العودة للرئيسية
          </Link>
        </div>
      </div>
    )
  }

  const images = parseImages(product.images)
  const preferredMethods = parsePreferredContact(product.preferredContact)

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-gradient-to-r from-black via-gray-900 to-black border-b border-red-600 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/">
              <h1 className="text-3xl font-bold text-white cursor-pointer">
                Q8 <span className="text-red-600">Motors</span>
              </h1>
            </Link>
            <div className="flex gap-4">
              <button
                onClick={shareProduct}
                className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center"
              >
                <Share2 className="h-4 w-4 ml-2" />
                مشاركة
              </button>
              <Link href="/" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center">
                <ArrowRight className="h-4 w-4 ml-2" />
                العودة
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* معرض الصور */}
          <div className="space-y-4">
            <div className="relative h-96 bg-gray-900 rounded-lg overflow-hidden">
              {images.length > 0 ? (
                <>
                  <Image
                    src={getImageUrl(images[currentImageIndex])}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                  
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      
                      <button
                        onClick={() => setCurrentImageIndex((prev) => (prev + 1) % images.length)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}
                  
                  <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 text-white px-3 py-1 rounded flex items-center">
                    <Eye className="h-4 w-4 ml-2" />
                    {product.views} مشاهدة
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-400">لا توجد صورة</span>
                </div>
              )}
            </div>
            
            {/* صور مصغرة */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex ? 'border-red-600' : 'border-gray-700 hover:border-gray-500'
                    }`}
                  >
                    <Image
                      src={getImageUrl(image)}
                      alt={`صورة ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* تفاصيل المنتج */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {product.productType === 'CAR' ? 'سيارة' : 'قطعة غيار'}
                </span>
                <span className="bg-green-600 text-white px-3 py-1 rounded text-sm font-semibold">
                  {product.condition}
                </span>
              </div>
              
              <h1 className="text-3xl font-bold text-white mb-4">{product.title}</h1>
              
              <div className="flex items-center justify-between mb-6">
                <span className="text-4xl font-bold text-red-600">
                  {formatPrice(product.price)}
                </span>
                <div className="flex items-center text-gray-400">
                  <Calendar className="h-4 w-4 ml-2" />
                  {new Date(product.createdAt).toLocaleDateString('ar-KW')}
                </div>
              </div>
            </div>

            {/* معلومات السيارة */}
            {product.productType === 'CAR' && (
              <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
                <h3 className="text-white font-bold text-lg mb-4">مواصفات السيارة</h3>
                <div className="grid grid-cols-2 gap-4">
                  {product.carBrand && (
                    <div className="bg-gray-800 p-3 rounded">
                      <span className="text-gray-400 text-sm">الماركة</span>
                      <p className="text-white font-semibold">{product.carBrand}</p>
                    </div>
                  )}
                  {product.carModel && (
                    <div className="bg-gray-800 p-3 rounded">
                      <span className="text-gray-400 text-sm">الموديل</span>
                      <p className="text-white font-semibold">{product.carModel}</p>
                    </div>
                  )}
                  {product.carYear && (
                    <div className="bg-gray-800 p-3 rounded">
                      <span className="text-gray-400 text-sm">سنة الصنع</span>
                      <p className="text-white font-semibold">{product.carYear}</p>
                    </div>
                  )}
                  {product.kilometers && (
                    <div className="bg-blue-800 p-3 rounded">
                      <span className="text-gray-200 text-sm">الكيلومترات</span>
                      <p className="text-white font-semibold">{product.kilometers.toLocaleString()} كم</p>
                    </div>
                  )}
                  {product.color && (
                    <div className="bg-gray-800 p-3 rounded">
                      <span className="text-gray-400 text-sm">اللون</span>
                      <p className="text-white font-semibold">{product.color}</p>
                    </div>
                  )}
                  {product.transmission && (
                    <div className="bg-gray-800 p-3 rounded">
                      <span className="text-gray-400 text-sm">ناقل الحركة</span>
                      <p className="text-white font-semibold">{product.transmission}</p>
                    </div>
                  )}
                  {product.fuelType && (
                    <div className="bg-gray-800 p-3 rounded">
                      <span className="text-gray-400 text-sm">نوع الوقود</span>
                      <p className="text-white font-semibold">{product.fuelType}</p>
                    </div>
                  )}
                  {product.engineSize && (
                    <div className="bg-gray-800 p-3 rounded">
                      <span className="text-gray-400 text-sm">حجم المحرك</span>
                      <p className="text-white font-semibold">{product.engineSize}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* الوصف */}
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
              <h3 className="text-white font-bold text-lg mb-4">الوصف</h3>
              <p className="text-gray-300 leading-relaxed">{product.description}</p>
            </div>

            {/* معلومات التواصل */}
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
              <h3 className="text-white font-bold text-lg mb-4 flex items-center">
                <Phone className="h-5 w-5 ml-2" />
                معلومات التواصل
              </h3>
              
              {/* معلومات البائع */}
              <div className="mb-4 bg-black p-4 rounded-lg border border-gray-700">
                <p className="text-gray-400 text-sm mb-2">البائع:</p>
                <p className="text-white font-bold text-lg">{product.user?.name || 'غير معروف'}</p>
                {product.user?.phone && (
                  <div className="mt-2 pt-2 border-t border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">رقم البائع:</span>
                      <span className="text-white font-bold" dir="ltr">{product.user.phone}</span>
                    </div>
                  </div>
                )}
              </div>
              
              {product.contactPhone && (
                <div className="mb-4">
                  <div className="bg-black p-4 rounded-lg border border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">رقم الهاتف:</span>
                      <span className="text-white font-bold text-xl" dir="ltr">{product.contactPhone}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {preferredMethods.length > 0 && (
                <div className="mb-4">
                  <p className="text-gray-400 text-sm mb-2">الطرق المفضلة للتواصل:</p>
                  <div className="flex flex-wrap gap-2">
                    {preferredMethods.map((method, index) => (
                      <span key={index} className="bg-gray-800 text-gray-300 px-3 py-1 rounded text-sm">
                        {method === 'phone' && '📞 مكالمة هاتفية'}
                        {method === 'whatsapp_call' && '📱 مكالمة واتساب'}
                        {method === 'whatsapp_message' && '💬 رسالة واتساب'}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* أزرار التواصل */}
              <div className="space-y-3">
                {product.contactPhone && (
                  <a
                    href={`tel:${product.contactPhone}`}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg text-center font-semibold transition-all flex items-center justify-center"
                  >
                    <Phone className="h-5 w-5 ml-2" />
                    مكالمة هاتفية الآن
                  </a>
                )}
                
                {product.contactWhatsapp && (
                  <div className="grid grid-cols-2 gap-3">
                    <a
                      href={`https://wa.me/${product.contactWhatsapp.replace(/[^0-9]/g, '')}?text=مرحباً، أريد الاستفسار عن ${product.title} - السعر: ${formatPrice(product.price)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg text-center font-semibold transition-all flex items-center justify-center"
                    >
                      <MessageCircle className="h-4 w-4 ml-2" />
                      رسالة واتساب
                    </a>
                    <a
                      href={`https://wa.me/${product.contactWhatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-700 hover:bg-green-800 text-white py-3 px-4 rounded-lg text-center font-semibold transition-all flex items-center justify-center"
                    >
                      📱 مكالمة واتساب
                    </a>
                  </div>
                )}
              </div>
              
              {/* مشاركة المنتج عبر واتساب */}
              <div className="mt-4 pt-4 border-t border-gray-800">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`شاهد هذا المنتج في Q8 Motors:\n\n${product.title}\nالسعر: ${formatPrice(product.price)}\n\n${window.location.href}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg text-center font-semibold transition-all flex items-center justify-center"
                >
                  <MessageCircle className="h-5 w-5 ml-2" />
                  مشاركة هذا المنتج عبر واتساب
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}