#!/bin/bash

echo "🔄 إعادة تشغيل التطبيق بعد تثبيت Firebase..."

cd Q8SportApp

# إيقاف Metro bundler
pkill -f "react-native" || true

# مسح الكاش
rm -rf node_modules/.cache
rm -rf /tmp/metro-* 2>/dev/null || true

echo ""
echo "✅ تم مسح الكاش!"
echo ""
echo "🚀 الآن شغّل التطبيق:"
echo ""
echo "   npm start --reset-cache"
echo ""
echo "   ثم في terminal آخر:"
echo "   npm run android  (للأندرويد)"
echo "   npm run ios      (للآيفون)"
echo ""
