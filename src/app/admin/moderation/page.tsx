'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Report {
  id: string;
  contentType: string;
  contentId: string;
  reason: string;
  details: string | null;
  status: string;
  priority: string;
  createdAt: string;
  reportedBy: {
    id: string;
    name: string;
    email: string;
  };
}

export default function ModerationDashboard() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  useEffect(() => {
    fetchReports();
  }, [filter]);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`/api/moderation/report?status=${filter}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          alert('غير مصرح لك بالوصول لهذه الصفحة');
          router.push('/');
          return;
        }
        throw new Error('Failed to fetch reports');
      }

      const data = await response.json();
      setReports(data.reports);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const takeAction = async (
    reportId: string,
    actionType: string,
    reason: string
  ) => {
    try {
      const token = localStorage.getItem('token');
      const report = reports.find((r) => r.id === reportId);
      if (!report) return;

      const response = await fetch('/api/moderation/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reportId,
          actionType,
          reason,
          targetType: report.contentType,
          targetId: report.contentId,
          resolution: `Moderation action: ${actionType}`,
        }),
      });

      if (!response.ok) throw new Error('Failed to take action');

      const data = await response.json();
      alert(data.message);
      fetchReports();
      setSelectedReport(null);
    } catch (error) {
      console.error('Error taking action:', error);
      alert('حدث خطأ أثناء تنفيذ الإجراء');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-red-600 text-white';
      case 'HIGH':
        return 'bg-orange-500 text-white';
      case 'MEDIUM':
        return 'bg-yellow-500 text-white';
      case 'LOW':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getReasonText = (reason: string) => {
    const reasonMap: { [key: string]: string } = {
      INAPPROPRIATE_CONTENT: 'محتوى غير لائق',
      SPAM: 'محتوى مزعج',
      HARASSMENT: 'تحرش',
      FRAUD: 'احتيال',
      FAKE_INFORMATION: 'معلومات مضللة',
      COPYRIGHT: 'انتهاك حقوق ملكية',
      VIOLENT_CONTENT: 'محتوى عنيف',
      HATE_SPEECH: 'خطاب كراهية',
      ADULT_CONTENT: 'محتوى للبالغين',
      ILLEGAL_ACTIVITY: 'نشاط غير قانوني',
      OTHER: 'أخرى',
    };
    return reasonMap[reason] || reason;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-8 px-4" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">
          🛡️ لوحة المراقبة والإشراف
        </h1>

        {/* Filters */}
        <div className="bg-gray-900 rounded-lg p-6 mb-6 border border-red-600">
          <div className="flex gap-4 flex-wrap">
            {['PENDING', 'REVIEWING', 'RESOLVED', 'DISMISSED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  filter === status
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {status === 'PENDING' && 'قيد المراجعة'}
                {status === 'REVIEWING' && 'جاري المراجعة'}
                {status === 'RESOLVED' && 'تم الحل'}
                {status === 'DISMISSED' && 'مرفوض'}
              </button>
            ))}
          </div>
        </div>

        {/* Reports Grid */}
        {reports.length === 0 ? (
          <div className="bg-gray-900 rounded-lg p-12 text-center border border-gray-700">
            <p className="text-gray-400 text-lg">لا توجد بلاغات {filter}</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-gray-900 rounded-lg p-6 border border-gray-700 hover:border-red-600 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${getPriorityColor(
                        report.priority
                      )}`}
                    >
                      {report.priority}
                    </span>
                    <span className="mr-3 text-gray-400">
                      {report.contentType}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {new Date(report.createdAt).toLocaleString('ar-KW')}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-red-500 font-semibold mb-2">
                    السبب: {getReasonText(report.reason)}
                  </p>
                  {report.details && (
                    <p className="text-gray-300 text-sm">{report.details}</p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  <div className="text-sm text-gray-400">
                    أبلغ بواسطة: <span className="text-white">{report.reportedBy.name}</span>
                  </div>

                  {report.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          takeAction(
                            report.id,
                            'CONTENT_REMOVED',
                            `محتوى مخالف: ${getReasonText(report.reason)}`
                          )
                        }
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
                      >
                        حذف المحتوى
                      </button>
                      <button
                        onClick={() =>
                          takeAction(
                            report.id,
                            'WARNING',
                            `تحذير بخصوص: ${getReasonText(report.reason)}`
                          )
                        }
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-semibold"
                      >
                        تحذير
                      </button>
                      <button
                        onClick={() =>
                          takeAction(report.id, 'NO_ACTION', 'لا يوجد مخالفة')
                        }
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-semibold"
                      >
                        رفض البلاغ
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
