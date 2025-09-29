# Railway Setup Guide - الأرخص والأسرع 🚀

## خطوات رفع الموقع على Railway ($5/شهر)

### المتطلبات:
- حساب GitHub (مجاني)
- $5 شهرياً لـ Railway

---

## 🔥 **الخطوة 1: إعداد Repository**

### أ. رفع الكود على GitHub:
```bash
# في مجلد المشروع
git init
git add .
git commit -m "Q8 Mazad Sport - Ready for deployment"
git branch -M main
git remote add origin https://github.com/[username]/q8-mazad-sport.git
git push -u origin main
```

---

## 🔥 **الخطوة 2: إعداد قاعدة البيانات (مجاني)**

### اذهب إلى: https://neon.tech/
1. اضغط "Sign up" - اختر GitHub
2. اضغط "Create your first project"
3. اسم المشروع: `q8-mazad-sport`
4. اختر Region: `US East (Ohio)` - الأسرع للشرق الأوسط
5. اضغط "Create project"

### احصل على Connection String:
1. في Dashboard، اضغط "Connect"
2. انسخ الـ Connection string مثل:
```
postgresql://[username]:[password]@[hostname]/[database]?sslmode=require
```

---

## 🔥 **الخطوة 3: Deploy على Railway**

### اذهب إلى: https://railway.app/
1. اضغط "Login" - اختر GitHub
2. اضغط "New Project"
3. اختر "Deploy from GitHub repo"
4. اختر `q8-mazad-sport` repository
5. اضغط "Deploy now"

---

## 🔥 **الخطوة 4: إعداد Environment Variables**

### في Railway Dashboard:
1. اضغط على مشروعك
2. اختر "Variables" tab
3. أضف المتغيرات التالية:

```bash
# Database
DATABASE_URL=postgresql://[من Neon]

# Authentication
JWT_SECRET=q8mazad2025secretkey123456789
NEXTAUTH_SECRET=q8mazad2025nextauth987654321
NEXTAUTH_URL=https://[your-project-name].railway.app

# Facebook (ضع App ID الحقيقي)
NEXT_PUBLIC_FACEBOOK_APP_ID=your-real-facebook-app-id

# Optional: Cloudinary (للصور)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

---

## 🔥 **الخطوة 5: إعداد قاعدة البيانات**

### في Railway Terminal:
1. اضغط على مشروعك في Railway
2. اختر "Deploy" tab  
3. انتظر انتهاء الـ build
4. اذهب لـ "Settings" → "Environment" 
5. أضف:
```bash
DATABASE_URL=[Connection string من Neon]
```

### Run Prisma Setup:
1. في Railway، اضغط "View Logs"
2. يجب أن ترى: `Database setup completed`

إذا لم يحدث، ادخل Terminal في مجلد المشروع وشغل:
```bash
npx prisma generate
npx prisma db push
```

---

## 🔥 **الخطوة 6: ربط Domain (اختياري)**

### إذا تريد domain مخصص:
1. اشتري domain من Namecheap ($1/سنة .com)
2. في Railway: Settings → Domain
3. اضغط "Custom Domain" 
4. أدخل domain name: `q8mazadsport.com`
5. في Namecheap DNS:
   - Type: CNAME
   - Host: @
   - Value: [railway-domain].railway.app

---

## ✅ **التحقق من النجاح:**

### 1. تفتح الموقع:
```
https://[project-name].railway.app
```

### 2. تتحقق من:
- [ ] الصفحة الرئيسية تفتح
- [ ] تسجيل الدخول يشتغل  
- [ ] قاعدة البيانات متصلة
- [ ] Facebook Login يشتغل
- [ ] المزادات تظهر

---

## 💰 **التكلفة الشهرية:**

### Railway Plan:
- **Developer**: $5/شهر
  - 8GB RAM
  - 8 vCPU  
  - 100GB Storage
  - Unlimited deployments

### Neon Database:
- **Free**: 0.5GB storage (كافي للبداية)
- **Pro**: $19/شهر عند الحاجة

### Domain (اختياري):
- **.com**: $1/سنة (~$0.08/شهر)

**المجموع: $5.08/شهر = حوالي 1.5 دينار كويتي**

---

## 🔧 **إعدادات إضافية:**

### 1. SSL Certificate:
- Railway يعطي SSL مجاني تلقائياً

### 2. Auto Deploy:
- كل push لـ GitHub = deploy تلقائي

### 3. Monitoring:
- Railway يعطي logs و metrics مجاني

### 4. Backup:
- Neon يعمل backup تلقائي يومي

---

## 🚨 **حل المشاكل الشائعة:**

### Build Failed:
```bash
# تأكد من package.json صحيح
npm run build
```

### Database Connection Error:
- تأكد من DATABASE_URL صحيح
- تأكد من Prisma schema applied

### Environment Variables:
- تأكد من جميع المتغيرات موجودة
- اعمل restart للـ deployment

---

## 📞 **الدعم:**

### Railway Support:
- Discord: https://discord.gg/railway
- Docs: https://docs.railway.app/

### Neon Support:
- Discord: https://discord.gg/neon
- Docs: https://neon.tech/docs/

**🎯 هذا أرخص حل احترافي لموقعك - $5/شهر فقط!**