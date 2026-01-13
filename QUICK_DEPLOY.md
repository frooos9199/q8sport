# خطوات الرفع السريعة 🚀

## 1. رفع إلى GitHub (5 دقائق)

### إذا لم يكن لديك Git:
```bash
# تحميل Git من: https://git-scm.com/download/win
# بعد التثبيت، افتح PowerShell في مجلد المشروع:
cd "C:\Users\summi\Documents\app\website"
```

### إعداد Git والرفع:
```bash
# إعداد Git (مرة واحدة فقط)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# تحضير المشروع
git init
git add .
git commit -m "Q8 MAZAD SPORT - Ready for deployment"

# إنشاء repository في GitHub:
# 1. اذهب إلى https://github.com
# 2. اضغط "New repository"
# 3. اسم المشروع: q8-mazad-sport
# 4. اجعله Public
# 5. اضغط "Create repository"

# ربط مع GitHub (غير YOUR_USERNAME باسم المستخدم الخاص بك)
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/q8-mazad-sport.git
git push -u origin main
```

## 2. إعداد قاعدة البيانات - PlanetScale (10 دقائق)

### الخطوات:
1. **إنشاء حساب**: https://planetscale.com/
2. **ضغط "Create database"**
3. **اسم قاعدة البيانات**: `q8mazadsport`
4. **المنطقة**: AWS us-east-1
5. **نوع قاعدة البيانات**: MySQL
6. **الضغط على "Create database"**

### الحصول على Connection String:
1. بعد إنشاء قاعدة البيانات، اضغط "Connect"
2. اختر "Prisma" من القائمة
3. انسخ DATABASE_URL
4. احتفظ بها للخطوة القادمة

## 3. إعداد Vercel (5 دقائق)

### الخطوات:
1. **إنشاء حساب**: https://vercel.com/
2. **ضغط "New Project"**
3. **Import من GitHub**: اختر repository: q8-mazad-sport
4. **Configure Project**:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run vercel-build`
   - Output Directory: `.next`

### إضافة Environment Variables:
في صفحة Project Settings → Environment Variables:

```
DATABASE_URL=mysql://[النص من PlanetScale]
JWT_SECRET=q8mazad2025secretkey123456789
NEXTAUTH_SECRET=q8mazad2025nextauth987654321
NEXTAUTH_URL=https://[project-name].vercel.app
NEXT_PUBLIC_FACEBOOK_APP_ID=1234567890123456
```

5. **ضغط "Deploy"**

## 4. إعداد قاعدة البيانات النهائي (5 دقائق)

### بعد نجاح Deploy في Vercel:
1. افتح Terminal في VS Code
2. غير DATABASE_URL في .env.local للـ PlanetScale URL
3. شغل:
```bash
npx prisma generate
npx prisma db push
```

## 5. اختبار الموقع ✅

### بعد انتهاء Deployment:
- Vercel سيعطيك رابط مثل: `https://q8-mazad-sport.vercel.app`
- اختبر تسجيل الدخول
- اختبر إضافة منتج
- تأكد من عمل جميع الصفحات

---

## 🎯 **النتيجة النهائية:**
- ✅ موقع مباشر أونلاين
- ✅ قاعدة بيانات آمنة في السحابة
- ✅ رابط مجاني من Vercel
- ✅ تحديثات تلقائية عند push إلى GitHub

## 💡 **نصائح:**
- احتفظ بنسخة من DATABASE_URL
- لا تشارك JWT_SECRET مع أحد
- يمكن شراء دومين مخصص لاحقاً (.com)

**الوقت المتوقع: 25 دقيقة فقط! 🚀**