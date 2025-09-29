'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Car } from 'lucide-react'
import ProductCard from './ProductCard'

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

export default function ProductsList() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }



  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">جاري تحميل المنتجات...</p>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h4 className="text-xl font-bold text-gray-600 mb-2">لا توجد منتجات حالياً</h4>
        <p className="text-gray-500 mb-6">كن أول من يضيف منتج للبيع</p>
        <Link href="/profile" className="inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
          أضف منتجك الآن
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}