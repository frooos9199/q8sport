# إعداد تسجيل الدخول بالفيس بوك

## الخطوات المطلوبة:

### 1. إنشاء Facebook App
1. اذهب إلى [Facebook Developers](https://developers.facebook.com/)
2. اضغط على "My Apps" ثم "Create App"
3. اختر "Consumer" كنوع التطبيق
4. أدخل اسم التطبيق (مثل: Q8 MAZAD SPORT)
5. أدخل بريدك الإلكتروني
6. اضغط "Create App"

### 2. إعداد Facebook Login
1. في لوحة تحكم التطبيق، اضغط على "Add Product"
2. ابحث عن "Facebook Login" واضغط "Set Up"
3. اختر "Web" كنوع التطبيق
4. أدخل Site URL: `http://localhost:3000` (للتطوير)
5. احفظ الإعدادات

### 3. إعداد Valid OAuth Redirect URIs
1. اذهب إلى Facebook Login > Settings
2. في "Valid OAuth Redirect URIs" أضف:
   - `http://localhost:3000/auth` (للتطوير)
   - `https://yourdomain.com/auth` (للإنتاج)

### 4. الحصول على App ID
1. اذهب إلى Settings > Basic
2. انسخ "App ID"
3. ضعه في ملف `.env.local`:
```
NEXT_PUBLIC_FACEBOOK_APP_ID="YOUR_APP_ID_HERE"
```

### 5. إعداد App Review (للإنتاج)
- للاستخدام العام، ستحتاج لمراجعة التطبيق من فيس بوك
- للتطوير، يمكن استخدام حسابات المطورين فقط

## الميزات المتاحة:
✅ تسجيل دخول سريع بالفيس بوك
✅ إنشاء حساب تلقائي للمستخدمين الجدد
✅ ربط الحسابات الموجودة بالفيس بوك
✅ استيراد الصورة الشخصية من فيس بوك
✅ التحقق التلقائي للبريد الإلكتروني

## الأمان:
- يتم إنشاء كلمة مرور عشوائية للمستخدمين الجدد
- يتم التحقق من صحة Token مع فيس بوك
- الحسابات المرتبطة بفيس بوك محققة تلقائياً