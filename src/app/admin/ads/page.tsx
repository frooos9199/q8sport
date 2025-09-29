'use client';

import { useState } from 'react';
import { Settings, Save, Eye, EyeOff, Plus, Trash2, Edit3 } from 'lucide-react';

interface AdUnit {
  id: string;
  name: string;
  slot: string;
  position: string;
  status: 'active' | 'inactive';
  revenue: number;
  clicks: number;
  impressions: number;
}

export default function AdsManagementPage() {
  const [publisherId, setPublisherId] = useState('ca-pub-XXXXXXXXXXXXXXXX');
  const [adUnits, setAdUnits] = useState<AdUnit[]>([
    {
      id: '1',
      name: 'إعلان الهيدر الرئيسي',
      slot: '1234567890',
      position: 'header',
      status: 'active',
      revenue: 45.67,
      clicks: 234,
      impressions: 12450
    },
    {
      id: '2', 
      name: 'إعلان بين المحتوى',
      slot: '0987654321',
      position: 'content',
      status: 'active',
      revenue: 78.91,
      clicks: 456,
      impressions: 18750
    },
    {
      id: '3',
      name: 'إعلان الفوتر',
      slot: '1111222233',
      position: 'footer',
      status: 'active',
      revenue: 23.45,
      clicks: 123,
      impressions: 8930
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingAd, setEditingAd] = useState<AdUnit | null>(null);

  const handleSavePublisherId = () => {
    // حفظ Publisher ID في قاعدة البيانات أو الإعدادات
    alert('تم حفظ Publisher ID بنجاح!');
  };

  const toggleAdStatus = (id: string) => {
    setAdUnits(prev => prev.map(ad => 
      ad.id === id ? { ...ad, status: ad.status === 'active' ? 'inactive' : 'active' } : ad
    ));
  };

  const deleteAd = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الإعلان؟')) {
      setAdUnits(prev => prev.filter(ad => ad.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-white ml-3" />
              <div>
                <h1 className="text-2xl font-bold text-white">إدارة الإعلانات</h1>
                <p className="text-blue-100">Google AdSense Management</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Publisher ID Settings */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">إعدادات Google AdSense</h2>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Publisher ID
              </label>
              <input
                type="text"
                value={publisherId}
                onChange={(e) => setPublisherId(e.target.value)}
                placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={handleSavePublisherId}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <Save className="h-4 w-4" />
              حفظ
            </button>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-sm font-medium text-gray-500">إجمالي الإيرادات</h3>
            <p className="text-2xl font-bold text-green-600">
              {adUnits.reduce((sum, ad) => sum + ad.revenue, 0).toFixed(2)} د.ك
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-sm font-medium text-gray-500">إجمالي النقرات</h3>
            <p className="text-2xl font-bold text-blue-600">
              {adUnits.reduce((sum, ad) => sum + ad.clicks, 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-sm font-medium text-gray-500">إجمالي المشاهدات</h3>
            <p className="text-2xl font-bold text-purple-600">
              {adUnits.reduce((sum, ad) => sum + ad.impressions, 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-sm font-medium text-gray-500">الإعلانات النشطة</h3>
            <p className="text-2xl font-bold text-gray-900">
              {adUnits.filter(ad => ad.status === 'active').length} / {adUnits.length}
            </p>
          </div>
        </div>

        {/* Ad Units Management */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">وحدات الإعلانات</h2>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                <Plus className="h-4 w-4" />
                إضافة إعلان جديد
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    اسم الإعلان
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slot ID
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الموقع
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإيرادات
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    النقرات
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المشاهدات
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {adUnits.map((ad) => (
                  <tr key={ad.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {ad.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {ad.slot}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {ad.position}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        ad.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {ad.status === 'active' ? 'نشط' : 'معطل'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                      {ad.revenue.toFixed(2)} د.ك
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ad.clicks.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ad.impressions.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleAdStatus(ad.id)}
                          className={`p-1 rounded ${
                            ad.status === 'active' 
                              ? 'text-red-600 hover:bg-red-50' 
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={ad.status === 'active' ? 'إيقاف الإعلان' : 'تشغيل الإعلان'}
                        >
                          {ad.status === 'active' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => setEditingAd(ad)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="تعديل الإعلان"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteAd(ad.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
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
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-bold text-blue-900 mb-4">📋 تعليمات إعداد Google AdSense</h3>
          <div className="space-y-3 text-blue-800">
            <p><strong>1.</strong> أنشئ حساب في Google AdSense من: <a href="https://www.google.com/adsense/" target="_blank" rel="noopener noreferrer" className="underline">adsense.google.com</a></p>
            <p><strong>2.</strong> احصل على Publisher ID (ca-pub-XXXXXXXXXXXXXXXX) من لوحة التحكم</p>
            <p><strong>3.</strong> أنشئ وحدات إعلانية جديدة واحصل على Slot IDs</p>
            <p><strong>4.</strong> أدخل Publisher ID في الحقل أعلاه واحفظه</p>
            <p><strong>5.</strong> أضف الـ Slot IDs للإعلانات المختلفة في الجدول</p>
            <p><strong>6.</strong> انتظر موافقة Google على موقعك (قد تستغرق عدة أيام)</p>
          </div>
        </div>
      </div>
    </div>
  );
}