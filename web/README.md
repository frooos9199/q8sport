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

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_DATABASE_URL`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_DATABASE_URL`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`
- `ADMIN_API_TOKEN`
- `PUBLISH_RATE_LIMIT_MAX_ATTEMPTS`
- `PUBLISH_RATE_LIMIT_WINDOW_MS`

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

المسار `/sell` يرسل البيانات إلى `app/api/publish/route.ts` ثم يقوم السيرفر برفع الصور والكتابة في:

- `users`
- `cars`
- `parts`
- `requests`

المسار الحالي يدعم:

- نشر سيارة
- نشر قطعة
- نشر مطلوب

كما يدعم رفع الصور من خلال السيرفر بدل الكتابة العامة المباشرة من المتصفح.

المسار نفسه عليه rate limiting من جهة السيرفر بحسب IP ورقم الواتساب ونوع الإعلان لتقليل السبام.

الصور التي ينشرها الويب تُحفظ في:

- `web-uploads/**`

أما التطبيق الأصلي فيرفع الملفات بعد تسجيل الدخول إلى مسارات مرتبطة بالمستخدم:

- `users/{uid}/**`
- `cars/{uid}/{listingId}/**`
- `parts/{uid}/{listingId}/**`
- `requests/{uid}/{listingId}/**`

وبالتالي يمكن إبقاء قواعد Realtime Database وStorage مشددة بدون كسر نموذج النشر في الويب.

## Production

راجع [DEPLOYMENT.md](DEPLOYMENT.md) لإعدادات Vercel والدومين وقواعد Firebase المطلوبة للإنتاج.

## حذف مستخدم نهائيًا من Firebase Auth

تم تجهيز مسار خادمي لهذا الغرض داخل:

- `src/app/api/admin/delete-user/route.ts`

المسار يتطلب:

- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_DATABASE_URL`
- `ADMIN_API_TOKEN`

ويرسل طلب `POST` بهذا الشكل:

```bash
curl -X POST http://localhost:3000/api/admin/delete-user \
	-H 'content-type: application/json' \
	-H 'x-admin-token: YOUR_ADMIN_API_TOKEN' \
	-d '{"uid":"USER_UID"}'
```

هذا المسار يقوم بـ:

- حذف المستخدم من Firebase Authentication
- حذف سياراته وقطعه وطلباته من Realtime Database
- تحويل سجل المستخدم إلى حساب محذوف داخل `users/{uid}`

## توليد imageThumbs للإعلانات القديمة

إذا أضفت ميزة `imageThumbs` بعد وجود بيانات قديمة، شغّل migration من داخل مجلد `web`:

```bash
npm run migrate:image-thumbs -- --dry-run
```

وعند التأكد من النتيجة:

```bash
npm run migrate:image-thumbs -- --write
```

خيارات مفيدة:

- `--collection cars`
- `--collection cars,parts`
- `--limit 20`

هذا السكربت يحتاج نفس متغيرات Firebase Admin المستخدمة في الويب، ويضيف `imageThumbs` فقط بدون تعديل `updatedAt` حتى لا يعيد رفع الإعلانات القديمة للأعلى.
