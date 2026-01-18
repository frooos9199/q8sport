'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import AuthWrapper from '@/components/AuthWrapper';
import { formatDateShort } from '@/utils/dateUtils';

interface MyRequestItem {
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
}

export default function MyRequestsPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<MyRequestItem[]>([]);
  const [search, setSearch] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const load = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/requests/my', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = (await res.json()) as { success: boolean; requests: MyRequestItem[]; error?: string };

      if (!res.ok || !data.success) {
        setError(data.error || 'فشل جلب طلباتك');
        setItems([]);
        return;
      }

      setItems(data.requests || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'فشل جلب طلباتك');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;

    return items.filter((r) => {
      const haystack = [r.title, r.description, r.category, r.carBrand || '', r.carModel || '', r.partName || '']
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [items, search]);

  const startEdit = (r: MyRequestItem) => {
    setEditingId(r.id);
    setEditTitle(r.title);
    setEditDescription(r.description);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditDescription('');
  };

  const saveEdit = async (id: string) => {
    if (!token) return;

    if (!editTitle.trim() || !editDescription.trim()) {
      alert('العنوان والوصف مطلوبان');
      return;
    }

    const res = await fetch(`/api/requests/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title: editTitle,
        description: editDescription
      })
    });

    const data = (await res.json()) as { success?: boolean; error?: string };

    if (!res.ok || !data.success) {
      alert(data.error || 'فشل تحديث الطلب');
      return;
    }

    cancelEdit();
    await load();
  };

  const remove = async (id: string) => {
    if (!token) return;

    const ok = confirm('هل أنت متأكد من حذف هذا الطلب؟');
    if (!ok) return;

    const res = await fetch(`/api/requests/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = (await res.json()) as { success?: boolean; error?: string; message?: string };

    if (!res.ok || !data.success) {
      alert(data.error || 'فشل حذف الطلب');
      return;
    }

    await load();
  };

  return (
    <AuthWrapper requireAuth={true}>
      <div className="min-h-screen bg-black">
        <header className="bg-gradient-to-r from-black via-gray-900 to-black border-b border-red-600 text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">طلباتي</h1>
                <p className="text-gray-400">إدارة الطلبات التي نشرتها</p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/requests"
                  className="px-4 py-2 rounded-lg border border-gray-800 text-gray-200 hover:bg-gray-900"
                >
                  كل المطلوبات
                </Link>
                <Link href="/requests/new" className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">
                  إضافة طلب
                </Link>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-6">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث في طلباتي..."
              className="w-full px-3 py-2 bg-black text-white border border-gray-700 rounded-lg focus:ring-red-600 focus:border-red-600"
            />
          </div>

          {loading && <div className="text-center py-16 text-gray-400">جاري تحميل طلباتك...</div>}

          {error && (
            <div className="bg-red-600/20 border border-red-600/30 text-red-300 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">لا توجد طلبات لديك.</div>
          )}

          <div className="space-y-4">
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
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-200 border border-gray-700">
                        {r.status}
                      </span>
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

                {editingId === r.id ? (
                  <div className="mt-4 space-y-3">
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-black text-white border border-gray-700 rounded-lg"
                    />
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 bg-black text-white border border-gray-700 rounded-lg"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={cancelEdit}
                        className="px-4 py-2 rounded-lg border border-gray-700 text-gray-200 hover:bg-gray-800"
                      >
                        إلغاء
                      </button>
                      <button
                        onClick={() => saveEdit(r.id)}
                        className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                      >
                        حفظ
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-300 mt-3 whitespace-pre-line">{r.description}</p>
                    <div className="mt-4 flex items-center justify-end gap-2">
                      <button
                        onClick={() => startEdit(r)}
                        className="px-3 py-2 rounded-lg border border-gray-700 text-gray-200 hover:bg-gray-800"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => remove(r.id)}
                        className="px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                      >
                        حذف
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AuthWrapper>
  );
}
