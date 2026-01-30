'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Showcase {
  id: string;
  carBrand: string;
  carModel: string;
  carYear: number;
  horsepower?: number;
  description: string;
  images: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  user: {
    name: string;
    email: string;
  };
  createdAt: string;
}

export default function AdminShowcasesPage() {
  const router = useRouter();
  const [showcases, setShowcases] = useState<Showcase[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

  useEffect(() => {
    fetchShowcases();
  }, []);

  const fetchShowcases = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/showcases', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setShowcases(data.showcases || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'approve' | 'reject' | 'delete') => {
    try {
      const token = localStorage.getItem('token');
      
      if (action === 'delete') {
        if (!confirm('هل أنت متأكد من حذف هذا العرض؟')) return;
        
        const response = await fetch(`/api/showcases/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          setShowcases(showcases.filter(s => s.id !== id));
          alert('تم الحذف بنجاح');
        }
      } else {
        const status = action === 'approve' ? 'APPROVED' : 'REJECTED';
        const response = await fetch(`/api/showcases/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ status })
        });
        
        if (response.ok) {
          setShowcases(showcases.map(s => 
            s.id === id ? { ...s, status } : s
          ));
          alert(action === 'approve' ? 'تمت الموافقة' : 'تم الرفض');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('حدث خطأ');
    }
  };

  const getImageUrl = (images: string) => {
    try {
      const imageArray = JSON.parse(images);
      return imageArray[0] || '/placeholder-car.jpg';
    } catch {
      return '/placeholder-car.jpg';
    }
  };

  const filteredShowcases = filter === 'ALL' 
    ? showcases 
    : showcases.filter(s => s.status === filter);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">إدارة Car Show</h1>
          <button
            onClick={() => router.push('/admin')}
            className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700"
          >
            ← العودة
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded ${
                filter === status 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {status === 'ALL' ? 'الكل' : 
               status === 'PENDING' ? 'قيد المراجعة' :
               status === 'APPROVED' ? 'معتمد' : 'مرفوض'}
              <span className="ml-2">
                ({status === 'ALL' ? showcases.length : showcases.filter(s => s.status === status).length})
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          </div>
        ) : filteredShowcases.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            لا توجد عروض
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredShowcases.map((showcase) => (
              <div
                key={showcase.id}
                className="bg-gray-900 rounded-lg p-6 border border-gray-800"
              >
                <div className="flex gap-6">
                  <div className="relative w-48 h-48 flex-shrink-0">
                    <Image
                      src={getImageUrl(showcase.images)}
                      alt={`${showcase.carBrand} ${showcase.carModel}`}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold mb-2">
                          {showcase.carBrand} {showcase.carModel} ({showcase.carYear})
                        </h3>
                        {showcase.horsepower && (
                          <p className="text-red-600 font-bold">⚡ {showcase.horsepower} HP</p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded text-sm ${
                        showcase.status === 'PENDING' ? 'bg-yellow-600' :
                        showcase.status === 'APPROVED' ? 'bg-green-600' :
                        'bg-red-600'
                      }`}>
                        {showcase.status === 'PENDING' ? 'قيد المراجعة' :
                         showcase.status === 'APPROVED' ? 'معتمد' : 'مرفوض'}
                      </span>
                    </div>

                    <p className="text-gray-400 mb-4">{showcase.description}</p>

                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                      <span>👤 {showcase.user.name}</span>
                      <span>📧 {showcase.user.email}</span>
                      <span>📅 {new Date(showcase.createdAt).toLocaleDateString('ar')}</span>
                    </div>

                    <div className="flex gap-3">
                      {showcase.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleAction(showcase.id, 'approve')}
                            className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
                          >
                            ✓ موافقة
                          </button>
                          <button
                            onClick={() => handleAction(showcase.id, 'reject')}
                            className="px-4 py-2 bg-yellow-600 rounded hover:bg-yellow-700"
                          >
                            ✕ رفض
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleAction(showcase.id, 'delete')}
                        className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
                      >
                        🗑 حذف
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
