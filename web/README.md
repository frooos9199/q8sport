# Q8 Sport Market Web

واجهة الويب الخاصة بسوق Q8 Sport Market مبنية بـ Next.js وتعرض نفس فئات التطبيق:

- سيارات
- قطع غيار
- مطلوبات
- ملفات معلنين عامة

## التشغيل

```bash
npm run dev
```

## ربط Firebase

الويب يقرأ من Realtime Database عبر REST على نفس المسارات المستخدمة في التطبيق:

- `cars`
- `parts`
- `requests`
- `users`

إذا كانت القاعدة قابلة للقراءة من الويب فسيتم عرض البيانات الحقيقية مباشرة.
إذا لم تكن متاحة أو لم تكتمل الإعدادات، سيرجع الموقع تلقائيًا إلى بيانات عرض احتياطية حتى لا يتعطل.

انسخ ملف البيئة المثال وشغّل القيم المناسبة:

```bash
cp .env.local.example .env.local
```

المتغيرات الأساسية:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_DATABASE_URL`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`

إذا لم تضبط `NEXT_PUBLIC_FIREBASE_DATABASE_URL` فالموقع سيحاول افتراض المسار الافتراضي بالشكل التالي:

```text
https://<project-id>-default-rtdb.firebaseio.com
```

## المسارات الحالية

- `/`
- `/market`
- `/sell`
- `/cars/[slug]`
- `/parts/[slug]`
- `/wanted/[slug]`
- `/sellers/[slug]`

## النشر من الويب

المسار `/sell` يرسل البيانات إلى `app/api/publish/route.ts` ثم يكتب مباشرة في:

- `users`
- `cars`
- `parts`
- `requests`

المسار الحالي يدعم:

- نشر سيارة
- نشر قطعة
- نشر مطلوب

كما يدعم رفع الصور مباشرة من المتصفح إلى Firebase Storage قبل إرسال روابطها إلى قاعدة البيانات.

لكي يعمل رفع الصور من الويب يجب أن تسمح قواعد Storage بهذا المسار أو تضيف مصادقة لاحقًا:

- `web-uploads/**`

ويعتمد على نفس قاعدة البيانات الموجودة أصلًا. إذا كانت قواعد Realtime Database تمنع الكتابة من هذا المسار فسيظهر خطأ واضح داخل النموذج، وعندها يلزم ضبط القواعد أو إضافة مصادقة كاملة لاحقًا.
