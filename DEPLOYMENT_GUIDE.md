# دليل رفع الموقع أونلاين 🚀

## الخيارات المتاحة لرفع الموقع:

### 1. **Vercel** (الأسهل والأسرع) ⭐ المفضل
- **المميزات**: مجاني، سريع، تكامل مع GitHub
- **مناسب لـ**: Next.js (موقعنا مبني عليه)
- **التكلفة**: مجاني للمشاريع الشخصية

### 2. **Netlify** 
- **المميزات**: مجاني، سهل الاستخدام
- **التكلفة**: مجاني مع حدود معقولة

### 3. **Railway**
- **المميزات**: يدعم قواعد البيانات
- **التكلفة**: $5/شهر تقريباً

### 4. **DigitalOcean/AWS/Azure**
- **المميزات**: مرونة كاملة
- **التكلفة**: $10-50/شهر حسب الاستخدام

---

## 🎯 **الخطة المقترحة: Vercel + PlanetScale**

### المرحلة 1: إعداد قاعدة البيانات (PlanetScale)

#### الخطوات:
1. **إنشاء حساب PlanetScale**:
   - اذهب إلى: https://planetscale.com/
   - اضغط "Sign up" واستخدم GitHub للتسجيل

2. **إنشاء قاعدة بيانات**:
   - اضغط "New database"
   - اسم قاعدة البيانات: `q8-mazad-sport`
   - المنطقة: `AWS us-east-1` (الأسرع)

3. **الحصول على Connection String**:
   - اضغط "Connect"
   - اختر "Prisma"
   - انسخ الـ DATABASE_URL

### المرحلة 2: إعداد Vercel للاستضافة

#### الخطوات:
1. **رفع الكود إلى GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/your-username/q8-mazad-sport.git
   git push -u origin main
   ```

2. **ربط مع Vercel**:
   - اذهب إلى: https://vercel.com/
   - اضغط "Import project"
   - اختر repository من GitHub
   - اضغط "Deploy"

### المرحلة 3: إعداد متغيرات البيئة

#### في Vercel Dashboard:
```env
# Database
DATABASE_URL="mysql://username:password@host/database?sslaccept=strict"

# JWT
JWT_SECRET="your-production-jwt-secret-here"
NEXTAUTH_SECRET="your-production-nextauth-secret"
NEXTAUTH_URL="https://your-domain.vercel.app"

# Facebook
NEXT_PUBLIC_FACEBOOK_APP_ID="your-real-facebook-app-id"

# WhatsApp (Twilio)
TWILIO_ACCOUNT_SID="your-twilio-sid"
TWILIO_AUTH_TOKEN="your-twilio-token"
TWILIO_WHATSAPP_FROM="whatsapp:+14155238886"

# Email
EMAIL_FROM="noreply@yourdomain.com"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"

# File Upload (Cloudinary)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

---

## 📋 **قائمة المهام قبل الرفع:**

### ✅ **الضروري:**
- [ ] رفع الكود إلى GitHub
- [ ] إعداد قاعدة بيانات PlanetScale
- [ ] تحديث DATABASE_URL
- [ ] إنشاء Facebook App حقيقي
- [ ] تشغيل `prisma db push` على قاعدة البيانات الجديدة

### ⚡ **مهم:**
- [ ] إعداد Cloudinary لرفع الصور
- [ ] إعداد Twilio للواتساب
- [ ] إعداد SMTP للإيميلات
- [ ] تحديث JWT secrets

### 🎨 **اختياري:**
- [ ] شراء دومين مخصص (.com/.net)
- [ ] إعداد Google Analytics
- [ ] إعداد SSL Certificate (تلقائي مع Vercel)

---

## 💰 **التكلفة المتوقعة:**

### **البداية (مجاني):**
- Vercel: مجاني
- PlanetScale: مجاني (حتى 1GB)
- Facebook App: مجاني
- **المجموع: 0$ شهرياً**

### **عند النمو:**
- PlanetScale Pro: $29/شهر
- Cloudinary: $89/شهر (للصور الكثيرة)
- دومين مخصص: $10-15/سنة
- **المجموع: $30-120/شهر**

---

## 🔧 **الخطوات التالية:**

### 1. **هل تريد البدء الآن؟**
- سأساعدك في رفع الكود إلى GitHub
- ثم إعداد Vercel
- ثم قاعدة البيانات

### 2. **أي خدمة تفضل؟**
- Vercel (مقترح) - سهل ومجاني
- أم خدمة أخرى؟

### 3. **هل لديك حساب GitHub؟**
- إذا لا، سننشئ واحد أولاً

---

## 📞 **الدعم:**
سأكون معك خطوة بخطوة حتى يصبح الموقع مباشراً أونلاين! 🚀

**ما رأيك؟ هل نبدأ برفع الكود إلى GitHub أولاً؟**