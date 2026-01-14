'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Car, Eye, EyeOff, Mail, Lock, User, Phone, MessageCircle } from 'lucide-react';

// Facebook SDK type declaration
declare global {
  interface Window {
    FB: any;
  }
}

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
  const { login } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user starts typing
  };

  const handleFacebookLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Initialize Facebook SDK if not already done
      if (typeof window !== 'undefined' && !window.FB) {
        await initializeFacebookSDK();
      }
      
      // Check login status
      window.FB.getLoginStatus((response: any) => {
        if (response.status === 'connected') {
          // User is logged in and authenticated
          handleFacebookResponse(response);
        } else {
          // User is not logged in, prompt login
          window.FB.login((response: any) => {
            if (response.authResponse) {
              handleFacebookResponse(response);
            } else {
              setError('تم إلغاء تسجيل الدخول بالفيس بوك');
              setLoading(false);
            }
          }, { scope: 'email,public_profile' });
        }
      });
    } catch (error) {
      console.error('Facebook login error:', error);
      setError('خطأ في تسجيل الدخول بالفيس بوك');
      setLoading(false);
    }
  };

  const initializeFacebookSDK = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.FB) {
        resolve();
        return;
      }

      // Load Facebook SDK
      if (document.getElementById('facebook-jssdk')) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src = 'https://connect.facebook.net/ar_AR/sdk.js';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        try {
          window.FB.init({
            appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '1234567890123456',
            cookie: true,
            xfbml: true,
            version: 'v18.0'
          });
          console.log('Facebook SDK initialized successfully');
          resolve();
        } catch (error) {
          console.error('Error initializing Facebook SDK:', error);
          reject(error);
        }
      };
      script.onerror = () => {
        console.error('Failed to load Facebook SDK');
        reject(new Error('Failed to load Facebook SDK'));
      };
      document.body.appendChild(script);
    });
  };

  const handleFacebookResponse = async (response: any) => {
    try {
      // Get user info from Facebook
      window.FB.api('/me', { fields: 'name,email,picture' }, async (userInfo: any) => {
        if (!userInfo.email) {
          setError('يجب السماح بالوصول للبريد الإلكتروني');
          setLoading(false);
          return;
        }

        // Send to our backend for authentication
        const authResponse = await fetch('/api/auth/facebook', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            facebookId: userInfo.id,
            name: userInfo.name,
            email: userInfo.email,
            picture: userInfo.picture?.data?.url,
            accessToken: response.authResponse.accessToken
          })
        });

        const authData = await authResponse.json();

        if (authResponse.ok) {
          console.log('Facebook login successful:', authData.user.name);
          login(authData.token, authData.user);
          
          // Show success message
          alert(`مرحباً ${authData.user.name}! تم تسجيل الدخول بنجاح`);
          
          router.push('/');
        } else {
          console.error('Facebook auth failed:', authData.error);
          setError(authData.error || 'خطأ في تسجيل الدخول بالفيس بوك');
        }
        setLoading(false);
      });
    } catch (error) {
      console.error('Facebook auth error:', error);
      setError('خطأ في المصادقة مع فيس بوك');
      setLoading(false);
    }
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

        if (response.ok && data.user) {
          // Login with new auth context, passing the token
          login(data.user, data.token);
          
          // Clear old localStorage items
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('isAdmin');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userName');
          localStorage.removeItem('userId');
          
          // Redirect based on role
          if (data.user.role === 'ADMIN') {
            router.push('/admin');
          } else if (data.user.role === 'SHOP_OWNER' || data.user.role === 'SELLER') {
            router.push('/admin/enhanced');
          } else {
            router.push('/profile');
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
          
          if (loginResponse.ok && loginData.user) {
            login(loginData.user, loginData.token);
            router.push('/profile');
          } else {
            // Registration successful but login failed - just show success
            alert('تم إنشاء الحساب بنجاح، يرجى تسجيل الدخول');
            setIsLogin(true);
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
    <div className="min-h-screen bg-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="flex items-center">
              <Car className="h-12 w-12 text-red-600 ml-3" />
              <h1 className="text-2xl font-bold text-white">Q8 <span className="text-red-600">Motors</span></h1>
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white">
            {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            {isLogin 
              ? 'ادخل للوصول لحسابك ومتابعة المزادات' 
              : 'انضم إلينا وابدأ في المزايدة على قطع الغيار'
            }
          </p>
        </div>

        {/* Form */}
        <div className="bg-gray-900 border border-gray-800 py-8 px-6 shadow-lg rounded-lg">
          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            <button
              type="button"
              onClick={handleFacebookLogin}
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-blue-600 rounded-lg shadow-sm bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 text-white ml-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd"/>
              </svg>
              {loading ? 'جاري الاتصال...' : (isLogin ? 'دخول بالفيس بوك' : 'إنشاء حساب بالفيس بوك')}
            </button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900 text-gray-400">أو استخدم البريد الإلكتروني</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name field (Registration only) */}
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white mb-1">
                  الاسم الكامل *
                </label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required={!isLogin}
                    value={formData.name}
                    onChange={handleInputChange}
                    className="appearance-none block w-full pr-10 pl-3 py-3 border border-gray-700 placeholder-gray-500 text-white bg-black rounded-lg focus:outline-none focus:ring-red-600 focus:border-red-600 focus:z-10 sm:text-sm"
                    placeholder="أدخل اسمك الكامل"
                  />
                </div>
              </div>
            )}

            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
                البريد الإلكتروني *
              </label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="appearance-none block w-full pr-10 pl-3 py-3 border border-gray-700 placeholder-gray-500 text-white bg-black rounded-lg focus:outline-none focus:ring-red-600 focus:border-red-600 focus:z-10 sm:text-sm"
                  placeholder="أدخل بريدك الإلكتروني"
                />
              </div>
            </div>

            {/* Phone field (Registration only) */}
            {!isLogin && (
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-white mb-1">
                  رقم الواتساب (اختياري)
                </label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="appearance-none block w-full pr-10 pl-3 py-3 border border-gray-700 placeholder-gray-500 text-white bg-black rounded-lg focus:outline-none focus:ring-red-600 focus:border-red-600 focus:z-10 sm:text-sm"
                    placeholder="+965 xxxxxxxx"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-400 flex items-center">
                  <MessageCircle className="h-3 w-3 ml-1" />
                  لتلقي إشعارات المزادات عبر واتساب
                </p>
              </div>
            )}

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-1">
                كلمة المرور *
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="appearance-none block w-full pr-10 pl-10 py-3 border border-gray-700 placeholder-gray-500 text-white bg-black rounded-lg focus:outline-none focus:ring-red-600 focus:border-red-600 focus:z-10 sm:text-sm"
                  placeholder="أدخل كلمة المرور"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {!isLogin && (
                <p className="mt-1 text-xs text-gray-400">
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
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                <p className="text-red-400 text-sm font-medium mb-1">🔑 للدخول كأدمن:</p>
                <p className="text-gray-300 text-xs">البريد: summit_kw@hotmail.com</p>
                <p className="text-gray-300 text-xs">كلمة المرور: 123123</p>
              </div>
            )}

            {/* Submit button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
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
                  className="text-sm text-red-500 hover:text-red-400"
                >
                  نسيت كلمة المرور؟ (إرسال عبر واتساب)
                </button>
              </div>
            )}

            {/* Toggle between login/register */}
            <div className="text-center">
              <p className="text-sm text-gray-400">
                {isLogin ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                    setFormData({ email: '', password: '', name: '', phone: '' });
                  }}
                  className="font-medium text-red-500 hover:text-red-400 mr-1"
                >
                  {isLogin ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
                </button>
              </p>
            </div>
          </form>
        </div>

        {/* Back to home */}
        <div className="text-center">
          <Link href="/" className="text-sm text-gray-400 hover:text-red-500">
            ← العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
