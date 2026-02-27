# إصلاح مشكلة الكيبورد - Keyboard Fix

## المشكلة
الكيبورد يغطي على حقول الإدخال في بعض الصفحات

## الحل
استخدام `KeyboardAvoidingScrollView` في جميع الصفحات التي فيها حقول إدخال

## كيفية الاستخدام

### 1. استيراد الـ Component
```javascript
import KeyboardAvoidingScrollView from '../../components/KeyboardAvoidingScrollView';
```

### 2. استبدال View أو ScrollView
**قبل:**
```javascript
<View style={styles.container}>
  <TextInput placeholder="الاسم" />
  <TextInput placeholder="البريد الإلكتروني" />
</View>
```

**بعد:**
```javascript
<KeyboardAvoidingScrollView style={styles.container}>
  <TextInput placeholder="الاسم" />
  <TextInput placeholder="البريد الإلكتروني" />
</KeyboardAvoidingScrollView>
```

## الصفحات التي تحتاج التعديل

### صفحات المصادقة (Auth)
- ✅ `/screens/Auth/LoginScreen.js`
- ✅ `/screens/Auth/RegisterScreen.js`

### صفحات البروفايل (Profile)
- ✅ `/screens/Profile/AddProductScreen.js`
- ✅ `/screens/Profile/EditProductScreen.js`
- ✅ `/screens/Profile/EditProfileScreen.js`
- ✅ `/screens/Profile/ChangePasswordScreen.js`
- ✅ `/screens/Profile/SettingsScreen.js`

### صفحات المزادات (Auctions)
- ✅ `/screens/Auctions/AddAuctionScreen.js`

### صفحات المطلوبات (Requests)
- ✅ `/screens/Requests/AddRequestScreen.js`

### صفحات المتاجر (Stores)
- ✅ `/screens/Stores/AddShowcaseScreen.js`

### صفحات الإدارة (Admin)
- ✅ `/screens/Admin/ManageUsersScreen.js`
- ✅ `/screens/Admin/AdminSettingsScreen.js`

### صفحات الرسائل (Messages)
- ✅ `/screens/Messages/ChatScreen.js`

## مثال كامل

```javascript
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import KeyboardAvoidingScrollView from '../../components/KeyboardAvoidingScrollView';

const MyScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  return (
    <KeyboardAvoidingScrollView style={styles.container}>
      <View style={styles.content}>
        <TextInput
          style={styles.input}
          placeholder="الاسم"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="البريد الإلكتروني"
          value={email}
          onChangeText={setEmail}
        />
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>حفظ</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    padding: 20,
  },
  input: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#DC2626',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default MyScreen;
```

## ملاحظات مهمة
- ✅ يعمل على iOS و Android
- ✅ يدعم RTL (العربي)
- ✅ Scroll تلقائي للحقل النشط
- ✅ paddingBottom: 100 لضمان ظهور كل المحتوى
- ✅ keyboardShouldPersistTaps="handled" للسماح بالضغط خارج الكيبورد

## التطبيق السريع
ابحث في كل ملف عن:
- `<View style={styles.container}>`
- `<ScrollView>`

واستبدلها بـ:
- `<KeyboardAvoidingScrollView style={styles.container}>`

---
**آخر تحديث:** 2025
