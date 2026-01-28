# 🔥 إعداد Firebase لإعادة تعيين كلمة المرور

## 1. تثبيت Firebase

```bash
cd Q8SportApp
npm install @react-native-firebase/app @react-native-firebase/auth
```

## 2. إعداد Firebase Console

1. اذهب إلى: https://console.firebase.google.com
2. أنشئ مشروع جديد أو استخدم مشروع موجود
3. فعّل **Authentication** > **Sign-in method** > **Email/Password**
4. في **Templates** > **Password reset**، عدّل القالب بالعربي

## 3. إعداد Android

### 3.1 تحميل google-services.json
1. في Firebase Console > Project Settings
2. أضف تطبيق Android
3. حمّل `google-services.json`
4. ضعه في: `android/app/google-services.json`

### 3.2 تعديل android/build.gradle
```gradle
buildscript {
  dependencies {
    classpath 'com.google.gms:google-services:4.4.0'
  }
}
```

### 3.3 تعديل android/app/build.gradle
```gradle
apply plugin: 'com.google.gms.google-services'
```

## 4. إعداد iOS

### 4.1 تحميل GoogleService-Info.plist
1. في Firebase Console > Project Settings
2. أضف تطبيق iOS
3. حمّل `GoogleService-Info.plist`
4. ضعه في: `ios/Q8SportApp/GoogleService-Info.plist`

### 4.2 تثبيت Pods
```bash
cd ios
pod install
cd ..
```

## 5. إعادة البناء

```bash
# Android
npm run android

# iOS
npm run ios
```

## 6. الاستخدام

الكود جاهز في `ChangePasswordScreen.js` - فقط أكمل الخطوات أعلاه!
