# 🔐 Secrets الجديدة الآمنة - Q8Sport
# تم إنشاؤها: 29 يناير 2026
# ════════════════════════════════════════════

## ✅ استخدم هذه القيم الجديدة:

### 1️⃣ JWT_SECRET (جديد - آمن)
```
I/ki4Nx6r3GwWwZc/PkvU0YYkcRNYRySAFOX7AdcJDo=
```

### 2️⃣ NEXTAUTH_SECRET (جديد - آمن)
```
N8Y0qtAwYKxSKwNswuwxQuSSOnF5DsG8Gf/L/Kv4c/0=
```

---

## 📋 خطوات التطبيق على Vercel:

### الطريقة 1: عبر Dashboard (موصى بها)

1. **اذهب إلى Vercel Dashboard:**
   https://vercel.com/frooos9199/q8sport/settings/environment-variables

2. **احذف المتغيرات القديمة:**
   - ❌ JWT_SECRET القديم
   - ❌ NEXTAUTH_SECRET القديم

3. **أضف المتغيرات الجديدة:**
   - ✅ JWT_SECRET: `I/ki4Nx6r3GwWwZc/PkvU0YYkcRNYRySAFOX7AdcJDo=`
   - ✅ NEXTAUTH_SECRET: `N8Y0qtAwYKxSKwNswuwxQuSSOnF5DsG8Gf/L/Kv4c/0=`

4. **اضغط "Save" ثم "Redeploy"**

---

### الطريقة 2: عبر Vercel CLI (أسرع)

```bash
# تثبيت Vercel CLI (إذا لم يكن مثبت)
npm i -g vercel

# تسجيل الدخول
vercel login

# الانتقال لمجلد المشروع
cd /Users/mac/Documents/GitHub/q8sport-main

# تحديث المتغيرات
vercel env rm JWT_SECRET production
vercel env add JWT_SECRET production
# الصق: I/ki4Nx6r3GwWwZc/PkvU0YYkcRNYRySAFOX7AdcJDo=

vercel env rm NEXTAUTH_SECRET production
vercel env add NEXTAUTH_SECRET production
# الصق: N8Y0qtAwYKxSKwNswuwxQuSSOnF5DsG8Gf/L/Kv4c/0=

# إعادة النشر
vercel --prod
```

---

## 🔄 بعد التحديث:

### للـ Development المحلي:

1. **أنشئ ملف .env.local:**
```bash
cat > .env.local << 'EOF'
# Database
DATABASE_URL="postgresql://neondb_owner:npg_IsCOTpYEbu54@ep-sweet-unit-ah0jjfz0-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Secrets الجديدة الآمنة
JWT_SECRET="I/ki4Nx6r3GwWwZc/PkvU0YYkcRNYRySAFOX7AdcJDo="
NEXTAUTH_SECRET="N8Y0qtAwYKxSKwNswuwxQuSSOnF5DsG8Gf/L/Kv4c/0="

# URLs
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Blob Token (سيبقى كما هو مؤقتاً - غيره لاحقاً)
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_vUZvfSkuvVUvs3Pl_rErtHtoIKYBsI7ZKSR0gJimMEk9Sak"
EOF
```

2. **اختبر محلياً:**
```bash
npm run dev
```

3. **تأكد من عمل Authentication:**
   - افتح: http://localhost:3000
   - جرب تسجيل الدخول

---

## 🚨 مهم جداً:

### ✅ تم تحسين الأمان:
- JWT_SECRET: من 29 حرف → **44 حرف** (base64)
- NEXTAUTH_SECRET: من 29 حرف → **44 حرف** (base64)
- الـ secrets الآن عشوائية بالكامل وآمنة

### 🔄 خطوات إضافية موصى بها:

1. **غيّر Database Password لاحقاً:**
   - اذهب إلى Neon Dashboard
   - Reset Password
   - حدث DATABASE_URL على Vercel

2. **دوّر Blob Token:**
   - Vercel Dashboard → Storage → Blob
   - Regenerate Token
   - حدث BLOB_READ_WRITE_TOKEN

3. **امسح هذا الملف بعد الاستخدام:**
```bash
rm NEW_SECRETS.md
```

---

## ✅ Checklist:

- [ ] نسخ JWT_SECRET الجديد
- [ ] نسخ NEXTAUTH_SECRET الجديد
- [ ] تحديث Vercel Environment Variables
- [ ] Redeploy على Vercel
- [ ] إنشاء .env.local محلياً
- [ ] اختبار التطبيق محلياً
- [ ] اختبار التطبيق على Production
- [ ] تغيير Database Password (اختياري - لكن موصى به)
- [ ] تدوير Blob Token (اختياري - لكن موصى به)
- [ ] حذف هذا الملف

---

**🎯 الأولوية: حدّث JWT_SECRET و NEXTAUTH_SECRET على Vercel الآن!**
