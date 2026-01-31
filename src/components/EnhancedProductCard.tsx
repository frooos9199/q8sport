'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Phone, MessageCircle, Eye, Calendar } from 'lucide-react'

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
}

interface EnhancedProductCardProps {
  product: Product
}

export default function EnhancedProductCard({ product }: EnhancedProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showPhone, setShowPhone] = useState(false)
  
  const images = parseImages(product.images)
  const preferredMethods = parsePreferredContact(product.preferredContact)

  function parseImages(images: string): string[] {
    try {
      return JSON.parse(images)
    } catch {
      return []
    }
  }

  function parsePreferredContact(contact?: string): string[] {
    try {
      return contact ? JSON.parse(contact) : []
    } catch {
      return []
    }
  }

  const getImageUrl = (imageData: string) => {
    if (imageData.startsWith('data:')) return imageData
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

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handlePhoneClick = () => {
    setShowPhone(true)
    // تسجيل مشاهدة
    fetch(`/api/products/${product.id}/view`, { method: 'POST' })
  }

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-red-600 transition-all duration-300 group shadow-lg">
      {/* معرض الصور */}
      <div className="relative h-64 bg-black">
        {images.length > 0 ? (
          <>
            <Image
              src={getImageUrl(images[currentImageIndex])}
              alt={product.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            
            {/* أزرار التنقل */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                
                {/* مؤشرات الصور */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <span className="text-gray-400">لا توجد صورة</span>
          </div>
        )}
        
        {/* شارات المعلومات */}
        <div className="absolute top-3 right-3 flex gap-2">
          <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {product.productType === 'CAR' ? 'سيارة' : 'قطعة غيار'}
          </span>
          {product.condition && (
            <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold">
              {product.condition}
            </span>
          )}
        </div>
        
        {/* عدد المشاهدات */}
        <div className="absolute bottom-3 right-3 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs flex items-center">
          <Eye className="h-3 w-3 ml-1" />
          {product.views}
        </div>
        
        {/* عدد الصور */}
        {images.length > 1 && (
          <div className="absolute top-3 left-3 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
            {currentImageIndex + 1} / {images.length}
          </div>
        )}
      </div>
      
      <div className="p-5">
        {/* العنوان */}
        <h3 className="text-white font-bold text-lg mb-3 line-clamp-2">
          {product.title}
        </h3>
        
        {/* معلومات السيارة */}
        {product.productType === 'CAR' && (
          <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
            {product.carBrand && (
              <div className="bg-gray-800 px-3 py-2 rounded">
                <span className="text-gray-400">الماركة:</span>
                <span className="text-white font-semibold mr-2">{product.carBrand}</span>
              </div>
            )}
            {product.carModel && (
              <div className="bg-gray-800 px-3 py-2 rounded">
                <span className="text-gray-400">الموديل:</span>
                <span className="text-white font-semibold mr-2">{product.carModel}</span>
              </div>
            )}
            {product.carYear && (
              <div className="bg-gray-800 px-3 py-2 rounded">
                <span className="text-gray-400">السنة:</span>
                <span className="text-white font-semibold mr-2">{product.carYear}</span>
              </div>
            )}
            {product.kilometers && (
              <div className="bg-blue-800 px-3 py-2 rounded">
                <span className="text-gray-200">الكيلومترات:</span>
                <span className="text-white font-semibold mr-2">{product.kilometers.toLocaleString()}</span>
              </div>
            )}
            {product.color && (
              <div className="bg-gray-800 px-3 py-2 rounded">
                <span className="text-gray-400">اللون:</span>
                <span className="text-white font-semibold mr-2">{product.color}</span>
              </div>
            )}
            {product.transmission && (
              <div className="bg-gray-800 px-3 py-2 rounded">
                <span className="text-gray-400">ناقل الحركة:</span>
                <span className="text-white font-semibold mr-2">{product.transmission}</span>
              </div>
            )}
          </div>
        )}
        
        {/* الوصف */}
        <p className="text-gray-400 text-sm mb-4 line-clamp-3">
          {product.description}
        </p>
        
        {/* معلومات الاتصال */}
        <div className="bg-gray-800 p-4 rounded-lg mb-4 border border-gray-700">
          <h4 className="text-white font-semibold mb-3 flex items-center">
            <Phone className="h-4 w-4 ml-2" />
            معلومات التواصل
          </h4>
          
          {product.contactPhone && (
            <div className="mb-2">
              {showPhone ? (
                <div className="flex items-center justify-between bg-black p-3 rounded">
                  <span className="text-gray-300">رقم الهاتف:</span>
                  <span className="text-white font-bold text-lg">{product.contactPhone}</span>
                </div>
              ) : (
                <button
                  onClick={handlePhoneClick}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded font-semibold transition-all"
                >
                  📞 إظهار رقم الهاتف
                </button>
              )}
            </div>
          )}
          
          {/* طرق التواصل المفضلة */}
          {preferredMethods.length > 0 && (
            <div className="text-xs text-gray-400 mb-2">
              الطرق المفضلة: {preferredMethods.map(method => {
                switch(method) {
                  case 'phone': return 'مكالمة هاتفية'
                  case 'whatsapp_call': return 'مكالمة واتساب'
                  case 'whatsapp_message': return 'رسالة واتساب'
                  default: return method
                }
              }).join(' • ')}
            </div>
          )}
        </div>
        
        {/* السعر والتاريخ */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-2xl font-bold text-red-600">
            {formatPrice(product.price)}
          </span>
          <div className="flex items-center text-xs text-gray-400">
            <Calendar className="h-3 w-3 ml-1" />
            {new Date(product.createdAt).toLocaleDateString('ar-KW')}
          </div>
        </div>
        
        {/* أزرار التواصل */}
        <div className="space-y-2">
          {showPhone && product.contactPhone && (
            <a
              href={`tel:${product.contactPhone}`}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg text-center font-semibold transition-all flex items-center justify-center"
            >
              <Phone className="h-4 w-4 ml-2" />
              مكالمة هاتفية
            </a>
          )}
          
          {product.contactWhatsapp && (
            <div className="grid grid-cols-2 gap-2">
              <a
                href={`https://wa.me/${product.contactWhatsapp.replace(/[^0-9]/g, '')}?text=مرحباً، أريد الاستفسار عن ${product.title}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-center font-semibold transition-all text-sm flex items-center justify-center"
              >
                <MessageCircle className="h-4 w-4 ml-1" />
                رسالة
              </a>
              <a
                href={`https://wa.me/${product.contactWhatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-700 hover:bg-green-800 text-white py-2 px-3 rounded-lg text-center font-semibold transition-all text-sm flex items-center justify-center"
              >
                📱 مكالمة
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}