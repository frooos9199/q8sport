'use client';

import { useState } from 'react';
import Link from 'next/link';
import AuthWrapper from '@/components/AuthWrapper';
import { 
  Car, 
  ArrowLeft,
  Database,
  Shield,
  Settings,
  Globe,
  MessageCircle,
  Key,
  AlertTriangle,
  Save,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Server
} from 'lucide-react';

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  defaultLanguage: 'ar' | 'en';
  currency: string;
  timeZone: string;
  maintenanceMode: boolean;
  allowRegistrations: boolean;
  emailVerificationRequired: boolean;
  maxBidAmount: number;
  minBidIncrement: number;
  defaultAuctionDuration: number;
  whatsappEnabled: boolean;
  whatsappNumber: string;
  emailNotifications: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  lastBackup: string;
}

export default function AdvancedSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: 'مزادات قطع الغيار',
    siteDescription: 'موقع مزادات قطع غيار السيارات الأمريكية',
    defaultLanguage: 'ar',
    currency: 'KWD',
    timeZone: 'Asia/Kuwait',
    maintenanceMode: false,
    allowRegistrations: true,
    emailVerificationRequired: false,
    maxBidAmount: 50000,
    minBidIncrement: 10,
    defaultAuctionDuration: 7,
    whatsappEnabled: true,
    whatsappNumber: '+96599887766',
    emailNotifications: true,
    backupFrequency: 'daily',
    lastBackup: '2025-09-28 10:30:00'
  });

  const handleSave = async () => {
    setLoading(true);
    // Simulate saving
    setTimeout(() => {
      setLoading(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1500);
  };

  const handleBackup = () => {
    alert('تم بدء عملية النسخ الاحتياطي...');
  };

  const handleRestore = () => {
    if (confirm('هل أنت متأكد من استرداد النسخة الاحتياطية؟ سيتم فقدان البيانات الحالية!')) {
      alert('تم بدء عملية الاسترداد...');
    }
  };

  const handleClearCache = () => {
    alert('تم مسح الذاكرة المؤقتة بنجاح');
  };

  const renderGeneralTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            اسم الموقع
          </label>
          <input
            type="text"
            title="اسم الموقع"
            placeholder="أدخل اسم الموقع"
            value={settings.siteName}
            onChange={(e) => setSettings({...settings, siteName: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            اللغة الافتراضية
          </label>
          <select
            title="اختيار اللغة الافتراضية"
            value={settings.defaultLanguage}
            onChange={(e) => setSettings({...settings, defaultLanguage: e.target.value as 'ar' | 'en'})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ar">العربية</option>
            <option value="en">English</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            العملة
          </label>
          <select
            title="اختيار العملة"
            value={settings.currency}
            onChange={(e) => setSettings({...settings, currency: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="KWD">دينار كويتي (KWD)</option>
            <option value="USD">دولار أمريكي (USD)</option>
            <option value="EUR">يورو (EUR)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            المنطقة الزمنية
          </label>
          <select
            title="اختيار المنطقة الزمنية"
            value={settings.timeZone}
            onChange={(e) => setSettings({...settings, timeZone: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Asia/Kuwait">الكويت</option>
            <option value="Asia/Riyadh">السعودية</option>
            <option value="Asia/Dubai">الإمارات</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          وصف الموقع
        </label>
        <textarea
          title="وصف الموقع"
          placeholder="أدخل وصفاً مختصراً للموقع"
          value={settings.siteDescription}
          onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">وضع الصيانة</h3>
            <p className="text-sm text-gray-500">إيقاف الموقع مؤقتاً للصيانة</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              title="تفعيل وضع الصيانة"
              checked={settings.maintenanceMode}
              onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">السماح بالتسجيل</h3>
            <p className="text-sm text-gray-500">السماح للمستخدمين الجدد بالتسجيل</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              title="السماح بالتسجيلات الجديدة"
              checked={settings.allowRegistrations}
              onChange={(e) => setSettings({...settings, allowRegistrations: e.target.checked})}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderAuctionTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            أقصى مبلغ مزايدة (د.ك)
          </label>
          <input
            type="number"
            title="أقصى مبلغ مزايدة"
            placeholder="أدخل أقصى مبلغ مزايدة"
            value={settings.maxBidAmount}
            onChange={(e) => setSettings({...settings, maxBidAmount: parseInt(e.target.value)})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            أقل زيادة في المزايدة (د.ك)
          </label>
          <input
            type="number"
            title="أقل زيادة في المزايدة"
            placeholder="أدخل أقل زيادة مسموحة"
            value={settings.minBidIncrement}
            onChange={(e) => setSettings({...settings, minBidIncrement: parseInt(e.target.value)})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            مدة المزاد الافتراضية (أيام)
          </label>
          <input
            type="number"
            title="مدة المزاد الافتراضية"
            placeholder="أدخل عدد الأيام"
            value={settings.defaultAuctionDuration}
            onChange={(e) => setSettings({...settings, defaultAuctionDuration: parseInt(e.target.value)})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            رقم الواتساب
          </label>
          <input
            type="text"
            value={settings.whatsappNumber}
            onChange={(e) => setSettings({...settings, whatsappNumber: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="+965xxxxxxxx"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">تفعيل إشعارات واتساب</h3>
            <p className="text-sm text-gray-500">إرسال إشعارات المزادات عبر واتساب</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              title="تفعيل إشعارات واتساب"
              checked={settings.whatsappEnabled}
              onChange={(e) => setSettings({...settings, whatsappEnabled: e.target.checked})}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">تفعيل الإشعارات البريدية</h3>
            <p className="text-sm text-gray-500">إرسال إشعارات عبر البريد الإلكتروني</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              title="تفعيل الإشعارات البريدية"
              checked={settings.emailNotifications}
              onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderSystemTab = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-yellow-600 ml-2" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">تنبيه</h3>
            <p className="text-sm text-yellow-700 mt-1">
              هذه الإعدادات حساسة ويمكن أن تؤثر على النظام. تأكد من فهمك لما تفعله.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            تكرار النسخ الاحتياطي
          </label>
          <select
            title="اختيار تكرار النسخ الاحتياطي"
            value={settings.backupFrequency}
            onChange={(e) => setSettings({...settings, backupFrequency: e.target.value as any})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="daily">يومياً</option>
            <option value="weekly">أسبوعياً</option>
            <option value="monthly">شهرياً</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            آخر نسخة احتياطية
          </label>
          <input
            type="text"
            value={settings.lastBackup}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={handleBackup}
          className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Download className="h-5 w-5 ml-2" />
          نسخ احتياطي الآن
        </button>

        <button
          onClick={handleRestore}
          className="flex items-center justify-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
        >
          <Upload className="h-5 w-5 ml-2" />
          استرداد نسخة احتياطية
        </button>

        <button
          onClick={handleClearCache}
          className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          <RefreshCw className="h-5 w-5 ml-2" />
          مسح الذاكرة المؤقتة
        </button>
      </div>
    </div>
  );

  const tabs = [
    { id: 'general', name: 'عام', icon: Settings },
    { id: 'auction', name: 'المزادات', icon: Car },
    { id: 'notifications', name: 'الإشعارات', icon: MessageCircle },
    { id: 'system', name: 'النظام', icon: Server }
  ];

  return (
    <AuthWrapper requireAuth={true} requireAdmin={true}>
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <Link href="/admin" className="flex items-center text-gray-600 hover:text-blue-600 ml-4">
                  <ArrowLeft className="h-5 w-5 ml-1" />
                  العودة
                </Link>
                <Car className="h-8 w-8 text-blue-600 ml-3" />
                <h1 className="text-2xl font-bold text-gray-900">الإعدادات المتقدمة</h1>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="h-5 w-5 ml-2" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'general' && renderGeneralTab()}
              {activeTab === 'auction' && renderAuctionTab()}
              {activeTab === 'notifications' && renderNotificationsTab()}
              {activeTab === 'system' && renderSystemTab()}
            </div>

            {/* Save Button */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                onClick={handleSave}
                disabled={loading}
                className={`flex items-center px-6 py-2 rounded-lg font-medium ${
                  saved 
                    ? 'bg-green-600 text-white' 
                    : loading 
                      ? 'bg-gray-400 text-white cursor-not-allowed' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-5 w-5 ml-2 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : saved ? (
                  <>
                    <Save className="h-5 w-5 ml-2" />
                    تم الحفظ!
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 ml-2" />
                    حفظ الإعدادات
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AuthWrapper>
  );
}