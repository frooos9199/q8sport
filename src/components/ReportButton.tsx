'use client';

import { useState } from 'react';

interface ReportButtonProps {
  contentType: 'PRODUCT' | 'SHOWCASE' | 'COMMENT' | 'REVIEW' | 'REQUEST' | 'MESSAGE' | 'USER_PROFILE';
  contentId: string;
  className?: string;
}

export default function ReportButton({ contentType, contentId, className = '' }: ReportButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const reportReasons = [
    { value: 'INAPPROPRIATE_CONTENT', label: 'محتوى غير لائق' },
    { value: 'SPAM', label: 'محتوى مزعج أو دعائي' },
    { value: 'HARASSMENT', label: 'تحرش أو إساءة' },
    { value: 'FRAUD', label: 'احتيال أو نصب' },
    { value: 'FAKE_INFORMATION', label: 'معلومات مضللة' },
    { value: 'COPYRIGHT', label: 'انتهاك حقوق ملكية' },
    { value: 'VIOLENT_CONTENT', label: 'محتوى عنيف' },
    { value: 'HATE_SPEECH', label: 'خطاب كراهية' },
    { value: 'ADULT_CONTENT', label: 'محتوى للبالغين' },
    { value: 'ILLEGAL_ACTIVITY', label: 'نشاط غير قانوني' },
    { value: 'OTHER', label: 'أخرى' },
  ];

  const handleReport = async () => {
    if (!reason) {
      alert('يرجى اختيار سبب البلاغ');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('يجب تسجيل الدخول أولاً');
        setShowModal(false);
        return;
      }

      const response = await fetch('/api/moderation/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          contentType,
          contentId,
          reason,
          details,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل إرسال البلاغ');
      }

      alert(data.message || 'تم إرسال البلاغ بنجاح. شكراً لمساعدتك في الحفاظ على مجتمع آمن.');
      setShowModal(false);
      setReason('');
      setDetails('');
    } catch (error: any) {
      console.error('Error reporting content:', error);
      alert(error.message || 'حدث خطأ أثناء إرسال البلاغ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors ${className}`}
        title="الإبلاغ عن محتوى مخالف"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
          />
        </svg>
        <span className="text-sm font-semibold">إبلاغ</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" dir="rtl">
          <div className="bg-gray-900 rounded-lg max-w-md w-full p-6 border border-red-600">
            <h2 className="text-2xl font-bold text-white mb-4">
              🚩 إبلاغ عن محتوى مخالف
            </h2>

            <p className="text-gray-300 mb-4 text-sm">
              ساعدنا في الحفاظ على مجتمع آمن. سيتم مراجعة بلاغك خلال 24 ساعة.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-white font-semibold mb-2">
                  سبب البلاغ <span className="text-red-500">*</span>
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-red-600 focus:outline-none"
                >
                  <option value="">اختر السبب</option>
                  {reportReasons.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  تفاصيل إضافية (اختياري)
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-red-600 focus:outline-none"
                  rows={3}
                  placeholder="أضف أي تفاصيل إضافية تساعدنا في المراجعة..."
                />
              </div>

              <div className="bg-yellow-900 bg-opacity-30 border border-yellow-600 rounded-lg p-3">
                <p className="text-yellow-400 text-sm">
                  ⚠️ البلاغات الكاذبة قد تؤدي إلى إجراءات على حسابك
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleReport}
                  disabled={loading || !reason}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'جاري الإرسال...' : 'إرسال البلاغ'}
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
