'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Car, Eye, Heart, ChevronLeft, ChevronRight } from 'lucide-react'
import { parseImages, getImageUrl } from './ProductImage'
import { formatDateLong } from '@/utils/dateUtils'

interface Product {
  id: string
  title: string
  description: string
  price: number
  condition: string
  category: string
  images: string
  status: string
  views: number
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    avatar?: string
    rating: number
  }
}

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [autoSlide, setAutoSlide] = useState(false)
  
  const images = parseImages(product.images)
  const sellerInitials = getSellerInitials(product.user.name)
  const sellerColor = getSellerColor(product.user.rating || 0)
  const bgColor = getBgColor(product.user.rating || 0)

  // التبديل التلقائي للصور عند hover
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (autoSlide && images.length > 1) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length)
      }, 1500)
    }
    return () => clearInterval(interval)
  }, [autoSlide, images.length])



  function getSellerInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  }

  function getSellerColor(rating: number) {
    if (rating >= 4.5) return 'text-green-600'
    if (rating >= 3.5) return 'text-yellow-600'
    return 'text-gray-600'
  }

  function getBgColor(rating: number) {
    if (rating >= 4.5) return 'bg-green-500'
    if (rating >= 3.5) return 'bg-yellow-500'
    return 'bg-gray-500'
  }

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleImageClick = () => {
    // الانتقال لصفحة تفاصيل المنتج
    window.location.href = `/products/${product.id}`
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Product Image with Navigation */}
      <div 
        className="relative h-48 bg-gray-100 group"
        onMouseEnter={() => setAutoSlide(true)}
        onMouseLeave={() => {
          setAutoSlide(false)
          setCurrentImageIndex(0)
        }}
      >
        {images.length > 0 ? (
          <>
            <img 
              src={getImageUrl(images[currentImageIndex])} 
              alt={product.title}
              className="w-full h-full object-cover cursor-pointer"
              onClick={handleImageClick}
              onError={(e) => {
                // في حالة فشل تحميل الصورة، عرض أيقونة افتراضية
                console.log('Image failed to load:', images[currentImageIndex]);
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden w-full h-full flex items-center justify-center bg-gray-200 cursor-pointer" onClick={handleImageClick}>
              <Car className="h-12 w-12 text-gray-400" />
            </div>
            
            {/* Image Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  title="الصورة السابقة"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  title="الصورة التالية"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                
                {/* Image Indicators */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setCurrentImageIndex(index)
                      }}
                      title={`صورة ${index + 1}`}
                      className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center bg-gray-200 cursor-pointer"
            onClick={handleImageClick}
          >
            <Car className="h-12 w-12 text-gray-400" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
          {product.condition}
        </div>
        
        {/* Images Count */}
        {images.length > 1 && (
          <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
            {currentImageIndex + 1} / {images.length}
          </div>
        )}
        
        {/* Views */}
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs flex items-center">
          <Eye className="h-3 w-3 ml-1" />
          {product.views}
        </div>
      </div>
      
      <div className="p-4">
        {/* Seller Info */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className={`w-8 h-8 ${bgColor} rounded-full flex items-center justify-center`}>
              <span className="text-white font-bold text-xs">{sellerInitials}</span>
            </div>
            <div className="mr-2">
              <p className="text-xs text-gray-600 font-bold">البائع:</p>
              <p className={`text-xs font-black ${sellerColor}`}>{product.user.name}</p>
            </div>
          </div>
          
          {/* Rating */}
          <div className="text-right">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <span 
                  key={i} 
                  className={`text-xs ${i < Math.floor(product.user.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  ★
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-900 font-bold">({product.user.rating?.toFixed(1) || '0.0'})</p>
          </div>
        </div>
        
        {/* Product Info */}
        <h3 className="font-black text-lg text-gray-900 mb-2 line-clamp-1">{product.title}</h3>
        <p className="text-gray-900 font-semibold text-sm mb-3 line-clamp-2">{product.description}</p>
        
        {/* Category */}
        <p className="text-xs text-gray-900 font-bold mb-3 bg-gray-100 inline-block px-2 py-1 rounded">{product.category}</p>
        
        {/* Price */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-red-600 font-black text-xl">{product.price.toFixed(3)} د.ك</span>
          <span className="text-xs text-gray-900 font-bold">
            {formatDateLong(product.createdAt)}
          </span>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link 
            href={`/products/${product.id}`} 
            className="flex-1 bg-red-600 hover:bg-red-700 text-white text-center px-4 py-2 rounded-lg font-bold transition-colors text-sm"
          >
            عرض التفاصيل
          </Link>
          <Link 
            href={`/users/${product.user.id}`} 
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-bold transition-colors text-sm flex items-center"
          >
            <Eye className="h-4 w-4 ml-1" />
            البائع
          </Link>
        </div>
      </div>
    </div>
  )
}