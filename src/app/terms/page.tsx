import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'شروط الخدمة - Q8 Sport Car',
  description: 'شروط وأحكام استخدام تطبيق Q8 Sport Car',
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          شروط وأحكام الخدمة
        </h1>
        
        <div className="text-gray-700 space-y-6 leading-relaxed">
          <p className="text-sm text-gray-500 mb-8">
            آخر تحديث: 28 يناير 2026
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              1. مقدمة وقبول الشروط
            </h2>
            <p>
              مرحباً بك في تطبيق Q8 Sport Car ("التطبيق"، "المنصة"، "الخدمة"). 
              تُحكم هذه الشروط والأحكام ("الشروط") استخدامك للتطبيق والموقع الإلكتروني 
              والخدمات المتعلقة به.
            </p>
            <p>
              <strong>باستخدامك للتطبيق، فإنك توافق على الالتزام بهذه الشروط.</strong> 
              إذا كنت لا توافق على أي جزء من هذه الشروط، يجب عليك التوقف عن استخدام التطبيق فوراً.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              2. وصف الخدمة
            </h2>
            <p>
              Q8 Sport Car هي منصة إلكترونية تربط بين البائعين والمشترين للسيارات الرياضية 
              وقطع الغيار في دولة الكويت. نحن نوفر:
            </p>
            <ul className="list-disc list-inside space-y-2 mr-6">
              <li>عرض وبيع السيارات الرياضية وقطع الغيار</li>
              <li>البحث والتصفح للمنتجات المتاحة</li>
              <li>نظام المراسلة بين المستخدمين</li>
              <li>نظام المفضلة والإشعارات</li>
              <li>إدارة المتاجر والمحلات</li>
              <li>نظام المطلوبات (Wanted Items)</li>
            </ul>
            <p className="mt-4">
              <strong>ملاحظة مهمة:</strong> نحن منصة وسيطة فقط ولسنا طرفاً في أي معاملة 
              بين البائعين والمشترين. لا نتحمل أي مسؤولية عن جودة المنتجات أو صحة المعلومات 
              المقدمة من المستخدمين.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              3. التسجيل والحساب
            </h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
              3.1 متطلبات التسجيل
            </h3>
            <ul className="list-disc list-inside space-y-2 mr-6">
              <li>يجب أن يكون عمرك 18 عاماً أو أكثر</li>
              <li>يجب تقديم معلومات صحيحة ودقيقة</li>
              <li>يجب الحفاظ على سرية كلمة المرور</li>
              <li>لكل شخص حساب واحد فقط</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
              3.2 مسؤولية الحساب
            </h3>
            <p>
              أنت مسؤول بالكامل عن جميع الأنشطة التي تتم من خلال حسابك. يجب عليك:
            </p>
            <ul className="list-disc list-inside space-y-2 mr-6">
              <li>الحفاظ على أمان بيانات الدخول</li>
              <li>إخطارنا فوراً في حالة الاستخدام غير المصرح به</li>
              <li>عدم مشاركة حسابك مع الآخرين</li>
              <li>تحديث معلوماتك بانتظام</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
              3.3 إنهاء الحساب
            </h3>
            <p>
              يمكنك حذف حسابك في أي وقت. نحتفظ بالحق في تعليق أو إنهاء حسابك في حالة 
              انتهاك هذه الشروط.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              4. قواعد استخدام المحتوى
            </h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
              4.1 المحتوى المسموح
            </h3>
            <p>يمكنك نشر:</p>
            <ul className="list-disc list-inside space-y-2 mr-6">
              <li>إعلانات السيارات الرياضية وقطع الغيار الأصلية</li>
              <li>صور حقيقية ووصف دقيق للمنتجات</li>
              <li>معلومات اتصال صحيحة</li>
              <li>أسعار واقعية وعادلة</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
              4.2 المحتوى المحظور
            </h3>
            <p className="text-red-600 font-semibold">يُمنع منعاً باتاً نشر:</p>
            <ul className="list-disc list-inside space-y-2 mr-6 text-red-600">
              <li>منتجات مسروقة أو مزورة أو غير قانونية</li>
              <li>سيارات بدون أوراق ثبوتية أو مستندات</li>
              <li>محتوى خادع أو مضلل</li>
              <li>صور مضللة أو غير حقيقية</li>
              <li>محتوى مسيء أو عنيف أو إباحي</li>
              <li>معلومات تمييزية أو عنصرية</li>
              <li>رسائل بريد عشوائي (Spam)</li>
              <li>روابط خارجية لمواقع منافسة</li>
              <li>أي محتوى ينتهك القوانين الكويتية</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
              4.3 حقوق الملكية الفكرية
            </h3>
            <p>
              بنشرك للمحتوى، فإنك تضمن أن لديك جميع الحقوق اللازمة لنشره. تمنحنا ترخيصاً 
              غير حصري لاستخدام وعرض المحتوى على المنصة.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              5. البيع والشراء
            </h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
              5.1 مسؤوليات البائع
            </h3>
            <ul className="list-disc list-inside space-y-2 mr-6">
              <li>تقديم وصف دقيق وصادق للمنتج</li>
              <li>نشر صور حقيقية وواضحة</li>
              <li>تحديد سعر عادل ونهائي</li>
              <li>الرد على استفسارات المشترين بسرعة</li>
              <li>تسليم المنتج كما هو موصوف</li>
              <li>عدم التلاعب بالأسعار أو المواصفات</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
              5.2 مسؤوليات المشتري
            </h3>
            <ul className="list-disc list-inside space-y-2 mr-6">
              <li>فحص المنتج قبل الشراء</li>
              <li>التفاوض بحسن نية</li>
              <li>الالتزام بالموعد المتفق عليه</li>
              <li>التحقق من المستندات والأوراق الثبوتية</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
              5.3 المعاملات
            </h3>
            <p className="bg-yellow-50 border-r-4 border-yellow-400 p-4 rounded">
              <strong>تنويه مهم:</strong> جميع المعاملات المالية تتم مباشرة بين البائع والمشتري. 
              Q8 Sport Car ليست طرفاً في المعاملة ولا تتحمل أي مسؤولية عن:
            </p>
            <ul className="list-disc list-inside space-y-2 mr-6 mt-2">
              <li>جودة أو حالة المنتجات</li>
              <li>صحة المعلومات المقدمة</li>
              <li>اكتمال المعاملة</li>
              <li>أي نزاعات بين الأطراف</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              6. الرسوم والدفع
            </h2>
            <p>
              حالياً، استخدام التطبيق مجاني بالكامل. نحتفظ بالحق في فرض رسوم في المستقبل 
              مع إشعار مسبق للمستخدمين.
            </p>
            <p className="mt-2">
              في حالة فرض أي رسوم مستقبلية:
            </p>
            <ul className="list-disc list-inside space-y-2 mr-6">
              <li>سيتم إخطارك قبل 30 يوماً على الأقل</li>
              <li>لك الحق في إلغاء حسابك قبل سريان الرسوم</li>
              <li>ستكون الرسوم واضحة وشفافة</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              7. الخصوصية وحماية البيانات
            </h2>
            <p>
              استخدامك للتطبيق يخضع أيضاً لسياسة الخصوصية الخاصة بنا. يرجى مراجعة 
              <a href="/privacy" className="text-blue-600 hover:underline mx-1">سياسة الخصوصية</a> 
              لفهم كيفية جمع واستخدام معلوماتك الشخصية.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              8. إخلاء المسؤولية
            </h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
              8.1 التطبيق "كما هو"
            </h3>
            <p>
              يتم توفير التطبيق "كما هو" و"حسب التوفر" دون أي ضمانات من أي نوع، 
              سواء صريحة أو ضمنية.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
              8.2 عدم المسؤولية عن المحتوى
            </h3>
            <p>
              لا نتحمل أي مسؤولية عن:
            </p>
            <ul className="list-disc list-inside space-y-2 mr-6">
              <li>دقة أو صحة المحتوى المنشور من المستخدمين</li>
              <li>جودة أو حالة المنتجات المعروضة</li>
              <li>سلوك المستخدمين الآخرين</li>
              <li>أي خسائر ناتجة عن المعاملات</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
              8.3 حدود المسؤولية
            </h3>
            <p>
              في حدود ما يسمح به القانون، لن نكون مسؤولين عن أي أضرار غير مباشرة أو 
              عرضية أو تبعية أو خاصة ناتجة عن استخدام التطبيق.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              9. الإجراءات التأديبية
            </h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
              9.1 انتهاك الشروط
            </h3>
            <p>
              في حالة انتهاك هذه الشروط، يحق لنا اتخاذ الإجراءات التالية:
            </p>
            <ul className="list-disc list-inside space-y-2 mr-6">
              <li>إصدار تحذير</li>
              <li>حذف المحتوى المخالف</li>
              <li>تعليق الحساب مؤقتاً</li>
              <li>إنهاء الحساب نهائياً</li>
              <li>الإبلاغ عن الأنشطة غير القانونية للسلطات</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
              9.2 الاستئناف
            </h3>
            <p>
              إذا تم تعليق أو إنهاء حسابك، يمكنك التواصل معنا لاستئناف القرار خلال 14 يوماً.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              10. التعديلات على الشروط
            </h2>
            <p>
              نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سنقوم بإخطارك بأي تغييرات جوهرية عبر:
            </p>
            <ul className="list-disc list-inside space-y-2 mr-6">
              <li>إشعار داخل التطبيق</li>
              <li>البريد الإلكتروني</li>
              <li>تحديث تاريخ "آخر تحديث" أعلى هذه الصفحة</li>
            </ul>
            <p className="mt-4">
              <strong>استمرارك في استخدام التطبيق بعد التعديلات يعني موافقتك على الشروط المحدثة.</strong>
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              11. القانون الحاكم
            </h2>
            <p>
              تخضع هذه الشروط وتُفسر وفقاً لقوانين دولة الكويت. أي نزاع ينشأ عن هذه الشروط 
              سيخضع للاختصاص الحصري للمحاكم الكويتية.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              12. حقوق الملكية الفكرية
            </h2>
            <p>
              جميع حقوق الملكية الفكرية في التطبيق (بما في ذلك التصميم، الشعار، الكود، النصوص) 
              مملوكة لـ Q8 Sport Car. لا يجوز نسخ أو توزيع أو تعديل أي جزء من التطبيق بدون إذن كتابي.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              13. التواصل والدعم
            </h2>
            <p>
              للأسئلة أو الشكاوى أو الدعم الفني، يمكنك التواصل معنا عبر:
            </p>
            <div className="bg-gray-100 p-6 rounded-lg mt-4">
              <p className="font-semibold mb-2">Q8 Sport Car</p>
              <p><strong>الدعم الفني:</strong> support@q8sportcar.com</p>
              <p><strong>الشكاوى:</strong> complaints@q8sportcar.com</p>
              <p><strong>الاستفسارات العامة:</strong> info@q8sportcar.com</p>
              <p><strong>الموقع:</strong> www.q8sportcar.com</p>
              <p className="mt-2 text-sm text-gray-600">دولة الكويت</p>
            </div>
            <p className="mt-4">
              وقت الاستجابة: نسعى للرد على جميع الاستفسارات خلال 24-48 ساعة عمل.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              14. أحكام متفرقة
            </h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
              14.1 قابلية الفصل
            </h3>
            <p>
              إذا تبين أن أي بند من هذه الشروط غير قانوني أو غير قابل للتنفيذ، ستظل باقي البنود 
              سارية المفعول.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
              14.2 التنازل
            </h3>
            <p>
              فشلنا في إنفاذ أي حق أو بند من هذه الشروط لا يعتبر تنازلاً عن ذلك الحق أو البند.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
              14.3 الاتفاق الكامل
            </h3>
            <p>
              تشكل هذه الشروط، بالإضافة إلى سياسة الخصوصية، الاتفاق الكامل بينك وبيننا 
              فيما يتعلق باستخدام التطبيق.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              15. الموافقة النهائية
            </h2>
            <p className="bg-blue-50 border-r-4 border-blue-500 p-4 rounded">
              <strong>بالنقر على "أوافق" أو باستخدامك للتطبيق، فإنك تقر بأنك:</strong>
            </p>
            <ul className="list-disc list-inside space-y-2 mr-6 mt-2">
              <li>قرأت وفهمت هذه الشروط والأحكام</li>
              <li>توافق على الالتزام بها</li>
              <li>عمرك 18 عاماً أو أكثر</li>
              <li>لديك الأهلية القانونية لإبرام هذه الاتفاقية</li>
            </ul>
          </section>

          <div className="border-t-2 border-gray-200 mt-12 pt-8 text-center text-sm text-gray-500">
            <p>آخر تحديث: 28 يناير 2026</p>
            <p className="mt-2">© 2026 Q8 Sport Car. جميع الحقوق محفوظة.</p>
            <p className="mt-4">
              <a href="/privacy" className="text-blue-600 hover:underline mx-2">سياسة الخصوصية</a>
              |
              <a href="/support" className="text-blue-600 hover:underline mx-2">الدعم</a>
              |
              <a href="/" className="text-blue-600 hover:underline mx-2">الرئيسية</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
