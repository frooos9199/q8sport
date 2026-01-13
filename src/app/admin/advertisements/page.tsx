'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AuthWrapper from '@/components/AuthWrapper';
import { addWatermarkToImage, isImageFile } from '@/utils/imageWatermark';
import { 
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Image as ImageIcon,
  Upload,
  X,
  Eye,
  Save,
  AlertCircle
} from 'lucide-react';

interface Advertisement {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  isActive: boolean;
  position: 'header' | 'sidebar' | 'footer' | 'between-listings';
  createdAt: string;
  updatedAt: string;
}

export default function AdvertisementsPage() {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    link: '',
    position: 'header' as Advertisement['position'],
    isActive: true
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);

  // Mock data
  const mockAdvertisements: Advertisement[] = [
    {
      id: '1',
      title: 'إعلان قطع غيار فورد',
      description: 'خصم 25% على جميع قطع غيار فورد الأصلية',
      imageUrl: '/ads/ford-parts.jpg',
      link: 'https://example.com/ford-parts',
      isActive: true,
      position: 'header',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    }
  ];

  useEffect(() => {
    // جلب الإعلانات من قاعدة البيانات
    const fetchAdvertisements = async () => {
      try {
        const response = await fetch('/api/advertisements/admin');
        if (response.ok) {
          const data = await response.json();
          setAdvertisements(data);
        } else {
          console.error('Failed to fetch advertisements');
          // استخدام البيانات الوهمية في حالة الفشل
          setAdvertisements(mockAdvertisements);
        }
      } catch (error) {
        console.error('Error fetching advertisements:', error);
        setAdvertisements(mockAdvertisements);
      } finally {
        setLoading(false);
      }
    };

    fetchAdvertisements();
  }, []);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await processImageFile(file);
    }
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // استخدام الكاميرا الخلفية
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      
      // إنشاء عنصر فيديو لمعاينة الكاميرا
      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      video.playsInline = true;
      
      // إنشاء modal لمعاينة الكاميرا
      const cameraModal = document.createElement('div');
      cameraModal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
      cameraModal.innerHTML = `
        <div class="bg-white rounded-lg p-4 w-full max-w-md mx-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold text-gray-900">التقاط صورة</h3>
            <button id="close-camera" class="text-gray-400 hover:text-gray-600">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div class="relative">
            <video id="camera-video" class="w-full h-64 bg-black rounded object-cover"></video>
            <canvas id="camera-canvas" class="hidden"></canvas>
          </div>
          <div class="flex justify-center space-x-4 mt-4">
            <button id="capture-btn" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center">
              <svg class="h-5 w-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89L8.88 4.88A2 2 0 0110.544 4h2.912a2 2 0 011.664.88l1.286 1.23A2 2 0 0017.07 7H18a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V9z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              التقاط صورة
            </button>
            <button id="switch-camera" class="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
            </button>
          </div>
        </div>
      `;
      
      document.body.appendChild(cameraModal);
      const videoElement = cameraModal.querySelector('#camera-video') as HTMLVideoElement;
      const canvas = cameraModal.querySelector('#camera-canvas') as HTMLCanvasElement;
      const captureBtn = cameraModal.querySelector('#capture-btn') as HTMLButtonElement;
      const closeBtn = cameraModal.querySelector('#close-camera') as HTMLButtonElement;
      const switchBtn = cameraModal.querySelector('#switch-camera') as HTMLButtonElement;
      
      videoElement.srcObject = stream;
      
      let currentFacingMode = 'environment';
      
      // تبديل الكاميرا
      switchBtn.onclick = async () => {
        stream.getTracks().forEach(track => track.stop());
        currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
        
        try {
          const newStream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              facingMode: currentFacingMode,
              width: { ideal: 1920 },
              height: { ideal: 1080 }
            } 
          });
          videoElement.srcObject = newStream;
        } catch (error) {
          console.error('Error switching camera:', error);
        }
      };
      
      // التقاط الصورة
      captureBtn.onclick = () => {
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(videoElement, 0, 0);
        
        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
            await processImageFile(file);
            closeCamera();
          }
        }, 'image/jpeg', 0.9);
      };
      
      // إغلاق الكاميرا
      const closeCamera = () => {
        stream.getTracks().forEach(track => track.stop());
        document.body.removeChild(cameraModal);
      };
      
      closeBtn.onclick = closeCamera;
      cameraModal.onclick = (e) => {
        if (e.target === cameraModal) closeCamera();
      };
      
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('لا يمكن الوصول للكاميرا. يرجى التأكد من السماح بالوصول للكاميرا.');
    }
  };

  const processImageFile = async (file: File) => {
    if (!isImageFile(file)) {
      alert('يرجى اختيار ملف صورة صحيح');
      return;
    }

    try {
      // إضافة العلامة المائية للصورة
      const watermarkedFile = await addWatermarkToImage(file, {
        text: 'Q8 MAZAD SPORT',
        fontSize: Math.min(file.size > 500000 ? 28 : 20, 32), // حجم النص حسب حجم الصورة
        opacity: 0.8,
        position: 'bottom-right',
        color: 'rgba(255, 255, 255, 0.9)',
        enableBackground: true, // تفعيل الخلفية المائية
        backgroundOpacity: 0.06 // شفافية منخفضة للخلفية
      });

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(watermarkedFile);
      simulateImageUpload(watermarkedFile);
    } catch (error) {
      console.error('فشل في إضافة العلامة المائية:', error);
      alert('حدث خطأ في معالجة الصورة');
    }
  };

  const simulateImageUpload = (file: File) => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setFormData(prev => ({
            ...prev,
            imageUrl: `/uploads/ads/${Date.now()}-${file.name}`
          }));
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      link: '',
      position: 'header', // افتراضي: أعلى الصفحة
      isActive: true
    });
    setImagePreview('');
    setUploadProgress(0);
  };

  const handleCreate = async () => {
    try {
      // التحقق من صحة البيانات
      if (!formData.title || !formData.description || !formData.imageUrl) {
        alert('يرجى ملء جميع البيانات المطلوبة: العنوان، الوصف، والصورة');
        return;
      }

      if (formData.description.length < 10) {
        alert('يرجى كتابة وصف أكثر تفصيلاً (10 أحرف على الأقل)');
        return;
      }

      // إرسال البيانات إلى API
      const response = await fetch('/api/advertisements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          imageUrl: formData.imageUrl,
          link: formData.link || null, // إرسال null بدلاً من string فارغ
          active: formData.isActive
        })
      });

      if (response.ok) {
        const newAd = await response.json();
        // تحديث القائمة المحلية
        const newAdvertisement: Advertisement = {
          id: newAd.id,
          title: newAd.title,
          description: newAd.description,
          imageUrl: newAd.imageUrl || '',
          link: newAd.link || '',
          isActive: newAd.active,
          position: formData.position, // استخدام القيمة المختارة
          createdAt: newAd.createdAt,
          updatedAt: newAd.updatedAt || newAd.createdAt
        };
        
        setAdvertisements([newAdvertisement, ...advertisements]);
        setShowCreateModal(false);
        resetForm();
        alert('✅ تم إنشاء وتفعيل الإعلان بنجاح!');
      } else {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        alert(`❌ خطأ في حفظ الإعلان: ${errorData.error || 'خطأ غير معروف'}`);
      }
    } catch (error) {
      console.error('Error creating advertisement:', error);
      alert('❌ حدث خطأ في الاتصال بالخادم. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الإعلان؟')) {
      setAdvertisements(advertisements.filter(ad => ad.id !== id));
    }
  };

  const toggleActive = (id: string) => {
    const updatedAds = advertisements.map(ad => 
      ad.id === id ? { ...ad, isActive: !ad.isActive } : ad
    );
    setAdvertisements(updatedAds);
  };

  const getPositionText = (position: Advertisement['position']) => {
    const positions = {
      'header': '🔝 أعلى الصفحة',
      'sidebar': '↔️ الشريط الجانبي',
      'footer': '⬇️ أسفل الصفحة',
      'between-listings': '📋 بين القوائم'
    };
    return positions[position] || position;
  };

  if (loading) {
    return (
      <AuthWrapper>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-800 font-medium">جاري تحميل الإعلانات...</p>
          </div>
        </div>
      </AuthWrapper>
    );
  }

  return (
    <AuthWrapper>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white shadow-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <Link href="/admin" className="flex items-center text-white/80 hover:text-white ml-4 transition-colors">
                  <ArrowLeft className="h-5 w-5 ml-1" />
                  العودة إلى لوحة التحكم
                </Link>
                <div className="h-6 border-l border-white/30 ml-4"></div>
                <h1 className="text-2xl font-bold text-white">Q8 MAZAD SPORT - إدارة الإعلانات</h1>
              </div>
              
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center transition-colors backdrop-blur-sm"
                title="إضافة إعلان جديد"
              >
                <Plus className="h-5 w-5 ml-2" />
                إضافة إعلان
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <ImageIcon className="h-12 w-12 text-blue-600" />
                <div className="mr-4">
                  <p className="text-sm text-gray-800 font-medium">إجمالي الإعلانات</p>
                  <p className="text-2xl font-bold text-gray-900">{advertisements.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Eye className="h-12 w-12 text-green-600" />
                <div className="mr-4">
                  <p className="text-sm text-gray-800 font-medium">الإعلانات النشطة</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {advertisements.filter(ad => ad.isActive).length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <AlertCircle className="h-12 w-12 text-red-600" />
                <div className="mr-4">
                  <p className="text-sm text-gray-800 font-medium">الإعلانات المعطلة</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {advertisements.filter(ad => !ad.isActive).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Advertisements List */}
          <div className="bg-white shadow rounded-lg">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">قائمة الإعلانات</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-800 uppercase tracking-wider">
                      الإعلان
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-800 uppercase tracking-wider">
                      الموضع
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-800 uppercase tracking-wider">
                      الحالة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-800 uppercase tracking-wider">
                      تاريخ الإنشاء
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-800 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {advertisements.map((ad) => (
                    <tr key={ad.id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-16 w-16 bg-gray-200 rounded-lg flex-shrink-0 ml-4 overflow-hidden">
                            {ad.imageUrl ? (
                              <img 
                                src={ad.imageUrl} 
                                alt={ad.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <ImageIcon className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">{ad.title}</h3>
                            <p className="text-sm text-gray-600">{ad.description}</p>
                            {ad.link && (
                              <a 
                                href={ad.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-500"
                              >
                                عرض الرابط
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {getPositionText(ad.position)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleActive(ad.id)}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            ad.isActive 
                              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                          title={ad.isActive ? 'معطل الإعلان' : 'تفعيل الإعلان'}
                        >
                          {ad.isActive ? 'نشط' : 'معطل'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        {ad.createdAt}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleDelete(ad.id)}
                            className="text-red-600 hover:text-red-900"
                            title="حذف الإعلان"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {advertisements.length === 0 && (
              <div className="p-12 text-center">
                <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد إعلانات</h3>
                <p className="text-gray-600 mb-4">ابدأ بإضافة إعلانك الأول</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                  title="إضافة إعلان جديد"
                >
                  إضافة إعلان جديد
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-screen overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">إضافة إعلان جديد</h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                  title="إغلاق"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="create-title" className="block text-sm font-medium text-gray-700 mb-1">
                    عنوان الإعلان *
                  </label>
                  <input
                    id="create-title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
                    placeholder="مثال: خصم خاص على قطع غيار فورد موستنق"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    💡 اكتب عنواناً قصيراً وجذاباً (يفضل أقل من 50 حرف)
                  </p>
                </div>

                <div>
                  <label htmlFor="create-description" className="block text-sm font-medium text-gray-700 mb-1">
                    وصف الإعلان *
                  </label>
                  <textarea
                    id="create-description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
                    placeholder="اكتب وصفاً واضحاً ومفصلاً للإعلان... مثال: خصم 25% على جميع قطع غيار فورد الأصلية لفترة محدودة"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    💡 اكتب وصفاً جذاباً يشجع المستخدمين على النقر على الإعلان (10 أحرف على الأقل)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    صورة الإعلان *
                  </label>
                  <div className="text-sm text-blue-700 mb-3 bg-blue-50 p-3 rounded-lg border border-blue-200 font-medium">
                    ✨ <strong>العلامة المائية التلقائية:</strong> سيتم إضافة شعار "Q8 MAZAD SPORT" مع خلفية مائية على جميع الصور لحمايتها
                  </div>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {imagePreview ? (
                      <div className="relative">
                        <img 
                          src={imagePreview} 
                          alt="معاينة الصورة" 
                          className="max-h-48 mx-auto rounded"
                        />
                        <button
                          onClick={() => {
                            setImagePreview('');
                            setFormData({...formData, imageUrl: ''});
                          }}
                          className="absolute top-2 left-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                          title="حذف الصورة"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        
                        {/* خيارات رفع الصورة */}
                        <div className="space-y-3">
                          {/* رفع من الجهاز */}
                          <div>
                            <label htmlFor="create-image-upload" className="cursor-pointer inline-block">
                              <div className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center">
                                <Upload className="h-5 w-5 ml-2" />
                                رفع من الجهاز
                              </div>
                              <input
                                id="create-image-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                              />
                            </label>
                          </div>
                          
                          {/* التقاط بالكاميرا */}
                          <div>
                            <button
                              type="button"
                              onClick={handleCameraCapture}
                              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center w-full"
                            >
                              <svg className="h-5 w-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89L8.88 4.88A2 2 0 0110.544 4h2.912a2 2 0 011.664.88l1.286 1.23A2 2 0 0017.07 7H18a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              التقاط بالكاميرا
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-xs text-gray-500 mt-3">
                          PNG, JPG, GIF حتى 5MB
                        </p>
                      </div>
                    )}
                    
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="mt-4">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div 
                            className={`bg-blue-600 h-2 rounded-full transition-all duration-300`}
                            style={{width: `${uploadProgress}%`}}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">جاري الرفع... {uploadProgress}%</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="create-link" className="block text-sm font-medium text-gray-700 mb-1">
                    رابط الإعلان (اختياري)
                  </label>
                  <input
                    id="create-link"
                    type="url"
                    value={formData.link}
                    onChange={(e) => setFormData({...formData, link: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
                    placeholder="https://shop.example.com/ford-parts"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    🔗 الرابط الذي سيتم فتحه عند النقر على الإعلان (يُفتح في نافذة جديدة)
                  </p>
                </div>

                <div>
                  <label htmlFor="create-position" className="block text-sm font-medium text-gray-700 mb-1">
                    موضع الإعلان *
                  </label>
                  <select
                    id="create-position"
                    value={formData.position}
                    onChange={(e) => setFormData({...formData, position: e.target.value as Advertisement['position']})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
                  >
                    <option value="header">🔝 أعلى الصفحة (الأكثر ظهوراً)</option>
                    <option value="between-listings">📋 بين القوائم (ظهور متوسط)</option>
                  </select>
                  <p className="text-xs text-gray-600 mt-1">
                    💡 اختر "أعلى الصفحة" للحصول على أقصى مشاهدة للإعلان
                  </p>
                </div>

                <div className="flex items-center">
                  <input
                    id="create-is-active"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="create-is-active" className="mr-2 block text-sm text-gray-900">
                    تفعيل الإعلان
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!formData.title || !formData.description || !formData.imageUrl}
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-md flex items-center"
                  title={!formData.title || !formData.description || !formData.imageUrl ? 'يرجى ملء العنوان والوصف ورفع صورة' : 'حفظ الإعلان الجديد'}
                >
                  <Save className="h-4 w-4 ml-2" />
                  {!formData.title || !formData.description || !formData.imageUrl ? 'املأ البيانات المطلوبة' : 'حفظ وتفعيل الإعلان'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthWrapper>
  );
}