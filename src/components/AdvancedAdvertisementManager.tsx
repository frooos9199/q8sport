'use client';

import React, { useState, useEffect } from 'react'
import { PlusCircle, Edit, Trash2, Eye, BarChart3, Calendar, DollarSign, Target, Plus, TrendingUp, Clock, EyeOff, Edit2 } from 'lucide-react'
import { formatDateShort } from '@/utils/dateUtils'

interface Advertisement {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  link?: string;
  active: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

export default function AdvancedAdvertisementManager() {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    link: '',
    active: true,
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const response = await fetch('/api/advertisements/admin');
      if (response.ok) {
        const data = await response.json();
        setAds(data);
      }
    } catch (error) {
      console.error('Error fetching ads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const method = editingAd ? 'PUT' : 'POST';
      const url = editingAd ? `/api/advertisements/${editingAd.id}` : '/api/advertisements';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchAds();
        resetForm();
        alert(editingAd ? 'تم تحديث الإعلان بنجاح!' : 'تم إنشاء الإعلان بنجاح!');
      } else {
        alert('خطأ في حفظ الإعلان');
      }
    } catch (error) {
      console.error('Error saving ad:', error);
      alert('خطأ في حفظ الإعلان');
    }
  };

  const handleEdit = (ad: Advertisement) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      description: ad.description,
      imageUrl: ad.imageUrl || '',
      link: ad.link || '',
      active: ad.active,
      startDate: ad.startDate ? new Date(ad.startDate).toISOString().slice(0, 16) : '',
      endDate: ad.endDate ? new Date(ad.endDate).toISOString().slice(0, 16) : ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل تريد حذف هذا الإعلان؟')) {
      try {
        const response = await fetch(`/api/advertisements/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          await fetchAds();
          alert('تم حذف الإعلان بنجاح!');
        } else {
          alert('خطأ في حذف الإعلان');
        }
      } catch (error) {
        console.error('Error deleting ad:', error);
        alert('خطأ في حذف الإعلان');
      }
    }
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    try {
      const response = await fetch(`/api/advertisements/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active: !currentActive }),
      });

      if (response.ok) {
        await fetchAds();
      } else {
        alert('خطأ في تغيير حالة الإعلان');
      }
    } catch (error) {
      console.error('Error toggling ad status:', error);
      alert('خطأ في تغيير حالة الإعلان');
    }
  };

  const resetForm = () => {
    setEditingAd(null);
    setShowForm(false);
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      link: '',
      active: true,
      startDate: '',
      endDate: ''
    });
  };

  const isExpired = (ad: Advertisement) => {
    if (!ad.endDate) return false;
    return new Date(ad.endDate) < new Date();
  };

  const isScheduled = (ad: Advertisement) => {
    if (!ad.startDate) return false;
    return new Date(ad.startDate) > new Date();
  };

  const isActive = (ad: Advertisement) => {
    if (!ad.active) return false;
    const now = new Date();
    if (ad.startDate && new Date(ad.startDate) > now) return false;
    if (ad.endDate && new Date(ad.endDate) < now) return false;
    return true;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة الإعلانات المتقدمة</h1>
          <p className="text-gray-600 mt-2">إدارة شاملة للإعلانات مع جدولة زمنية وتكرار تلقائي</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center transition-colors"
        >
          <Plus className="h-5 w-5 ml-2" />
          إضافة إعلان جديد
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">إجمالي الإعلانات</p>
              <p className="text-2xl font-bold text-gray-900">{ads.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">الإعلانات النشطة</p>
              <p className="text-2xl font-bold text-green-600">{ads.filter(isActive).length}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Eye className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">المجدولة</p>
              <p className="text-2xl font-bold text-yellow-600">{ads.filter(isScheduled).length}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">المنتهية</p>
              <p className="text-2xl font-bold text-red-600">{ads.filter(isExpired).length}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <EyeOff className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingAd ? 'تعديل الإعلان' : 'إضافة إعلان جديد'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عنوان الإعلان *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  وصف الإعلان *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رابط الصورة
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رابط الإعلان
                </label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="/auctions أو https://external-link.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تاريخ البداية
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تاريخ الانتهاء
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="active" className="mr-3 text-sm font-medium text-gray-700">
                  تفعيل الإعلان
                </label>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingAd ? 'تحديث الإعلان' : 'إنشاء الإعلان'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Advertisements List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">جميع الإعلانات</h2>
        </div>

        {ads.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">لا توجد إعلانات حتى الآن</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإعلان
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الجدولة الزمنية
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ads.map((ad) => (
                  <tr key={ad.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {ad.imageUrl && (
                          <img
                            src={ad.imageUrl}
                            alt={ad.title}
                            className="h-12 w-12 rounded-lg object-cover ml-4"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{ad.title}</div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">{ad.description}</div>
                          {ad.link && (
                            <div className="text-xs text-blue-600">{ad.link}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isActive(ad)
                            ? 'bg-green-100 text-green-800'
                            : isScheduled(ad)
                            ? 'bg-yellow-100 text-yellow-800'
                            : isExpired(ad)
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {isActive(ad)
                            ? '🟢 نشط'
                            : isScheduled(ad)
                            ? '🟡 مجدول'
                            : isExpired(ad)
                            ? '🔴 منتهي'
                            : '⚪ معطل'
                          }
                        </span>
                        {!ad.active && (
                          <span className="text-xs text-gray-500">معطل يدوياً</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="space-y-1">
                        {ad.startDate && (
                          <div className="flex items-center text-xs">
                            <Calendar className="h-3 w-3 ml-1" />
                            البداية: {formatDateShort(ad.startDate)}
                          </div>
                        )}
                        {ad.endDate && (
                          <div className="flex items-center text-xs">
                            <Calendar className="h-3 w-3 ml-1" />
                            النهاية: {formatDateShort(ad.endDate)}
                          </div>
                        )}
                        {!ad.startDate && !ad.endDate && (
                          <span className="text-xs text-gray-400">بدون جدولة</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleActive(ad.id, ad.active)}
                          className={`p-2 rounded-lg transition-colors ${
                            ad.active
                              ? 'text-green-600 hover:bg-green-100'
                              : 'text-gray-400 hover:bg-gray-100'
                          }`}
                          title={ad.active ? 'إلغاء التفعيل' : 'تفعيل'}
                        >
                          {ad.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => handleEdit(ad)}
                          className="text-blue-600 hover:bg-blue-100 p-2 rounded-lg transition-colors"
                          title="تعديل"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(ad.id)}
                          className="text-red-600 hover:bg-red-100 p-2 rounded-lg transition-colors"
                          title="حذف"
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
        )}
      </div>
    </div>
  );
}