# استخدام Node.js image رسمي
FROM node:18-alpine

# تحديد مجلد العمل
WORKDIR /app

# نسخ package files
COPY package*.json ./

# تثبيت المكتبات
RUN npm ci --only=production

# نسخ باقي الملفات
COPY . .

# بناء التطبيق
RUN npm run build

# تعريف المنفذ
EXPOSE 3000

# تشغيل التطبيق
CMD ["npm", "start"]