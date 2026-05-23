# Q8 Sport Market Production Setup

هذا الملف يلخص ما يلزم حتى يعمل الموقع على Vercel والدومين الحقيقي مع Firebase بدون مفاجآت.

## 1. متغيرات البيئة في Vercel

أضف هذه القيم في Project Settings -> Environment Variables لكل من `Production` و`Preview` حسب الحاجة:

- `NEXT_PUBLIC_SITE_URL=https://www.q8sportcar.com`
- `NEXT_PUBLIC_FIREBASE_API_KEY=...`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID=q8sportcar`
- `NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://q8sportcar-default-rtdb.firebaseio.com`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=q8sportcar.firebasestorage.app`
- `FIREBASE_PROJECT_ID=q8sportcar`
- `FIREBASE_DATABASE_URL=https://q8sportcar-default-rtdb.firebaseio.com`
- `FIREBASE_STORAGE_BUCKET=q8sportcar.firebasestorage.app`
- `FIREBASE_ADMIN_CLIENT_EMAIL=...`
- `FIREBASE_ADMIN_PRIVATE_KEY=...`
- `ADMIN_API_TOKEN=...`

المسار `NEXT_PUBLIC_*` مطلوب للقراءة والرفع من المتصفح.
المسار غير العام مطلوب لعمليات السيرفر مثل `app/api/publish`.
والمتغيرات الإدارية مطلوبة لمسارات الإدارة الحساسة مثل حذف المستخدم من Firebase Authentication.

## 2. إعداد الدومين

- اجعل `www.q8sportcar.com` هو الـ Primary Domain داخل Vercel.
- إذا استخدمت الجذر `q8sportcar.com` فاضبط Redirect دائم إلى `www.q8sportcar.com` من لوحة Vercel.

## 3. قواعد Firebase Realtime Database

إذا أردت بقاء النشر المفتوح الحالي من الموقع، فالحد الأدنى للقواعد يجب أن يسمح بالقراءة العامة والكتابة على المسارات المستخدمة.

مثال مرن للبداية فقط:

```json
{
  "rules": {
    ".read": true,
    "cars": { ".write": true },
    "parts": { ".write": true },
    "requests": { ".write": true },
    "users": { ".write": true }
  }
}
```

هذا مناسب للإطلاق السريع فقط، وليس للأمان النهائي.

هذه القواعد أصبحت محفوظة داخل الريبو في:

- `database.rules.json`
- `storage.rules`

## 4. قواعد Firebase Storage

رفع الصور من الويب يستخدم المسار التالي:

- `web-uploads/**`

مثال بداية مرن:

```text
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /web-uploads/{allPaths=**} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

مرة أخرى: هذا مؤقت للإطلاق السريع. التشديد الصحيح لاحقًا يكون بمصادقة مستخدمين وقواعد مرتبطة بالهوية.

## 5. فحص ما بعد النشر

بعد أي Deploy تحقق من الآتي:

- الصفحة الرئيسية تعمل على `www.q8sportcar.com`
- صفحة السوق تعمل
- صفحات الإعلان الفردية تعمل
- صفحة `/sell` تفتح
- رفع الصور ينجح من المتصفح
- `/robots.txt` و`/sitemap.xml` يفتحان بشكل صحيح

## 6. الترتيب التالي بعد الإطلاق

- إضافة Firebase Auth للويب
- تحويل النشر والرفع إلى مستخدم موثق
- تشديد قواعد Database وStorage