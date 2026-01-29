'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Showcase {
  id: string;
  carBrand: string;
  carModel: string;
  carYear: number;
  horsepower?: number;
  description: string;
  images: string;
  likes: number;
  views: number;
  user: {
    name: string;
    avatar?: string;
  };
}

export default function ShowcasesPage() {
  const [showcases, setShowcases] = useState<Showcase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShowcases();
  }, []);

  const fetchShowcases = async () => {
    try {
      const response = await fetch('/api/showcases');
      if (response.ok) {
        const data = await response.json();
        setShowcases(data.showcases || []);
      }
    } catch (error) {
      console.error('Error fetching showcases:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (images: string) => {
    try {
      const imageArray = JSON.parse(images);
      const firstImage = imageArray[0] || '/placeholder-car.jpg';
      
      // تحقق من صحة الرابط
      if (!firstImage || firstImage.includes('file:///') || firstImage.includes('var/mobile')) {
        // رابط محلي من الموبايل - استخدم صورة افتراضية
        return 'https://via.placeholder.com/400x300/1a1a1a/DC2626?text=Car+Show';
      }
      
      // إذا كان الرابط من Cloudinary أو رابط خارجي، أرجعه مباشرة
      if (firstImage.startsWith('http://') || firstImage.startsWith('https://')) {
        return firstImage;
      }
      
      // إذا كان base64
      if (firstImage.startsWith('data:image/')) {
        return firstImage;
      }
      
      // للمسارات المحلية
      return firstImage.startsWith('/') ? firstImage : `/uploads/${firstImage}`;
    } catch {
      return 'https://via.placeholder.com/400x300/1a1a1a/DC2626?text=Car+Show';
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-gradient-to-r from-black via-gray-900 to-black border-b-2 border-red-600 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-4xl font-bold text-white">
              أحلى سيارات <span className="text-red-600">الكويت</span>
            </Link>
            <Link href="/" className="text-gray-200 hover:text-white">
              ← الرئيسية
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-gray-900 to-black py-16 border-b-2 border-red-600">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">
            <span className="text-red-600">Car Show</span>
          </h1>
          <p className="text-xl text-gray-300">
            أجمل وأقوى السيارات المعدلة في الكويت
          </p>
        </div>
      </section>

      {/* Showcases Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
              <p className="text-white mt-4">جاري التحميل...</p>
            </div>
          ) : showcases.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-xl">لا توجد عروض حالياً</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {showcases.map((showcase) => (
                <div
                  key={showcase.id}
                  className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-red-600 transition-all duration-300 group"
                >
                  <div className="relative h-64 bg-black">
                    <Image
                      src={getImageUrl(showcase.images)}
                      alt={`${showcase.carBrand} ${showcase.carModel}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {showcase.horsepower && (
                      <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                        ⚡ {showcase.horsepower} HP
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex items-center mb-3">
                      {showcase.user.avatar && (
                        <Image
                          src={showcase.user.avatar}
                          alt={showcase.user.name}
                          width={32}
                          height={32}
                          className="rounded-full border-2 border-red-600 mr-2"
                        />
                      )}
                      <span className="text-gray-400 text-sm">{showcase.user.name}</span>
                    </div>

                    <h3 className="text-white font-bold text-lg mb-2">
                      {showcase.carBrand} {showcase.carModel}
                    </h3>
                    <p className="text-gray-400 text-sm mb-2">{showcase.carYear}</p>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                      {showcase.description}
                    </p>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-red-600">❤️ {showcase.likes}</span>
                      <span className="text-gray-400">👁 {showcase.views}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t-2 border-red-600 py-12 mt-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2026 أحلى سيارات الكويت - جميع الحقوق محفوظة
          </p>
        </div>
      </footer>
    </div>
  );
}
