'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import AuthWrapper from '@/components/AuthWrapper';
import { formatDateShort } from '@/utils/dateUtils';

type AuctionStatus = 'DRAFT' | 'ACTIVE' | 'ENDED' | 'CANCELLED';

interface AuctionItem {
  id: string;
  title: string;
  description: string;
  status: AuctionStatus;
  category: string;
  carModel: string;
  carYear: number | null;
  currentBid?: number;
  currentPrice: number;
  buyNowPrice: number | null;
  totalBids?: number;
  endTime: string;
  createdAt: string;
  seller?: { id: string; name: string } | null;
}

interface AuctionsApiResponse {
  auctions: AuctionItem[];
  pagination?: { total?: number };
  error?: string;
}

export default function AdminAuctionsPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<AuctionItem[]>([]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | AuctionStatus>('ALL');

  const [editing, setEditing] = useState<AuctionItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState<AuctionStatus>('ACTIVE');
  const [editEndTime, setEditEndTime] = useState('');
  const [editBuyNow, setEditBuyNow] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!token) {
        setItems([]);
        return;
      }

      const res = await fetch('/api/admin/auctions?limit=200', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = (await res.json()) as AuctionsApiResponse;
      if (!res.ok) {
        setError(data?.error || 'فشل جلب المزادات');
        setItems([]);
        return;
      }

      setItems(data.auctions || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'فشل جلب المزادات');
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
    return (items || [])
      .filter((a) => (statusFilter === 'ALL' ? true : a.status === statusFilter))
      .filter((a) => {
        if (!q) return true;
        const haystack = [a.title, a.description, a.category, a.carModel, a.seller?.name || '']
          .join(' ')
          .toLowerCase();
        return haystack.includes(q);
      });
  }, [items, search, statusFilter]);

  const startEdit = (a: AuctionItem) => {
    setEditing(a);
    setEditTitle(a.title || '');
    setEditDescription(a.description || '');
    setEditStatus(a.status || 'ACTIVE');
    setEditEndTime(a.endTime ? new Date(a.endTime).toISOString().slice(0, 16) : '');
    setEditBuyNow(a.buyNowPrice === null || a.buyNowPrice === undefined ? '' : String(a.buyNowPrice));
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditTitle('');
    setEditDescription('');
    setEditStatus('ACTIVE');
    setEditEndTime('');
    setEditBuyNow('');
  };

  const saveEdit = async () => {
    if (!token || !editing) return;

    if (!editTitle.trim() || !editDescription.trim()) {
      alert('العنوان والوصف مطلوبان');
      return;
    }

    const payload: any = {
      title: editTitle.trim(),
      description: editDescription.trim(),
      status: editStatus
    };

    if (editEndTime) payload.endTime = new Date(editEndTime).toISOString();
    payload.buyNowPrice = editBuyNow.trim() ? Number(editBuyNow.trim()) : null;

    const res = await fetch(`/api/auctions/${editing.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = (await res.json()) as any;
    if (!res.ok) {
      alert(data?.error || 'فشل تعديل المزاد');
      return;
    }

    cancelEdit();
    await load();
  };

  const remove = async (id: string) => {
    if (!token) return;

    const ok = confirm('تأكيد حذف المزاد؟ (الأدمن يمكنه حذف المزاد حتى لو يحتوي مزايدات)');
    if (!ok) return;

    const res = await fetch(`/api/auctions/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = (await res.json()) as any;
    if (!res.ok) {
      alert(data?.error || 'فشل حذف المزاد');
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
                <h1 className="text-2xl font-bold">إدارة المزادات</h1>
                <p className="text-gray-400">تعديل/حذف أي مزاد (للأدمن)</p>
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
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full md:w-56 px-3 py-2 bg-black text-white border border-gray-700 rounded-lg"
            >
              <option value="ALL">الكل</option>
              <option value="ACTIVE">نشط</option>
              <option value="ENDED">منتهي</option>
              <option value="DRAFT">مسودة</option>
              <option value="CANCELLED">ملغي</option>
            </select>
          </div>

          {loading && <div className="text-center py-16 text-gray-400">جاري تحميل المزادات...</div>}
          {error && (
            <div className="bg-red-600/20 border border-red-600/30 text-red-300 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">لا توجد مزادات.</div>
          )}

          <div className="space-y-4">
            {filtered.map((a) => (
              <div key={a.id} className="bg-gray-900 border border-gray-800 rounded-lg p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-white font-bold text-lg">{a.title}</h3>
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-200 border border-gray-700">
                        {a.status}
                      </span>
                      <span className="text-xs text-gray-400">{a.category}</span>
                      <span className="text-xs text-gray-400">• {a.carModel}{a.carYear ? ` ${a.carYear}` : ''}</span>
                      {a.seller?.name ? <span className="text-xs text-gray-400">• البائع: {a.seller.name}</span> : null}
                    </div>
                    <p className="text-gray-300 mt-2 whitespace-pre-line line-clamp-2">{a.description}</p>
                    <div className="mt-2 text-sm text-gray-400">
                      ينتهي: {formatDateShort(a.endTime)} • مزايدات: {a.totalBids ?? 0}
                      {a.buyNowPrice ? ` • اشتر الآن: ${a.buyNowPrice}` : ''}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/auctions/${a.id}`}
                      className="px-3 py-2 rounded-lg border border-gray-700 text-gray-200 hover:bg-gray-800"
                    >
                      فتح
                    </Link>
                    <button
                      onClick={() => startEdit(a)}
                      className="px-3 py-2 rounded-lg border border-gray-700 text-gray-200 hover:bg-gray-800"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => remove(a.id)}
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
                  <h2 className="text-white font-bold text-lg">تعديل المزاد</h2>
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
                        onChange={(e) => setEditStatus(e.target.value as AuctionStatus)}
                        className="w-full px-3 py-2 bg-black text-white border border-gray-700 rounded-lg"
                      >
                        <option value="ACTIVE">نشط</option>
                        <option value="ENDED">منتهي</option>
                        <option value="DRAFT">مسودة</option>
                        <option value="CANCELLED">ملغي</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">وقت الانتهاء</label>
                      <input
                        type="datetime-local"
                        value={editEndTime}
                        onChange={(e) => setEditEndTime(e.target.value)}
                        className="w-full px-3 py-2 bg-black text-white border border-gray-700 rounded-lg"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm text-gray-300 mb-1">سعر اشتر الآن (اختياري)</label>
                      <input
                        value={editBuyNow}
                        onChange={(e) => setEditBuyNow(e.target.value)}
                        className="w-full px-3 py-2 bg-black text-white border border-gray-700 rounded-lg"
                        placeholder="اتركه فارغ لإزالة السعر"
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
