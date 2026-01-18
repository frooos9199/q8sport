'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import AuthWrapper from '@/components/AuthWrapper';
import { useAuth } from '@/contexts/AuthContext';
import { formatDateShort } from '@/utils/dateUtils';

type RequestStatus = 'ACTIVE' | 'FULFILLED' | 'EXPIRED' | 'CANCELLED';

interface AdminRequestItem {
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
  status: RequestStatus;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    whatsapp: string | null;
  };
}

interface AdminRequestsApiResponse {
  success: boolean;
  requests?: AdminRequestItem[];
  error?: string;
}

export default function AdminRequestsPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<AdminRequestItem[]>([]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | RequestStatus>('ALL');

  const [editing, setEditing] = useState<AdminRequestItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState<RequestStatus>('ACTIVE');
  const [editPhone, setEditPhone] = useState('');
  const [editWhatsapp, setEditWhatsapp] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!token) {
        setItems([]);
        return;
      }

      const params = new URLSearchParams();
      params.set('limit', '200');
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`/api/admin/requests?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = (await res.json()) as AdminRequestsApiResponse;
      if (!res.ok || !data.success) {
        setError(data?.error || 'فشل جلب المطلوبات');
        setItems([]);
        return;
      }

      setItems(data.requests || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'فشل جلب المطلوبات');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, statusFilter]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((r) => {
      const haystack = [
        r.title,
        r.description,
        r.category,
        r.partName || '',
        r.carBrand || '',
        r.carModel || '',
        r.user?.name || ''
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [items, search]);

  const startEdit = (r: AdminRequestItem) => {
    setEditing(r);
    setEditTitle(r.title || '');
    setEditDescription(r.description || '');
    setEditStatus(r.status || 'ACTIVE');
    setEditPhone(r.contactPhone || '');
    setEditWhatsapp(r.contactWhatsapp || '');
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditTitle('');
    setEditDescription('');
    setEditStatus('ACTIVE');
    setEditPhone('');
    setEditWhatsapp('');
  };

  const saveEdit = async () => {
    if (!token || !editing) return;

    if (!editTitle.trim() || !editDescription.trim()) {
      alert('العنوان والوصف مطلوبان');
      return;
    }

    const res = await fetch(`/api/requests/${editing.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title: editTitle.trim(),
        description: editDescription.trim(),
        status: editStatus,
        contactPhone: editPhone.trim() ? editPhone.trim() : null,
        contactWhatsapp: editWhatsapp.trim() ? editWhatsapp.trim() : null
      })
    });

    const data = (await res.json()) as any;
    if (!res.ok || !data.success) {
      alert(data?.error || 'فشل تحديث الطلب');
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

    const data = (await res.json()) as any;
    if (!res.ok || !data.success) {
      alert(data?.error || 'فشل حذف الطلب');
      return;
    }

    await load();
  };

  return (
    <AuthWrapper requireAuth={true} requireAdmin={true}>
      <div className="min-h-screen bg-black">
        <header className="bg-gradient-to-r from-black via-gray-900 to-black border-b border-red-600 text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">إدارة المطلوبات</h1>
                <p className="text-gray-400">تعديل/حذف أي طلب (للأدمن)</p>
              </div>
              <Link href="/admin" className="text-gray-300 hover:text-white">
                العودة للوحة الإدارة
              </Link>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-6 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث..."
              className="w-full md:w-1/2 px-3 py-2 bg-black text-white border border-gray-700 rounded-lg focus:ring-red-600 focus:border-red-600"
            />
            <div className="flex gap-2 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full md:w-56 px-3 py-2 bg-black text-white border border-gray-700 rounded-lg"
              >
                <option value="ALL">الكل</option>
                <option value="ACTIVE">نشط</option>
                <option value="FULFILLED">تم تلبيته</option>
                <option value="EXPIRED">منتهي</option>
                <option value="CANCELLED">ملغي</option>
              </select>
              <button
                onClick={load}
                className="px-4 py-2 rounded-lg border border-gray-700 text-gray-200 hover:bg-gray-800"
              >
                تحديث
              </button>
            </div>
          </div>

          {loading && <div className="text-center py-16 text-gray-400">جاري تحميل المطلوبات...</div>}
          {error && (
            <div className="bg-red-600/20 border border-red-600/30 text-red-300 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">لا توجد مطلوبات.</div>
          )}

          <div className="space-y-4">
            {filtered.map((r) => (
              <div key={r.id} className="bg-gray-900 border border-gray-800 rounded-lg p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-white font-bold text-lg">{r.title}</h3>
                      {r.urgent && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-900/40 text-red-300 border border-red-700/40">
                          عاجل
                        </span>
                      )}
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-200 border border-gray-700">
                        {r.status}
                      </span>
                      <span className="text-xs text-gray-400">• {r.user?.name}</span>
                      <span className="text-xs text-gray-400">• {formatDateShort(r.createdAt)}</span>
                    </div>
                    <p className="text-gray-300 mt-2 whitespace-pre-line line-clamp-2">{r.description}</p>
                    <div className="mt-2 text-sm text-gray-400">
                      {r.category}
                      {r.carBrand ? ` • ${r.carBrand}` : ''}
                      {r.carModel ? ` • ${r.carModel}` : ''}
                      {r.carYear ? ` • ${r.carYear}` : ''}
                      {r.budget ? ` • ميزانية: ${r.budget}` : ''}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
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
                </div>
              </div>
            ))}
          </div>

          {/* Edit Modal */}
          {editing && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
              <div className="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white font-bold text-lg">تعديل الطلب</h2>
                  <button onClick={cancelEdit} className="text-gray-300 hover:text-white">إغلاق</button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">العنوان</label>
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-black text-white border border-gray-700 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">الوصف</label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={5}
                      className="w-full px-3 py-2 bg-black text-white border border-gray-700 rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">الحالة</label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as RequestStatus)}
                        className="w-full px-3 py-2 bg-black text-white border border-gray-700 rounded-lg"
                      >
                        <option value="ACTIVE">نشط</option>
                        <option value="FULFILLED">تم تلبيته</option>
                        <option value="EXPIRED">منتهي</option>
                        <option value="CANCELLED">ملغي</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">رقم التواصل</label>
                      <input
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-black text-white border border-gray-700 rounded-lg"
                        placeholder="965..."
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm text-gray-300 mb-1">واتساب</label>
                      <input
                        value={editWhatsapp}
                        onChange={(e) => setEditWhatsapp(e.target.value)}
                        className="w-full px-3 py-2 bg-black text-white border border-gray-700 rounded-lg"
                        placeholder="965..."
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={cancelEdit}
                      className="px-4 py-2 rounded-lg border border-gray-700 text-gray-200 hover:bg-gray-800"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={saveEdit}
                      className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                    >
                      حفظ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthWrapper>
  );
}
