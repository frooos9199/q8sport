#!/bin/bash

echo "🔥 تثبيت Firebase للتطبيق..."

cd Q8SportApp

# تثبيت Firebase packages
npm install @react-native-firebase/app @react-native-firebase/auth

echo ""
echo "✅ تم تثبيت Firebase بنجاح!"
echo ""
echo "📋 الخطوات التالية:"
echo "1. اذهب إلى: https://console.firebase.google.com"
echo "2. أنشئ مشروع جديد أو استخدم مشروع موجود"
echo "3. فعّل Authentication > Email/Password"
echo "4. حمّل google-services.json (Android) و GoogleService-Info.plist (iOS)"
echo "5. اتبع التعليمات في FIREBASE_SETUP.md"
echo ""
echo "🚀 بعد الإعداد، شغّل:"
echo "   npm run android  (للأندرويد)"
echo "   npm run ios      (للآيفون)"
