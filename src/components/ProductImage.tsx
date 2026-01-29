import { useState } from 'react'
import { Car } from 'lucide-react'

interface ProductImageProps {
  images: string[]
  title: string
  className?: string
  onImageClick?: () => void
  showNavigation?: boolean
}

export function parseImages(imagesString: string | string[]): string[] {
  // إذا كانت array بالفعل، أرجعها
  if (Array.isArray(imagesString)) {
    return imagesString
  }

  try {
    if (typeof imagesString === 'string' && imagesString.trim()) {
      // إذا كانت البيانات JSON، قم بتحليلها
      if (imagesString.startsWith('[') || imagesString.startsWith('{')) {
        return JSON.parse(imagesString)
      }
      // إذا كانت string واحد، ضعها في array
      return [imagesString]
    }
    return []
  } catch (error) {
    console.warn('Error parsing images:', error)
    // في حالة فشل التحليل، تحقق إذا كانت string واحد
    if (typeof imagesString === 'string' && imagesString.trim()) {
      return [imagesString]
    }
    return []
  }
}

export function getImageUrl(imagePath: string): string {
  if (!imagePath) return ''
  
  // إذا كان base64 image
  if (imagePath.startsWith('data:image/')) {
    return imagePath
  }
  
  // إذا كان الرابط خارجي (http/https) - مباشرةً من Cloudinary أو أي CDN
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  
  // إذا كان المسار يبدأ بـ uploads/ بالفعل، أرجعه كما هو
  if (imagePath.startsWith('/uploads/')) {
    return imagePath
  }
  
  // تنظيف المسار من التكرار
  const cleanPath = imagePath.replace(/^\/+uploads\/+/, '').replace(/^uploads\/+/, '')
  
  // إضافة مجلد uploads للمسارات المحلية
  return `/uploads/${cleanPath}`
}

export default function ProductImage({ 
  images, 
  title, 
  className = "w-full h-48 object-cover",
  onImageClick,
  showNavigation = false 
}: ProductImageProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageError, setImageError] = useState(false)
  
  const parsedImages = parseImages(images)

  const handleImageError = (imagePath: string) => {
    console.log('Image failed to load:', imagePath)
    setImageError(true)
  }

  if (parsedImages.length === 0 || imageError) {
    return (
      <div 
        className={`${className} bg-gray-200 flex items-center justify-center cursor-pointer`}
        onClick={onImageClick}
      >
        <Car className="h-12 w-12 text-gray-400" />
      </div>
    )
  }

  return (
    <div className="relative">
      <img 
        src={getImageUrl(parsedImages[currentImageIndex])} 
        alt={title}
        className={`${className} cursor-pointer`}
        onClick={onImageClick}
        onError={() => handleImageError(parsedImages[currentImageIndex])}
      />
      
      {/* إذا كان هناك أكثر من صورة وتم تفعيل التنقل */}
      {showNavigation && parsedImages.length > 1 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
          {parsedImages.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation()
                setCurrentImageIndex(index)
              }}
              className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
              title={`صورة ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}