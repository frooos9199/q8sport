# خطوات سريعة للرفع الآن! ⚡

## هل أنت جاهز؟ فقط 3 خطوات:

### 1️⃣ **أرفع الكود إلى GitHub (الآن!)**
```bash
# في VS Code Terminal:
cd "C:\Users\summi\Documents\app\website"
git init
git add .
git commit -m "Q8 MAZAD SPORT - Ready for production"

# اذهب إلى GitHub.com وأنشئ repository جديد باسم: q8-mazad-sport
# ثم:
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/q8-mazad-sport.git
git push -u origin main
```

### 2️⃣ **أرفع على Vercel (5 دقائق)**
1. اذهب إلى https://vercel.com/
2. اضغط "New Project"
3. اختر q8-mazad-sport من GitHub
4. اضغط "Deploy"

### 3️⃣ **إعداد قاعدة البيانات (5 دقائق)**
1. اذهب إلى https://planetscale.com/
2. أنشئ database: q8mazadsport
3. انسخ DATABASE_URL
4. في Vercel → Settings → Environment Variables:
   - DATABASE_URL = [النص من PlanetScale]
   - JWT_SECRET = q8mazad2025secretkey
   - NEXTAUTH_SECRET = q8mazad2025nextauth
   - NEXTAUTH_URL = https://[project-name].vercel.app

**وبس! الموقع سيكون مباشر! 🚀**

---

## إعدادات إضافية (لاحقاً):

### Facebook App:
- أنشئ App في developers.facebook.com
- ضع App ID في Environment Variables

### Cloudinary (للصور):
- أنشئ حساب مجاني في cloudinary.com
- ضع API Keys في Environment Variables

### الإجمالي: 15 دقيقة من الآن = موقع مباشر! ⏰

**هل تريد أن نبدأ الآن؟ 🤔**