#!/bin/bash

# Q8Sport Quick Deploy Script
# يمكن استخدامه على أي منصة cloud

echo "🚀 Q8Sport Quick Deploy Started..."

# التأكد من وجود المتطلبات
echo "📋 Checking requirements..."
node --version
npm --version

# تثبيت المكتبات
echo "📦 Installing dependencies..."
npm ci

# بناء التطبيق
echo "🔨 Building application..."
npm run build

# إعداد قاعدة البيانات
echo "🗄️ Setting up database..."
npx prisma generate
npx prisma db push

# بدء التطبيق
echo "✅ Starting Q8Sport..."
echo "🌐 Application will be available at: http://localhost:3000"
echo "🎯 Domain: q8sport.tk (when configured)"

npm start