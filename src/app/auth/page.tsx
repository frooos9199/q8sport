'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Car, Eye, EyeOff, Mail, Lock, User, Phone, MessageCircle } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user starts typing
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Login via API
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        });

        const data = await response.json();

        if (response.ok) {
          // Store auth data
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('isAdmin', data.user.role === 'ADMIN' ? 'true' : 'false');
          localStorage.setItem('userEmail', data.user.email);
          localStorage.setItem('userName', data.user.name);
          localStorage.setItem('userId', data.user.id);
          localStorage.setItem('authToken', data.token);

          // Redirect based on role
          if (data.user.role === 'ADMIN') {
            router.push('/admin');
          } else {
            router.push('/');
          }
        } else {
          setError(data.error || 'حدث خطأ في تسجيل الدخول');
        }
      } else {
        // Registration via API
        if (!formData.email || !formData.password || !formData.name) {
          setError('يرجى ملء جميع الحقول المطلوبة');
          return;
        }
        
        if (formData.password.length < 6) {
          setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
          return;
        }

        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
            whatsapp: formData.phone
          })
        });

        const data = await response.json();

        if (response.ok) {
          // Auto-login after successful registration
          const loginResponse = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: formData.email,
              password: formData.password
            })
          });

          const loginData = await loginResponse.json();

          if (loginResponse.ok) {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('isAdmin', 'false');
            localStorage.setItem('userEmail', loginData.user.email);
            localStorage.setItem('userName', loginData.user.name);
            localStorage.setItem('userId', loginData.user.id);
            localStorage.setItem('authToken', loginData.token);
            router.push('/');
          } else {
            setError(loginData.error || 'حدث خطأ في تسجيل الدخول بعد التسجيل');
          }
        } else {
          setError(data.error || 'حدث خطأ في إنشاء الحساب');
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError('حدث خطأ في الاتصال، يرجى المحاولة مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!formData.email) {
      setError('يرجى إدخال البريد الإلكتروني أولاً');
      return;
    }
    
    // Simulate WhatsApp notification
    alert('تم إرسال رابط إعادة تعيين كلمة المرور عبر واتساب والبريد الإلكتروني');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="flex items-center">
              <Car className="h-12 w-12 text-blue-600 ml-3" />
              <h1 className="text-2xl font-bold text-gray-900">Q8 MAZAD SPORT</h1>
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
          </h2>
          <p className="mt-2 text-sm text-gray-800">
            {isLogin 
              ? 'ادخل للوصول لحسابك ومتابعة المزادات' 
              : 'انضم إلينا وابدأ في المزايدة على قطع الغيار'
            }
          </p>
        </div>

        {/* Form */}
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name field (Registration only) */}
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  الاسم الكامل *
                </label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required={!isLogin}
                    value={formData.name}
                    onChange={handleInputChange}
                    className="appearance-none block w-full pr-10 pl-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="أدخل اسمك الكامل"
                  />
                </div>
              </div>
            )}

            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                البريد الإلكتروني *
              </label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="appearance-none block w-full pr-10 pl-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="أدخل بريدك الإلكتروني"
                />
              </div>
            </div>

            {/* Phone field (Registration only) */}
            {!isLogin && (
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  رقم الواتساب (اختياري)
                </label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="appearance-none block w-full pr-10 pl-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="+965 xxxxxxxx"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-700 flex items-center">
                  <MessageCircle className="h-3 w-3 ml-1" />
                  لتلقي إشعارات المزادات عبر واتساب
                </p>
              </div>
            )}

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                كلمة المرور *
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="appearance-none block w-full pr-10 pl-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="أدخل كلمة المرور"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {!isLogin && (
                <p className="mt-1 text-xs text-gray-700">
                  يجب أن تحتوي على 6 أحرف على الأقل
                </p>
              )}
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Admin demo credentials */}
            {isLogin && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 text-sm font-medium mb-1">🔑 للدخول كأدمن:</p>
                <p className="text-blue-700 text-xs">البريد: summit_kw@hotmail.com</p>
                <p className="text-blue-700 text-xs">كلمة المرور: 123123</p>
              </div>
            )}

            {/* Submit button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                    {isLogin ? 'جاري تسجيل الدخول...' : 'جاري إنشاء الحساب...'}
                  </div>
                ) : (
                  isLogin ? 'تسجيل الدخول' : 'إنشاء الحساب'
                )}
              </button>
            </div>

            {/* Forgot password (Login only) */}
            {isLogin && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  نسيت كلمة المرور؟ (إرسال عبر واتساب)
                </button>
              </div>
            )}

            {/* Toggle between login/register */}
            <div className="text-center">
              <p className="text-sm text-gray-800">
                {isLogin ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                    setFormData({ email: '', password: '', name: '', phone: '' });
                  }}
                  className="font-medium text-blue-600 hover:text-blue-500 mr-1"
                >
                  {isLogin ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
                </button>
              </p>
            </div>
          </form>
        </div>

        {/* Back to home */}
        <div className="text-center">
          <Link href="/" className="text-sm text-gray-800 hover:text-blue-600">
            ← العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}