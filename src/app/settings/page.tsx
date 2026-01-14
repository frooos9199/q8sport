'use client';

import { useState } from 'react';
import Link from 'next/link';
import AuthWrapper from '@/components/AuthWrapper';
import AdvertisementBanner from '@/components/ui/AdvertisementBanner';
import { 
  User, ArrowLeft, Camera, Mail, Phone, MapPin, 
  Shield, Bell, CreditCard, Key, Save, AlertCircle,
  CheckCircle, Settings, Trash2, Eye, EyeOff
} from 'lucide-react';

export default function UserSettings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    whatsapp: true,
    bidUpdates: true,
    auctionEnd: true,
    newMessages: true
  });

  const [profile, setProfile] = useState({
    name: 'أحمد محمد الخليفي',
    email: 'ahmed.alkhalifi@email.com',
    phone: '+965 9876 5432',
    location: 'الكويت، حولي',
    bio: 'محب لسيارات Ford Mustang وأبحث عن قطع غيار أصلية عالية الجودة.',
    avatar: null
  });

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-6">المعلومات الشخصية</h3>
        
        {/* Avatar Upload */}
        <div className="flex items-center space-x-6 mb-6">
          <div className="w-24 h-24 bg-red-600/20 rounded-full flex items-center justify-center border border-red-600/30">
            <User className="h-12 w-12 text-red-600" />
          </div>
          <div>
            <button className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              <Camera className="h-5 w-5 ml-2" />
              تغيير الصورة
            </button>
            <p className="text-sm text-gray-400 mt-2">PNG, JPG حتى 2MB</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">الاسم الكامل</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({...profile, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-700 bg-black text-white rounded-lg focus:ring-red-600 focus:border-red-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">البريد الإلكتروني</label>
            <input
              type="email"
              title="البريد الإلكتروني"
              placeholder="أدخل بريدك الإلكتروني"
              value={profile.email}
              onChange={(e) => setProfile({...profile, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-700 bg-black text-white rounded-lg focus:ring-red-600 focus:border-red-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">رقم الهاتف</label>
            <input
              type="tel"
              title="رقم الهاتف"
              placeholder="أدخل رقم هاتفك"
              value={profile.phone}
              onChange={(e) => setProfile({...profile, phone: e.target.value})}
              className="w-full px-3 py-2 border border-gray-700 bg-black text-white rounded-lg focus:ring-red-600 focus:border-red-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">الموقع</label>
            <input
              type="text"
              value={profile.location}
              onChange={(e) => setProfile({...profile, location: e.target.value})}
              className="w-full px-3 py-2 border border-gray-700 bg-black text-white rounded-lg focus:ring-red-600 focus:border-red-600"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-white mb-2">نبذة شخصية</label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({...profile, bio: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-700 bg-black text-white rounded-lg focus:ring-red-600 focus:border-red-600"
              placeholder="اكتب نبذة مختصرة عن نفسك واهتماماتك..."
            />
          </div>
        </div>
      </div>

      {/* Verification Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">حالة التحقق</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 ml-3" />
              <div>
                <p className="font-medium text-green-900">البريد الإلكتروني</p>
                <p className="text-sm text-green-600">تم التحقق بنجاح</p>
              </div>
            </div>
            <span className="text-green-600 font-medium">مؤكد</span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-600 ml-3" />
              <div>
                <p className="font-medium text-yellow-900">رقم الهاتف</p>
                <p className="text-sm text-yellow-600">في انتظار التحقق</p>
              </div>
            </div>
            <button className="text-yellow-600 font-medium hover:text-yellow-700">
              تحقق الآن
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 ml-3" />
              <div>
                <p className="font-medium text-red-900">الهوية</p>
                <p className="text-sm text-red-600">غير مؤكدة</p>
              </div>
            </div>
            <button className="text-red-600 font-medium hover:text-red-700">
              رفع الوثائق
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">الأمان وكلمة المرور</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور الحالية</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 pl-10"
                placeholder="أدخل كلمة المرور الحالية"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور الجديدة</label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="أدخل كلمة المرور الجديدة"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">تأكيد كلمة المرور</label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="أعد إدخال كلمة المرور"
              />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">متطلبات كلمة المرور:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• على الأقل 8 أحرف</li>
              <li>• تحتوي على حروف كبيرة وصغيرة</li>
              <li>• تحتوي على أرقام</li>
              <li>• تحتوي على رموز خاصة</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Two Factor Authentication */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">التحقق الثنائي</h3>
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">التحقق الثنائي عبر SMS</p>
            <p className="text-sm text-gray-500">حماية إضافية لحسابك</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {/* Login Sessions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">جلسات تسجيل الدخول</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Windows - Chrome</p>
              <p className="text-sm text-gray-500">الكويت • نشط الآن</p>
            </div>
            <span className="text-green-600 text-sm">الجهاز الحالي</span>
          </div>
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">iPhone - Safari</p>
              <p className="text-sm text-gray-500">الكويت • منذ يومين</p>
            </div>
            <button className="text-red-600 text-sm hover:text-red-700">إنهاء الجلسة</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">إعدادات الإشعارات</h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">إشعارات البريد الإلكتروني</p>
              <p className="text-sm text-gray-500">تلقي الإشعارات عبر البريد الإلكتروني</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={notifications.email}
                onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">إشعارات الواتساب</p>
              <p className="text-sm text-gray-500">تلقي الإشعارات عبر الواتساب</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={notifications.whatsapp}
                onChange={(e) => setNotifications({...notifications, whatsapp: e.target.checked})}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">تحديثات المزايدة</p>
              <p className="text-sm text-gray-500">عند وجود مزايدة جديدة على المزادات التي تتابعها</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={notifications.bidUpdates}
                onChange={(e) => setNotifications({...notifications, bidUpdates: e.target.checked})}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">انتهاء المزاد</p>
              <p className="text-sm text-gray-500">عند انتهاء المزادات التي تشارك فيها</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={notifications.auctionEnd}
                onChange={(e) => setNotifications({...notifications, auctionEnd: e.target.checked})}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">الرسائل الجديدة</p>
              <p className="text-sm text-gray-500">عند تلقي رسائل من البائعين أو المشترين</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={notifications.newMessages}
                onChange={(e) => setNotifications({...notifications, newMessages: e.target.checked})}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Notification Schedule */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">أوقات الإشعارات</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">بداية اليوم</label>
            <input
              type="time"
              defaultValue="08:00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">نهاية اليوم</label>
            <input
              type="time"
              defaultValue="22:00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          لن تتلقى إشعارات خارج هذه الأوقات إلا في الحالات العاجلة
        </p>
      </div>
    </div>
  );

  const renderAccountSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">إعدادات الحساب</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">اللغة المفضلة</label>
            <select 
              title="اختيار اللغة المفضلة"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ar">العربية</option>
              <option value="en">English</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">المنطقة الزمنية</label>
            <select 
              title="اختيار المنطقة الزمنية"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Asia/Kuwait">الكويت (GMT+3)</option>
              <option value="Asia/Riyadh">الرياض (GMT+3)</option>
              <option value="Asia/Dubai">دبي (GMT+4)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">العملة المفضلة</label>
            <select 
              title="اختيار العملة المفضلة"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="KWD">دينار كويتي (KWD)</option>
              <option value="SAR">ريال سعودي (SAR)</option>
              <option value="AED">درهم إماراتي (AED)</option>
              <option value="USD">دولار أمريكي (USD)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">الخصوصية</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">إظهار بيانات التواصل للجميع</p>
              <p className="text-sm text-gray-500">السماح للمستخدمين برؤية بريدك الإلكتروني ورقمك</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                title="إظهار بيانات التواصل"
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">إظهار تاريخ المزايدات</p>
              <p className="text-sm text-gray-500">السماح للآخرين برؤية تاريخ مزايداتك</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-lg shadow p-6 border border-red-200">
        <h3 className="text-lg font-semibold text-red-900 mb-4">منطقة خطر</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
            <div>
              <p className="font-medium text-red-900">إلغاء تفعيل الحساب</p>
              <p className="text-sm text-red-600">إخفاء حسابك مؤقتاً دون حذف البيانات</p>
            </div>
            <button className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-100">
              إلغاء التفعيل
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
            <div>
              <p className="font-medium text-red-900">حذف الحساب نهائياً</p>
              <p className="text-sm text-red-600">حذف جميع بياناتك نهائياً - لا يمكن التراجع</p>
            </div>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center">
              <Trash2 className="h-4 w-4 ml-2" />
              حذف الحساب
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <AuthWrapper requireAuth={true}>
      <div className="min-h-screen bg-black">
        {/* Header */}
        <div className="bg-gradient-to-r from-black via-gray-900 to-black border-b border-red-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link 
                  href="/profile" 
                  className="flex items-center text-gray-400 hover:text-white ml-4 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 ml-1" />
                  العودة للملف الشخصي
                </Link>
                <Settings className="h-10 w-10 ml-4 text-red-600" />
                <div>
                  <h1 className="text-3xl font-bold">إعدادات الحساب</h1>
                  <p className="text-gray-400 mt-1">إدارة حسابك وتخصيص إعداداتك</p>
                </div>
              </div>
            </div>
          </div>
          <AdvertisementBanner className="mt-4" />
        </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-gray-900 rounded-lg border border-gray-800 p-6 ml-8">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center px-4 py-2 text-right rounded-lg ${
                  activeTab === 'profile'
                    ? 'bg-red-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800'
                }`}
              >
                <User className="h-5 w-5 ml-3" />
                الملف الشخصي
              </button>
              
              <button
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center px-4 py-2 text-right rounded-lg ${
                  activeTab === 'security'
                    ? 'bg-red-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800'
                }`}
              >
                <Shield className="h-5 w-5 ml-3" />
                الأمان
              </button>
              
              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center px-4 py-2 text-right rounded-lg ${
                  activeTab === 'notifications'
                    ? 'bg-red-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800'
                }`}
              >
                <Bell className="h-5 w-5 ml-3" />
                الإشعارات
              </button>
              
              <button
                onClick={() => setActiveTab('account')}
                className={`w-full flex items-center px-4 py-2 text-right rounded-lg ${
                  activeTab === 'account'
                    ? 'bg-red-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800'
                }`}
              >
                <Settings className="h-5 w-5 ml-3" />
                إعدادات الحساب
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'profile' && renderProfileSettings()}
            {activeTab === 'security' && renderSecuritySettings()}
            {activeTab === 'notifications' && renderNotificationSettings()}
            {activeTab === 'account' && renderAccountSettings()}

            {/* Save Button */}
            <div className="mt-8 flex justify-end space-x-3">
              <button className="px-6 py-2 border border-gray-700 text-gray-400 rounded-lg hover:bg-gray-900">
                إلغاء
              </button>
              <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center">
                <Save className="h-5 w-5 ml-2" />
                حفظ التغييرات
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </AuthWrapper>
  );
}
