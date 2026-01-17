# 🌐 دليل ربط الدومين q8sportcar.com

## ✅ ما تم إنجازه:
1. ✅ تحديث `next.config.ts` - إضافة الدومين للصور
2. ✅ تحديث `package.json` - تحديث homepage
3. ✅ تحديث `.env` - تحديث URLs

---

## 🔧 خطوات ربط الدومين مع Vercel (موصى به):

### 1️⃣ رفع المشروع على Vercel
```bash
# تثبيت Vercel CLI
npm i -g vercel

# تسجيل الدخول
vercel login

# رفع المشروع
cd /Users/mac/Documents/GitHub/q8sport-main
vercel
```

### 2️⃣ إعدادات DNS في Namecheap

اذهب إلى Namecheap > Domain List > Manage > Advanced DNS

**احذف السجلات الموجودة وأضف:**

#### A Record:
```
Type: A Record
Host: @
Value: 76.76.21.21
TTL: Automatic
```

#### CNAME Record:
```
Type: CNAME Record
Host: www
Value: cname.vercel-dns.com.
TTL: Automatic
```

### 3️⃣ إضافة الدومين في Vercel
1. اذهب إلى Vercel Dashboard
2. اختر المشروع `q8sport`
3. Settings > Domains
4. أضف `q8sportcar.com`
5. أضف `www.q8sportcar.com`

---

## 🚂 البديل: Railway

### 1️⃣ رفع المشروع على Railway
```bash
# تثبيت Railway CLI
npm i -g @railway/cli

# تسجيل الدخول
railway login

# رفع المشروع
railway init
railway up
```

### 2️⃣ إعدادات DNS في Namecheap

#### CNAME للـ root domain:
```
Type: CNAME Record
Host: @
Value: [your-project].railway.app.
TTL: Automatic
```

#### CNAME للـ www:
```
Type: CNAME Record
Host: www
Value: [your-project].railway.app.
TTL: Automatic
```

### 3️⃣ إضافة الدومين في Railway
1. اذهب إلى Railway Dashboard
2. اختر المشروع
3. Settings > Domains
4. أضف Custom Domain: `q8sportcar.com`
5. أضف Custom Domain: `www.q8sportcar.com`

---

## 📱 تحديث التطبيق (React Native)

### ملف: `Q8SportApp/src/config/api.js`
```javascript
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api'
  : 'https://www.q8sportcar.com/api';

export default API_BASE_URL;
```

---

## 🔒 SSL Certificate

✅ **Vercel:** يوفر SSL تلقائي مجاناً
✅ **Railway:** يوفر SSL تلقائي مجاناً

---

## ⏱️ وقت الانتشار

- **DNS Changes:** 5-30 دقيقة
- **Full Propagation:** حتى 48 ساعة

---

## ✅ التحقق من الربط

### اختبار DNS:
```bash
# التحقق من A Record
nslookup q8sportcar.com

# التحقق من CNAME
nslookup www.q8sportcar.com
```

### اختبار الموقع:
```bash
curl -I https://www.q8sportcar.com
```

---

## 🔍 استكشاف الأخطاء

### المشكلة: "DNS_PROBE_FINISHED_NXDOMAIN"
✅ **الحل:** انتظر انتشار DNS (حتى 48 ساعة)

### المشكلة: "SSL Certificate Error"
✅ **الحل:** في Vercel/Railway، اذهب لـ Settings > SSL وأعد إنشاء الشهادة

### المشكلة: "www يعمل لكن بدون www لا يعمل"
✅ **الحل:** تأكد من إضافة كلا النطاقين في Vercel/Railway

---

## 📝 متغيرات البيئة في Vercel/Railway

تأكد من إضافة:
```bash
DATABASE_URL=postgresql://...
JWT_SECRET=q8sport2025secretkey123456789
NEXTAUTH_SECRET=q8sport2025nextauth987654321
NEXTAUTH_URL=https://www.q8sportcar.com
NEXT_PUBLIC_APP_URL=https://www.q8sportcar.com
```

---

## 🎯 الخطوات التالية

1. ✅ اختر منصة الاستضافة (Vercel موصى به)
2. ✅ ارفع المشروع
3. ✅ حدّث DNS في Namecheap
4. ✅ أضف الدومين في المنصة
5. ✅ انتظر انتشار DNS
6. ✅ اختبر الموقع

---

## 📞 روابط مهمة

- **Vercel Docs:** https://vercel.com/docs/concepts/projects/domains
- **Railway Docs:** https://docs.railway.app/deploy/deployments
- **Namecheap DNS:** https://www.namecheap.com/support/knowledgebase/article.aspx/319/2237/how-can-i-set-up-an-a-address-record-for-my-domain

---

🚀 **موفق!**
