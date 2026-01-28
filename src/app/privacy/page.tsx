import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'سياسة الخصوصية - Q8 Sport Car',
  description: 'سياسة الخصوصية وحماية البيانات لتطبيق Q8 Sport Car',
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          سياسة الخصوصية
        </h1>
        
        <div className="text-gray-700 space-y-6 leading-relaxed">
          <p className="text-sm text-gray-500 mb-8">
            آخر تحديث: 28 يناير 2026
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              1. مقدمة
            </h2>
            <p>
              نحن في Q8 Sport Car ("نحن"، "لنا"، "التطبيق") نلتزم بحماية خصوصيتك وبياناتك الشخصية. 
              توضح سياسة الخصوصية هذه كيفية جمعنا واستخدامنا وحماية المعلومات الشخصية التي تقدمها 
              عند استخدام تطبيقنا وموقعنا الإلكتروني.
            </p>
            <p>
              باستخدامك لتطبيق Q8 Sport Car، فإنك توافق على جمع واستخدام المعلومات وفقاً لهذه السياسة.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              2. المعلومات التي نجمعها
            </h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
              2.1 المعلومات الشخصية
            </h3>
            <p>عند التسجيل واستخدام التطبيق، قد نجمع المعلومات التالية:</p>
            <ul className="list-disc list-inside space-y-2 mr-6">
              <li>الاسم الكامل</li>
              <li>البريد الإلكتروني</li>
              <li>رقم الهاتف</li>
              <li>رقم الواتساب (اختياري)</li>
              <li>صورة الملف الشخصي (اختياري)</li>
              <li>معلومات المتجر/المحل (للبائعين)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
              2.2 معلومات المنتجات والمحتوى
            </h3>
            <ul className="list-disc list-inside space-y-2 mr-6">
              <li>المنتجات والسيارات التي تعرضها</li>
              <li>الصور والوصف</li>
              <li>الأسعار والمواصفات</li>
              <li>معلومات الاتصال المرتبطة بالمنتجات</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
              2.3 معلومات الاستخدام
            </h3>
            <ul className="list-disc list-inside space-y-2 mr-6">
              <li>سجلات النشاط داخل التطبيق</li>
              <li>تفضيلات البحث والفلترة</li>
              <li>المنتجات المفضلة</li>
              <li>الرسائل والمحادثات</li>
              <li>معلومات الجهاز (نوع الجهاز، نظام التشغيل)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
              2.4 الموقع الجغرافي (اختياري)
            </h3>
            <p>
              قد نطلب الوصول إلى موقعك الجغرافي لعرض المنتجات القريبة منك. 
              يمكنك رفض هذا الإذن في أي وقت من إعدادات جهازك.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              3. كيف نستخدم المعلومات
            </h2>
            <p>نستخدم المعلومات التي نجمعها للأغراض التالية:</p>
            <ul className="list-disc list-inside space-y-2 mr-6">
              <li>إنشاء وإدارة حسابك على التطبيق</li>
              <li>تمكينك من نشر وبيع وشراء السيارات وقطع الغيار</li>
              <li>التواصل معك بخصوص خدماتنا</li>
              <li>إرسال إشعارات حول نشاط حسابك</li>
              <li>تحسين تجربة المستخدم وخدماتنا</li>
              <li>منع الاحتيال وضمان الأمان</li>
              <li>الامتثال للمتطلبات القانونية</li>
              <li>تحليل استخدام التطبيق وتحسين الأداء</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              4. مشاركة المعلومات
            </h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
              4.1 المعلومات العامة
            </h3>
            <p>
              عند نشر منتج أو إعلان، ستكون المعلومات التالية مرئية للمستخدمين الآخرين:
            </p>
            <ul className="list-disc list-inside space-y-2 mr-6">
              <li>اسمك (إذا لم تختر إخفاءه)</li>
              <li>معلومات الاتصال المرتبطة بالمنتج (رقم الهاتف/الواتساب)</li>
              <li>تفاصيل المنتج وصوره</li>
              <li>معلومات المتجر (للبائعين)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
              4.2 عدم المشاركة مع طرف ثالث
            </h3>
            <p>
              <strong>نحن لا نبيع أو نؤجر أو نشارك معلوماتك الشخصية مع جهات خارجية</strong> 
              لأغراض تسويقية أو تجارية، إلا في الحالات التالية:
            </p>
            <ul className="list-disc list-inside space-y-2 mr-6">
              <li>بموافقتك الصريحة</li>
              <li>للامتثال للقوانين والأوامر القضائية</li>
              <li>لحماية حقوقنا وأمن مستخدمينا</li>
              <li>مع مزودي الخدمات الذين يساعدوننا في تشغيل التطبيق (مثل استضافة الخادم)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
              4.3 مزودو الخدمات
            </h3>
            <p>نستخدم خدمات الجهات الخارجية التالية:</p>
            <ul className="list-disc list-inside space-y-2 mr-6">
              <li><strong>Vercel:</strong> استضافة الموقع والتطبيق</li>
              <li><strong>Neon (PostgreSQL):</strong> قاعدة البيانات</li>
              <li><strong>Firebase:</strong> الإشعارات والمصادقة</li>
            </ul>
            <p>
              جميع هذه الجهات ملتزمة بحماية بياناتك وفقاً لمعايير الأمان العالمية.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              5. حماية المعلومات
            </h2>
            <p>نتخذ إجراءات أمنية صارمة لحماية معلوماتك، بما في ذلك:</p>
            <ul className="list-disc list-inside space-y-2 mr-6">
              <li><strong>تشفير البيانات:</strong> جميع البيانات المنقولة مشفرة باستخدام SSL/TLS</li>
              <li><strong>تشفير كلمات المرور:</strong> نستخدم bcrypt لتشفير كلمات المرور</li>
              <li><strong>المصادقة الآمنة:</strong> نظام JWT tokens للمصادقة</li>
              <li><strong>قاعدة بيانات آمنة:</strong> PostgreSQL مع حماية متقدمة</li>
              <li><strong>الوصول المحدود:</strong> فقط الموظفون المصرح لهم يمكنهم الوصول للبيانات</li>
              <li><strong>النسخ الاحتياطي:</strong> نسخ احتياطية منتظمة لحماية بياناتك</li>
              <li><strong>المراقبة المستمرة:</strong> رصد محاولات الاختراق والأنشطة المشبوهة</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              6. حقوقك
            </h2>
            <p>لديك الحقوق التالية فيما يتعلق بمعلوماتك الشخصية:</p>
            
            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
              6.1 الوصول والتعديل
            </h3>
            <p>يمكنك الوصول إلى معلوماتك الشخصية وتعديلها في أي وقت من خلال:</p>
            <ul className="list-disc list-inside space-y-2 mr-6">
              <li>صفحة "الملف الشخصي" في التطبيق</li>
              <li>التواصل معنا عبر البريد الإلكتروني</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
              6.2 الحذف
            </h3>
            <p>
              يمكنك طلب حذف حسابك وجميع بياناتك الشخصية. سنقوم بحذف معلوماتك خلال 30 يوماً 
              من تاريخ الطلب، مع الاحتفاظ فقط بالمعلومات المطلوبة قانونياً.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
              6.3 الاعتراض
            </h3>
            <p>يمكنك الاعتراض على معالجة بياناتك في أي وقت.</p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
              6.4 نقل البيانات
            </h3>
            <p>يمكنك طلب نسخة من بياناتك بصيغة قابلة للقراءة.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              7. ملفات تعريف الارتباط (Cookies)
            </h2>
            <p>
              نستخدم ملفات تعريف الارتباط وتقنيات مشابهة لتحسين تجربتك وتذكر تفضيلاتك. 
              يمكنك تعطيل ملفات تعريف الارتباط من إعدادات متصفحك.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              8. خصوصية الأطفال
            </h2>
            <p>
              تطبيقنا غير موجه للأطفال دون سن 18 عاماً. لا نجمع عن قصد معلومات شخصية 
              من الأطفال. إذا علمنا أننا جمعنا معلومات من طفل، سنقوم بحذفها فوراً.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              9. التغييرات على سياسة الخصوصية
            </h2>
            <p>
              قد نقوم بتحديث سياسة الخصوصية من وقت لآخر. سنخطرك بأي تغييرات جوهرية عبر:
            </p>
            <ul className="list-disc list-inside space-y-2 mr-6">
              <li>إشعار داخل التطبيق</li>
              <li>البريد الإلكتروني</li>
              <li>تحديث تاريخ "آخر تحديث" أعلى هذه الصفحة</li>
            </ul>
            <p>
              استمرارك في استخدام التطبيق بعد أي تغييرات يعني موافقتك على السياسة المحدثة.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              10. الامتثال القانوني
            </h2>
            <p>
              هذه السياسة متوافقة مع:
            </p>
            <ul className="list-disc list-inside space-y-2 mr-6">
              <li>قوانين دولة الكويت</li>
              <li>قانون حماية البيانات الشخصية</li>
              <li>متطلبات Apple App Store</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              11. التواصل معنا
            </h2>
            <p>
              إذا كان لديك أي أسئلة أو استفسارات حول سياسة الخصوصية أو ممارسات حماية البيانات، 
              يمكنك التواصل معنا عبر:
            </p>
            <div className="bg-gray-100 p-6 rounded-lg mt-4">
              <p className="font-semibold mb-2">Q8 Sport Car</p>
              <p><strong>البريد الإلكتروني:</strong> privacy@q8sportcar.com</p>
              <p><strong>الدعم:</strong> support@q8sportcar.com</p>
              <p><strong>الموقع:</strong> www.q8sportcar.com</p>
              <p className="mt-2 text-sm text-gray-600">دولة الكويت</p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              12. الموافقة
            </h2>
            <p>
              باستخدامك لتطبيق Q8 Sport Car، فإنك توافق على جمع واستخدام المعلومات 
              كما هو موضح في سياسة الخصوصية هذه.
            </p>
          </section>

          <div className="border-t-2 border-gray-200 mt-12 pt-8 text-center text-sm text-gray-500">
            <p>آخر تحديث: 28 يناير 2026</p>
            <p className="mt-2">© 2026 Q8 Sport Car. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
