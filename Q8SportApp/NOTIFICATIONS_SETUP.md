# 🔔 دليل إعداد Push Notifications

## ✅ ما تم تثبيته

```bash
npm install @react-native-firebase/app @react-native-firebase/messaging
```

---

## 🔥 إعداد Firebase

### 1. إنشاء مشروع Firebase

1. اذهب إلى: https://console.firebase.google.com
2. اضغط "Add project"
3. اسم المشروع: `Q8SportCar`
4. فعّل Google Analytics (اختياري)

### 2. إضافة تطبيق Android

1. في Firebase Console > Project Settings
2. اضغط Android icon
3. Package name: `com.q8sportapp`
4. حمّل `google-services.json`
5. ضعه في: `Q8SportApp/android/app/google-services.json`

### 3. إضافة تطبيق iOS

1. في Firebase Console > Project Settings
2. اضغط iOS icon
3. Bundle ID: `com.q8sportapp`
4. حمّل `GoogleService-Info.plist`
5. ضعه في: `Q8SportApp/ios/Q8SportApp/GoogleService-Info.plist`

---

## 📱 إعداد Android

### 1. تعديل `android/build.gradle`

```gradle
buildscript {
  dependencies {
    // أضف هذا السطر
    classpath 'com.google.gms:google-services:4.4.0'
  }
}
```

### 2. تعديل `android/app/build.gradle`

```gradle
// في نهاية الملف
apply plugin: 'com.google.gms.google-services'
```

### 3. تعديل `AndroidManifest.xml`

```xml
<manifest>
  <application>
    <!-- أضف هذا -->
    <meta-data
      android:name="com.google.firebase.messaging.default_notification_channel_id"
      android:value="q8sport_channel" />
  </application>
</manifest>
```

---

## 🍎 إعداد iOS

### 1. تثبيت Pods

```bash
cd ios
pod install
cd ..
```

### 2. تفعيل Push Notifications في Xcode

1. افتح `Q8SportApp.xcworkspace` في Xcode
2. اختر Target > Signing & Capabilities
3. اضغط "+ Capability"
4. أضف "Push Notifications"
5. أضف "Background Modes"
6. فعّل "Remote notifications"

### 3. تعديل `AppDelegate.swift`

```swift
import Firebase
import UserNotifications

@main
class AppDelegate: UIResponder, UIApplicationDelegate, UNUserNotificationCenterDelegate {
  
  func application(_ application: UIApplication, 
                   didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    
    // Firebase
    FirebaseApp.configure()
    
    // Notifications
    UNUserNotificationCenter.current().delegate = self
    
    return true
  }
  
  // Handle notifications
  func userNotificationCenter(_ center: UNUserNotificationCenter,
                            willPresent notification: UNNotification,
                            withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
    completionHandler([[.banner, .sound]])
  }
}
```

---

## 🔧 تحديث App.tsx

```javascript
import { NotificationProvider } from './src/contexts/NotificationContext';

const App = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <AppNavigator />
      </NotificationProvider>
    </AuthProvider>
  );
};
```

---

## 🌐 Backend API

### إضافة endpoint لحفظ FCM Token

```typescript
// src/app/api/user/fcm-token/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    const { token: fcmToken } = await req.json();

    await prisma.user.update({
      where: { id: decoded.userId },
      data: { fcmToken },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save token' }, { status: 500 });
  }
}
```

### إضافة حقل fcmToken في Prisma Schema

```prisma
model User {
  // ... existing fields
  fcmToken String?
}
```

### إرسال إشعار

```typescript
// src/lib/notifications.ts
import admin from 'firebase-admin';

export async function sendNotification(userId: string, title: string, body: string, data?: any) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { fcmToken: true },
  });

  if (!user?.fcmToken) return;

  await admin.messaging().send({
    token: user.fcmToken,
    notification: { title, body },
    data,
  });
}
```

---

## 🧪 اختبار الإشعارات

### 1. من Firebase Console

1. اذهب إلى Cloud Messaging
2. اضغط "Send your first message"
3. اكتب العنوان والنص
4. اختر التطبيق
5. أرسل

### 2. من الكود

```javascript
import NotificationService from './src/services/NotificationService';

// في أي مكان
const token = await NotificationService.getToken();
console.log('FCM Token:', token);
```

---

## 📋 أمثلة الاستخدام

### إشعار مزايدة جديدة

```typescript
// عند إضافة مزايدة
await sendNotification(
  auction.sellerId,
  'مزايدة جديدة! 🔥',
  `مزايدة جديدة على ${auction.title} بسعر ${bid.amount} د.ك`,
  { type: 'NEW_BID', auctionId: auction.id }
);
```

### إشعار رسالة جديدة

```typescript
await sendNotification(
  message.receiverId,
  'رسالة جديدة 💬',
  `${sender.name}: ${message.content}`,
  { type: 'NEW_MESSAGE', senderId: sender.id }
);
```

### إشعار انتهاء مزاد

```typescript
await sendNotification(
  auction.highestBidderId,
  'مبروك! 🎉',
  `فزت بالمزاد: ${auction.title}`,
  { type: 'AUCTION_WON', auctionId: auction.id }
);
```

---

## 🎯 الملفات المُنشأة

1. ✅ `src/services/NotificationService.js` - خدمة الإشعارات
2. ✅ `src/contexts/NotificationContext.js` - Context للإشعارات
3. ✅ `android/app/google-services.json` - Firebase Android
4. ⏳ `ios/Q8SportApp/GoogleService-Info.plist` - Firebase iOS (يدوي)

---

## ⚠️ ملاحظات مهمة

1. **Firebase Project**: يجب إنشاء مشروع Firebase حقيقي
2. **APNs Certificate**: لـ iOS يجب رفع certificate في Firebase
3. **Testing**: اختبر على جهاز حقيقي (لا يعمل على المحاكي)
4. **Permissions**: تأكد من طلب الأذونات

---

## 🚀 الخطوات التالية

1. إنشاء مشروع Firebase
2. تحميل ملفات التكوين
3. تحديث App.tsx
4. إضافة API endpoint
5. اختبار الإشعارات

---

**الحالة:** ⏳ جاهز للإعداد (يحتاج Firebase Project)
