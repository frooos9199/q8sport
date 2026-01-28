import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'الدعم والمساعدة - Q8 Sport Car',
  description: 'تواصل مع فريق الدعم الفني لتطبيق Q8 Sport Car',
};

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 text-center">
            الدعم والمساعدة
          </h1>
          <p className="text-center text-gray-600 mb-8">
            نحن هنا لمساعدتك! تواصل معنا في أي وقت
          </p>

          {/* Contact Information */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-blue-900 mb-4">
                📧 البريد الإلكتروني
              </h3>
              <div className="space-y-2">
                <p>
                  <strong>الدعم الفني:</strong>
                  <br />
                  <a href="mailto:support@q8sportcar.com" className="text-blue-600 hover:underline">
                    support@q8sportcar.com
                  </a>
                </p>
                <p>
                  <strong>الاستفسارات العامة:</strong>
                  <br />
                  <a href="mailto:info@q8sportcar.com" className="text-blue-600 hover:underline">
                    info@q8sportcar.com
                  </a>
                </p>
                <p>
                  <strong>الشكاوى:</strong>
                  <br />
                  <a href="mailto:complaints@q8sportcar.com" className="text-blue-600 hover:underline">
                    complaints@q8sportcar.com
                  </a>
                </p>
              </div>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-green-900 mb-4">
                ⏱️ أوقات العمل
              </h3>
              <div className="space-y-2">
                <p><strong>الأحد - الخميس:</strong> 9:00 ص - 6:00 م</p>
                <p><strong>الجمعة - السبت:</strong> مغلق</p>
                <p className="text-sm text-gray-600 mt-4">
                  وقت الاستجابة: 24-48 ساعة عمل
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              الأسئلة الشائعة
            </h2>
            
            <div className="space-y-4">
              <details className="bg-gray-50 p-4 rounded-lg">
                <summary className="font-semibold cursor-pointer text-gray-900">
                  كيف أقوم بإضافة منتج جديد؟
                </summary>
                <p className="mt-2 text-gray-700">
                  من الصفحة الرئيسية، اضغط على زر "+" أو "إضافة منتج"، ثم املأ البيانات 
                  المطلوبة (النوع، السعر، الوصف، الصور) واضغط على "نشر".
                </p>
              </details>

              <details className="bg-gray-50 p-4 rounded-lg">
                <summary className="font-semibold cursor-pointer text-gray-900">
                  كيف يمكنني تعديل معلومات حسابي؟
                </summary>
                <p className="mt-2 text-gray-700">
                  من القائمة الرئيسية، اختر "الملف الشخصي"، ثم "تعديل الملف الشخصي". 
                  يمكنك تحديث الاسم، الصورة، رقم الهاتف، والمعلومات الأخرى.
                </p>
              </details>

              <details className="bg-gray-50 p-4 rounded-lg">
                <summary className="font-semibold cursor-pointer text-gray-900">
                  نسيت كلمة المرور، ماذا أفعل؟
                </summary>
                <p className="mt-2 text-gray-700">
                  في صفحة تسجيل الدخول، اضغط على "نسيت كلمة المرور"، ثم أدخل بريدك 
                  الإلكتروني. سنرسل لك رابط إعادة تعيين كلمة المرور.
                </p>
              </details>

              <details className="bg-gray-50 p-4 rounded-lg">
                <summary className="font-semibold cursor-pointer text-gray-900">
                  كيف أحذف حسابي؟
                </summary>
                <p className="mt-2 text-gray-700">
                  اتصل بنا على support@q8sportcar.com وسنقوم بحذف حسابك وجميع بياناتك 
                  خلال 30 يوماً.
                </p>
              </details>

              <details className="bg-gray-50 p-4 rounded-lg">
                <summary className="font-semibold cursor-pointer text-gray-900">
                  هل يمكنني البيع من خارج الكويت؟
                </summary>
                <p className="mt-2 text-gray-700">
                  التطبيق مخصص للمستخدمين في دولة الكويت فقط حالياً.
                </p>
              </details>

              <details className="bg-gray-50 p-4 rounded-lg">
                <summary className="font-semibold cursor-pointer text-gray-900">
                  كيف أبلغ عن محتوى مخالف؟
                </summary>
                <p className="mt-2 text-gray-700">
                  يمكنك الإبلاغ عن أي محتوى مخالف من خلال زر "الإبلاغ" في صفحة المنتج، 
                  أو التواصل معنا مباشرة على complaints@q8sportcar.com
                </p>
              </details>
            </div>
          </div>

          {/* Quick Links */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              روابط مفيدة
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <a href="/privacy" className="text-blue-600 hover:underline">
                سياسة الخصوصية
              </a>
              <a href="/terms" className="text-blue-600 hover:underline">
                شروط الخدمة
              </a>
              <a href="/" className="text-blue-600 hover:underline">
                الصفحة الرئيسية
              </a>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            أرسل لنا رسالة
          </h2>
          <form className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                الاسم
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="اسمك الكامل"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="email@example.com"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                الموضوع
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="موضوع الرسالة"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                الرسالة
              </label>
              <textarea
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="اكتب رسالتك هنا..."
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              إرسال الرسالة
            </button>
          </form>
          
          <p className="text-sm text-gray-500 text-center mt-4">
            أو راسلنا مباشرة على: 
            <a href="mailto:support@q8sportcar.com" className="text-blue-600 hover:underline mx-1">
              support@q8sportcar.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
