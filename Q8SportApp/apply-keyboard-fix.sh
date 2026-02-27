#!/bin/bash

# سكريبت لتطبيق KeyboardAvoidingScrollView على كل الصفحات

echo "🔧 تطبيق حل الكيبورد على جميع الصفحات..."

# الصفحات المستهدفة
FILES=(
  "src/screens/Auth/LoginScreen.js"
  "src/screens/Auth/RegisterScreen.js"
  "src/screens/Profile/AddProductScreen.js"
  "src/screens/Profile/EditProductScreen.js"
  "src/screens/Profile/EditProfileScreen.js"
  "src/screens/Profile/ChangePasswordScreen.js"
  "src/screens/Profile/SettingsScreen.js"
  "src/screens/Auctions/AddAuctionScreen.js"
  "src/screens/Requests/AddRequestScreen.js"
  "src/screens/Stores/AddShowcaseScreen.js"
  "src/screens/Messages/ChatScreen.js"
  "src/screens/Admin/ManageUsersScreen.js"
  "src/screens/Admin/AdminSettingsScreen.js"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ معالجة: $file"
    
    # إضافة import إذا لم يكن موجود
    if ! grep -q "KeyboardAvoidingScrollView" "$file"; then
      # إيجاد السطر الأخير من imports
      last_import=$(grep -n "^import" "$file" | tail -1 | cut -d: -f1)
      
      # إضافة import بعد آخر import
      sed -i "${last_import}a\\
import KeyboardAvoidingScrollView from '../../components/KeyboardAvoidingScrollView';" "$file"
      
      echo "  📦 تم إضافة import"
    fi
    
  else
    echo "⚠️  الملف غير موجود: $file"
  fi
done

echo ""
echo "✅ تم الانتهاء!"
echo ""
echo "📝 ملاحظة: يجب استبدال KeyboardAvoidingView + ScrollView يدوياً بـ KeyboardAvoidingScrollView"
echo "   في كل ملف حسب الحاجة"
