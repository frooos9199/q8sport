'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { formatDateShort } from '@/utils/dateUtils';

interface RequestUser {
  id: string;
  name: string;
  phone?: string | null;
  rating?: number | null;
}

interface RequestItem {
  id: string;
  title: string;
  description: string;
  category: string;
  carBrand: string | null;
  carModel: string | null;
  carYear: number | null;
  partName: string | null;
  condition: string | null;
  budget: number | null;
  urgent: boolean;
  contactPhone: string | null;
  contactWhatsapp: string | null;
  status: string;
  createdAt: string;
  user: RequestUser;
}

interface RequestsApiResponse {
  success: boolean;
  requests: RequestItem[];
  count: number;
  error?: string;
}

export default function RequestsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [urgentOnly, setUrgentOnly] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch('/api/requests?status=ACTIVE');
        const data = (await res.json()) as RequestsApiResponse;

        if (!res.ok || !data.success) {
          setError(data.error || 'فشل جلب الطلبات');
          setRequests([]);
          return;
        }

        setRequests(data.requests || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'فشل جلب الطلبات');
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return requests.filter((r) => {
      if (urgentOnly && !r.urgent) return false;
      if (category && r.category !== category) return false;

      if (!q) return true;
      const haystack = [
        r.title,
        r.description,
        r.category,
        r.carBrand || '',
        r.carModel || '',
        r.partName || '',
        r.user?.name || ''
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [requests, search, category, urgentOnly]);

  return (
    <div className="min-h-screen bg-black">
      <header className="bg-gradient-to-r from-black via-gray-900 to-black border-b border-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">المطلوب</h1>
              <p className="text-gray-400">طلبات شراء قطع/سيارات من المستخدمين</p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/requests/my"
                className="px-4 py-2 rounded-lg border border-gray-800 text-gray-200 hover:bg-gray-900"
              >
                طلباتي
              </Link>
              <Link
                href={user ? '/requests/new' : '/auth'}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                إضافة طلب
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث في المطلوبات..."
              className="w-full px-3 py-2 bg-black text-white border border-gray-700 rounded-lg focus:ring-red-600 focus:border-red-600"
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-black text-white border border-gray-700 rounded-lg focus:ring-red-600 focus:border-red-600"
              title="فلترة حسب التصنيف"
            >
              <option value="">كل التصنيفات</option>
              <option value="قطع غيار">قطع غيار</option>
              <option value="سيارات">سيارات</option>
              <option value="إطارات">إطارات</option>
              <option value="زيوت">زيوت</option>
            </select>

            <label className="flex items-center gap-2 text-gray-200">
              <input
                type="checkbox"
                checked={urgentOnly}
                onChange={(e) => setUrgentOnly(e.target.checked)}
                className="h-4 w-4"
              />
              عاجل فقط
            </label>
          </div>

          <div className="mt-3 text-sm text-gray-400">عدد النتائج: {filtered.length}</div>
        </div>

        {loading && (
          <div className="text-center py-16 text-gray-400">جاري تحميل الطلبات...</div>
        )}

        {error && (
          <div className="bg-red-600/20 border border-red-600/30 text-red-300 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">لا توجد طلبات حالياً.</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((r) => (
            <div key={r.id} className="bg-gray-900 border border-gray-800 rounded-lg p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-bold text-lg">{r.title}</h3>
                    {r.urgent && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-900/40 text-red-300 border border-red-700/40">
                        عاجل
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mt-1">
                    {r.category}
                    {r.carBrand ? ` • ${r.carBrand}` : ''}
                    {r.carModel ? ` • ${r.carModel}` : ''}
                    {r.carYear ? ` • ${r.carYear}` : ''}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-gray-400 text-xs">تاريخ النشر</div>
                  <div className="text-gray-200 text-sm">{formatDateShort(r.createdAt)}</div>
                </div>
              </div>

              <p className="text-gray-300 mt-3 whitespace-pre-line line-clamp-3">{r.description}</p>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-gray-400">
                  بواسطة: <span className="text-gray-200">{r.user?.name || '—'}</span>
                </div>

                <div className="flex items-center gap-2">
                  {r.budget !== null && (
                    <div className="text-sm text-green-400 font-semibold">ميزانية: {r.budget} د.ك</div>
                  )}
                  <span className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-200 border border-gray-700">
                    {r.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
