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
- `PUBLISH_RATE_LIMIT_MAX_ATTEMPTS=3`
- `PUBLISH_RATE_LIMIT_WINDOW_MS=900000`

المسار `NEXT_PUBLIC_*` مطلوب لقراءة البيانات من المتصفح.
المسار غير العام مطلوب لعمليات السيرفر مثل `app/api/publish` ورفع الصور عبر Firebase Admin.
والمتغيرات الإدارية مطلوبة لمسارات الإدارة الحساسة مثل حذف المستخدم من Firebase Authentication.

## 2. إعداد الدومين

- اجعل `www.q8sportcar.com` هو الـ Primary Domain داخل Vercel.
- إذا استخدمت الجذر `q8sportcar.com` فاضبط Redirect دائم إلى `www.q8sportcar.com` من لوحة Vercel.

## 3. قواعد Firebase Realtime Database

القواعد الحالية بعد التشديد تبقي القراءة عامة، لكنها تمنع الكتابة إلا للمستخدم الموثق صاحب الإعلان أو المشرف:

```json
{
  "rules": {
    ".read": true,
    "cars": {
      "$carId": {
        ".write": "auth != null && (root.child('users').child(auth.uid).child('isAdmin').val() === true || (!data.exists() && newData.child('userId').val() === auth.uid) || (data.exists() && data.child('userId').val() === auth.uid))"
      }
    },
    "parts": {
      "$partId": {
        ".write": "auth != null && (root.child('users').child(auth.uid).child('isAdmin').val() === true || (!data.exists() && newData.child('userId').val() === auth.uid) || (data.exists() && data.child('userId').val() === auth.uid))"
      }
    },
    "requests": {
      "$requestId": {
        ".write": "auth != null && (root.child('users').child(auth.uid).child('isAdmin').val() === true || (!data.exists() && newData.child('userId').val() === auth.uid) || (data.exists() && data.child('userId').val() === auth.uid))"
      }
    },
    "users": {
      "$uid": {
        ".write": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('isAdmin').val() === true)"
      }
    }
  }
}
```

الموقع نفسه لم يعد يحتاج كتابة عامة من المتصفح، لأن `/api/publish` أصبح يرفع الصور ويكتب البيانات من جهة السيرفر عبر Firebase Admin.

هذه القواعد أصبحت محفوظة داخل الريبو في:

- `database.rules.json`
- `storage.rules`

## 4. قواعد Firebase Storage

رفع الصور من الويب يتم الآن من جهة السيرفر إلى المسار التالي:

- `web-uploads/**`

والكتابة العامة من المتصفح أصبحت مقفلة. التطبيق الأصلي يرفع إلى مسارات مرتبطة بالمستخدم الموثق:

- `users/{uid}/**`
- `cars/{uid}/{listingId}/**`
- `parts/{uid}/{listingId}/**`
- `requests/{uid}/{listingId}/**`

مثال القواعد الحالية:

```text
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{uid}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == uid;
    }

    match /{listingType}/{uid}/{listingId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null
        && listingType in ['cars', 'parts', 'requests']
        && request.auth.uid == uid;
    }

    match /web-uploads/{allPaths=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

هذه هي الصيغة المناسبة قبل الإطلاق، لأنها تمنع الرفع العام وتبقي الرفع من التطبيق الأصلي مرتبطًا بالمستخدم الموثق.

## 5. فحص ما بعد النشر

بعد أي Deploy تحقق من الآتي:

- الصفحة الرئيسية تعمل على `www.q8sportcar.com`
- صفحة السوق تعمل
- صفحات الإعلان الفردية تعمل
- صفحة `/sell` تفتح
- رفع الصور ينجح من المتصفح عبر `/api/publish`
- إذا كررت النشر بسرعة من نفس المصدر تحصل على `429`
- `/robots.txt` و`/sitemap.xml` يفتحان بشكل صحيح

## 6. الترتيب التالي بعد الإطلاق

- إضافة Firebase Auth للويب
- إضافة rate limiting وCAPTCHA إلى `/api/publish`
- إضافة مراجعة آلية لقواعد Database وStorage عبر Emulator أو CI