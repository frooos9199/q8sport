'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import AuthWrapper from '@/components/AuthWrapper';

interface CreateRequestBody {
  title: string;
  description: string;
  category?: string;
  carBrand?: string;
  carModel?: string;
  carYear?: string;
  partName?: string;
  condition?: string;
  budget?: string;
  urgent?: boolean;
  contactPhone?: string;
  contactWhatsapp?: string;
}

export default function NewRequestPage() {
  const router = useRouter();
  const { token } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CreateRequestBody>({
    title: '',
    description: '',
    category: 'قطع غيار',
    carBrand: '',
    carModel: '',
    carYear: '',
    partName: '',
    condition: '',
    budget: '',
    urgent: false,
    contactPhone: '',
    contactWhatsapp: ''
  });

  const submit = async () => {
    if (!token) {
      router.push('/auth');
      return;
    }

    if (!form.title.trim() || !form.description.trim()) {
      setError('العنوان والوصف مطلوبان');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...form,
          urgent: !!form.urgent
        })
      });

      const data = (await res.json()) as { success?: boolean; error?: string; message?: string };

      if (!res.ok || !data.success) {
        setError(data.error || 'فشل إضافة الطلب');
        return;
      }

      router.push('/requests/my');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'فشل إضافة الطلب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthWrapper requireAuth={true}>
      <div className="min-h-screen bg-black">
        <header className="bg-gradient-to-r from-black via-gray-900 to-black border-b border-red-600 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">إضافة طلب (المطلوب)</h1>
                <p className="text-gray-400">اكتب تفاصيل القطعة/السيارة المطلوبة</p>
              </div>
              <Link href="/requests" className="text-gray-300 hover:text-white">
                العودة
              </Link>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="bg-red-600/20 border border-red-600/30 text-red-300 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-5">
            <div>
              <label className="block text-sm text-gray-300 mb-1">العنوان *</label>
              <input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                className="w-full px-3 py-2 bg-black text-white border border-gray-700 rounded-lg focus:ring-red-600 focus:border-red-600"
                placeholder="مثال: مطلوب محرك موستانج 5.0"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">الوصف *</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                rows={5}
                className="w-full px-3 py-2 bg-black text-white border border-gray-700 rounded-lg focus:ring-red-600 focus:border-red-600"
                placeholder="اكتب كل التفاصيل المطلوبة..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">التصنيف</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                  className="w-full px-3 py-2 bg-black text-white border border-gray-700 rounded-lg"
                >
                  <option value="قطع غيار">قطع غيار</option>
                  <option value="سيارات">سيارات</option>
                  <option value="إطارات">إطارات</option>
                  <option value="زيوت">زيوت</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">اسم القطعة</label>
                <input
                  value={form.partName}
                  onChange={(e) => setForm((p) => ({ ...p, partName: e.target.value }))}
                  className="w-full px-3 py-2 bg-black text-white border border-gray-700 rounded-lg"
                  placeholder="مثال: قير / مكينة / ديسكات"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">الماركة</label>
                <input
                  value={form.carBrand}
                  onChange={(e) => setForm((p) => ({ ...p, carBrand: e.target.value }))}
                  className="w-full px-3 py-2 bg-black text-white border border-gray-700 rounded-lg"
                  placeholder="مثال: Ford"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">الموديل</label>
                <input
                  value={form.carModel}
                  onChange={(e) => setForm((p) => ({ ...p, carModel: e.target.value }))}
                  className="w-full px-3 py-2 bg-black text-white border border-gray-700 rounded-lg"
                  placeholder="مثال: Mustang"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">سنة الصنع</label>
                <input
                  value={form.carYear}
                  onChange={(e) => setForm((p) => ({ ...p, carYear: e.target.value }))}
                  className="w-full px-3 py-2 bg-black text-white border border-gray-700 rounded-lg"
                  placeholder="مثال: 2020"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">الميزانية (د.ك)</label>
                <input
                  value={form.budget}
                  onChange={(e) => setForm((p) => ({ ...p, budget: e.target.value }))}
                  className="w-full px-3 py-2 bg-black text-white border border-gray-700 rounded-lg"
                  placeholder="مثال: 150"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-gray-300 mb-1">الحالة</label>
                <input
                  value={form.condition}
                  onChange={(e) => setForm((p) => ({ ...p, condition: e.target.value }))}
                  className="w-full px-3 py-2 bg-black text-white border border-gray-700 rounded-lg"
                  placeholder="مثال: جديد / مستعمل ممتاز"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">رقم التواصل</label>
                <input
                  value={form.contactPhone}
                  onChange={(e) => setForm((p) => ({ ...p, contactPhone: e.target.value }))}
                  className="w-full px-3 py-2 bg-black text-white border border-gray-700 rounded-lg"
                  placeholder="965..."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">واتساب</label>
                <input
                  value={form.contactWhatsapp}
                  onChange={(e) => setForm((p) => ({ ...p, contactWhatsapp: e.target.value }))}
                  className="w-full px-3 py-2 bg-black text-white border border-gray-700 rounded-lg"
                  placeholder="965..."
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-gray-200">
              <input
                type="checkbox"
                checked={!!form.urgent}
                onChange={(e) => setForm((p) => ({ ...p, urgent: e.target.checked }))}
                className="h-4 w-4"
              />
              طلب عاجل
            </label>

            <div className="flex justify-end gap-2">
              <Link
                href="/requests"
                className="px-4 py-2 rounded-lg border border-gray-700 text-gray-200 hover:bg-gray-800"
              >
                إلغاء
              </Link>
              <button
                onClick={submit}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'جاري الحفظ...' : 'نشر الطلب'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AuthWrapper>
  );
}
