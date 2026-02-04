'use client';

import { useState } from 'react';

interface BlockButtonProps {
  userId: string;
  userName: string;
  className?: string;
  onBlocked?: () => void;
}

export default function BlockButton({ userId, userName, className = '', onBlocked }: BlockButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBlock = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('يجب تسجيل الدخول أولاً');
        setShowModal(false);
        return;
      }

      const response = await fetch('/api/moderation/block', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          reason,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل حظر المستخدم');
      }

      alert(data.message || 'تم حظر المستخدم بنجاح. لن ترى محتواه بعد الآن.');
      setShowModal(false);
      setReason('');
      
      if (onBlocked) {
        onBlocked();
      }
    } catch (error: any) {
      console.error('Error blocking user:', error);
      alert(error.message || 'حدث خطأ أثناء حظر المستخدم');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`flex items-center gap-2 text-gray-400 hover:text-red-600 transition-colors ${className}`}
        title="حظر المستخدم"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
          />
        </svg>
        <span className="text-sm font-semibold">حظر</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" dir="rtl">
          <div className="bg-gray-900 rounded-lg max-w-md w-full p-6 border border-red-600">
            <h2 className="text-2xl font-bold text-white mb-4">
              🚫 حظر المستخدم
            </h2>

            <p className="text-gray-300 mb-4">
              هل أنت متأكد أنك تريد حظر <span className="text-red-500 font-bold">{userName}</span>؟
            </p>

            <div className="bg-blue-900 bg-opacity-30 border border-blue-600 rounded-lg p-4 mb-4">
              <p className="text-blue-400 text-sm font-semibold mb-2">
                ℹ️ عند حظر هذا المستخدم:
              </p>
              <ul className="text-blue-300 text-sm space-y-1 mr-5 list-disc">
                <li>سيتم إخفاء جميع محتواه من خلاصتك فوراً</li>
                <li>لن يتمكن من إرسال رسائل لك</li>
                <li>سيتم إشعار فريق المراقبة تلقائياً</li>
                <li>يمكنك إلغاء الحظر في أي وقت من الإعدادات</li>
              </ul>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white font-semibold mb-2">
                  سبب الحظر (اختياري)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-red-600 focus:outline-none"
                  rows={3}
                  placeholder="لماذا تريد حظر هذا المستخدم؟"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleBlock}
                  disabled={loading}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'جاري الحظر...' : 'نعم، احظر المستخدم'}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                  className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
