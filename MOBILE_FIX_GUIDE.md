# 🔧 دليل الإصلاحات العاجلة - Q8Sport Mobile

**المطلوب:** إصلاحات أمنية + تفعيل Push Notifications  
**المدة:** 2-3 أسابيع  
**الأولوية:** عاجلة قبل الإطلاق

---

## 📋 قائمة المهام

### ✅ المرحلة 1: الأمان (أسبوع 1)

#### 1. تطبيق React Native Keychain لتخزين آمن

**المشكلة الحالية:**  
كلمات المرور تُخزن بـ Base64 في `AsyncStorage` (غير آمن)

**الحل:**

```bash
# التثبيت
cd Q8SportApp
npm install react-native-keychain
cd ios && pod install && cd ..
```

**الملفات المطلوب تعديلها:**

📁 `Q8SportApp/src/utils/storage.js`

```javascript
import * as Keychain from 'react-native-keychain';

export const StorageUtils = {
  // حفظ بيانات البيومترك بشكل آمن
  saveBiometricCredentials: async (email, password) => {
    try {
      await Keychain.setGenericPassword(email, password, {
        service: 'biometric',
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
      return true;
    } catch (error) {
      Logger.error('Save biometric credentials error:', error);
      return false;
    }
  },

  // استرجاع بيانات البيومترك
  getBiometricCredentials: async () => {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: 'biometric',
      });
      if (credentials) {
        return {
          email: credentials.username,
          password: credentials.password,
        };
      }
      return null;
    } catch (error) {
      Logger.error('Get biometric credentials error:', error);
      return null;
    }
  },

  // حذف بيانات البيومترك
  deleteBiometricCredentials: async () => {
    try {
      await Keychain.resetGenericPassword({
        service: 'biometric',
      });
      return true;
    } catch (error) {
      Logger.error('Delete biometric credentials error:', error);
      return false;
    }
  },
};
```

---

#### 2. إضافة SSL Pinning

**المشكلة:**  
التطبيق معرض لـ Man-in-the-Middle Attacks

**الحل:**

```bash
# التثبيت
npm install react-native-ssl-pinning
cd ios && pod install && cd ..
```

**الملفات المطلوب إنشاؤها:**

📁 `Q8SportApp/src/config/sslPinning.js`

```javascript
import { fetch } from 'react-native-ssl-pinning';

export const secureFetch = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      sslPinning: {
        certs: ['sha256/YOUR_CERTIFICATE_HASH_HERE'],
      },
      timeoutInterval: 10000,
    });
    return response;
  } catch (error) {
    throw error;
  }
};
```

**الحصول على Certificate Hash:**

```bash
# للحصول على SHA256 hash من السيرفر
openssl s_client -servername yourdomain.com -connect yourdomain.com:443 | openssl x509 -pubkey -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | openssl enc -base64
```

**تعديل apiClient:**

📁 `Q8SportApp/src/services/apiClient.js`

استبدال `fetch` العادي بـ `secureFetch` من ssl-pinning

---

#### 3. فحص صلاحية التوكن

📁 `Q8SportApp/src/contexts/AuthContext.js`

```javascript
import jwt_decode from 'jwt-decode';

// إضافة دالة فحص صلاحية التوكن
const isTokenExpired = (token) => {
  try {
    const decoded = jwt_decode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch {
    return true;
  }
};

// في useEffect أو عند كل API call
useEffect(() => {
  const checkTokenValidity = async () => {
    const token = await AsyncStorage.getItem('authToken');
    if (token && isTokenExpired(token)) {
      await logout(); // تسجيل خروج تلقائي
      Alert.alert('انتهت الجلسة', 'الرجاء تسجيل الدخول مرة أخرى');
    }
  };
  
  checkTokenValidity();
  // فحص كل 5 دقائق
  const interval = setInterval(checkTokenValidity, 5 * 60 * 1000);
  return () => clearInterval(interval);
}, []);
```

التثبيت:
```bash
npm install jwt-decode
```

---

### ✅ المرحلة 2: Push Notifications Backend (أسبوع 2)

#### 1. إعداد Firebase Admin في Backend

📁 `src/lib/firebase-admin.ts` (جديد)

```typescript
import admin from 'firebase-admin';

// تحميل Service Account
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

// تهيئة Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

// دالة إرسال إشعار
export async function sendPushNotification(
  token: string,
  title: string,
  body: string,
  data?: Record<string, string>
) {
  try {
    const message: admin.messaging.Message = {
      token,
      notification: {
        title,
        body,
      },
      data,
      android: {
        priority: 'high',
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const response = await admin.messaging().send(message);
    return { success: true, messageId: response };
  } catch (error) {
    console.error('Push notification error:', error);
    return { success: false, error };
  }
}

// إرسال لعدة أجهزة
export async function sendMulticastNotification(
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>
) {
  try {
    const message: admin.messaging.MulticastMessage = {
      tokens,
      notification: { title, body },
      data,
    };

    const response = await admin.messaging().sendMulticast(message);
    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
    };
  } catch (error) {
    console.error('Multicast notification error:', error);
    return { success: false, error };
  }
}
```

#### 2. إضافة FCM Token في Database

📁 `prisma/schema.prisma`

```prisma
model User {
  // ... الحقول الموجودة
  fcmToken    String?  // إضافة هذا الحقل
  fcmTokens   String[] // للأجهزة المتعددة (optional)
  // ...
}
```

تطبيق التغيير:
```bash
npx prisma migrate dev --name add_fcm_token
```

#### 3. API لحفظ FCM Token

📁 `src/app/api/user/fcm-token/route.ts` (جديد)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const POST = requireAuth(async (request: AuthenticatedRequest) => {
  try {
    const { fcmToken } = await request.json();
    
    if (!fcmToken) {
      return NextResponse.json(
        { error: 'FCM token مطلوب' },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: request.user!.userId },
      data: { fcmToken },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('FCM token save error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في حفظ التوكن' },
      { status: 500 }
    );
  }
});
```

#### 4. إرسال إشعار عند المزايدة

📁 `src/app/api/auctions/[id]/bid/route.ts`

```typescript
import { sendPushNotification } from '@/lib/firebase-admin';

// بعد إنشاء bid ناجح
const seller = await prisma.user.findUnique({
  where: { id: auction.sellerId },
  select: { fcmToken: true, name: true },
});

if (seller?.fcmToken) {
  await sendPushNotification(
    seller.fcmToken,
    'مزايدة جديدة! 🔥',
    `${bidder.name} قدم مزايدة ${amount} دينار على ${auction.title}`,
    {
      type: 'new_bid',
      auctionId: auction.id,
      amount: amount.toString(),
    }
  );
}
```

#### 5. تحديث Mobile App لإرسال Token

📁 `Q8SportApp/src/contexts/AuthContext.js`

```javascript
import messaging from '@react-native-firebase/messaging';
import apiClient from '../services/apiClient';

// بعد تسجيل الدخول الناجح
const sendFCMToken = async () => {
  try {
    const fcmToken = await messaging().getToken();
    if (fcmToken) {
      await apiClient.post('/user/fcm-token', { fcmToken });
    }
  } catch (error) {
    Logger.error('Send FCM token error:', error);
  }
};

// استدعاء بعد login
await sendFCMToken();
```

---

### ✅ المرحلة 3: تحسينات أخرى (اختياري)

#### 1. ضغط الصور

```bash
npm install react-native-image-resizer
```

📁 `Q8SportApp/src/utils/imageUtils.js` (جديد)

```javascript
import ImageResizer from 'react-native-image-resizer';

export const compressImage = async (imageUri) => {
  try {
    const resized = await ImageResizer.createResizedImage(
      imageUri,
      1200, // max width
      1200, // max height
      'JPEG',
      80, // quality
      0, // rotation
      null,
      false,
      { mode: 'contain', onlyScaleDown: true }
    );
    return resized.uri;
  } catch (error) {
    Logger.error('Image compression error:', error);
    return imageUri; // return original if compression fails
  }
};
```

الاستخدام في `AddProductScreen.js`:

```javascript
import { compressImage } from '../../utils/imageUtils';

const handleImagePick = async (result) => {
  if (result.assets && result.assets.length > 0) {
    const image = result.assets[0];
    const compressedUri = await compressImage(image.uri);
    // استخدم compressedUri للرفع
  }
};
```

#### 2. Analytics

```bash
npm install @react-native-firebase/analytics
cd ios && pod install && cd ..
```

📁 `Q8SportApp/src/utils/analytics.js` (جديد)

```javascript
import analytics from '@react-native-firebase/analytics';

export const logEvent = async (eventName, params = {}) => {
  try {
    await analytics().logEvent(eventName, params);
  } catch (error) {
    Logger.error('Analytics error:', error);
  }
};

// أمثلة للاستخدام
export const Analytics = {
  logLogin: (method) => logEvent('login', { method }),
  logViewProduct: (productId) => logEvent('view_product', { product_id: productId }),
  logAddProduct: (category) => logEvent('add_product', { category }),
  logBid: (auctionId, amount) => logEvent('place_bid', { auction_id: auctionId, amount }),
  logSearch: (query) => logEvent('search', { search_term: query }),
};
```

---

## 🧪 الاختبار

### قائمة الاختبار قبل الإطلاق:

- [ ] **الأمان:**
  - [ ] كلمات المرور محفوظة في Keychain
  - [ ] SSL Pinning يعمل
  - [ ] Token expiry يتم فحصه
  
- [ ] **Push Notifications:**
  - [ ] FCM Token يُحفظ في Database
  - [ ] إشعار عند مزايدة جديدة
  - [ ] إشعار عند رسالة جديدة
  - [ ] إشعار عند قرب انتهاء المزاد

- [ ] **الصور:**
  - [ ] يتم ضغط الصور قبل الرفع
  - [ ] الصور تُعرض بجودة جيدة
  
- [ ] **Analytics:**
  - [ ] Events تُسجل في Firebase Console
  - [ ] User properties محدثة

---

## 📝 Environment Variables مطلوبة

📁 `.env` (Backend)

```env
# Firebase Admin
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk@your-project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

للحصول على هذه القيم:
1. اذهب إلى [Firebase Console](https://console.firebase.google.com)
2. Project settings → Service accounts
3. Generate new private key
4. انسخ القيم من JSON file

---

## ⏱️ الجدول الزمني المقترح

| اليوم | المهمة |
|------|--------|
| 1-2 | تطبيق Keychain |
| 3-4 | إضافة SSL Pinning |
| 5 | فحص صلاحية التوكن |
| 6-7 | اختبار الأمان |
| 8-9 | إعداد Firebase Admin |
| 10-11 | API حفظ FCM Token |
| 12-13 | تطبيق الإشعارات في APIs |
| 14 | اختبار الإشعارات |
| 15-16 | ضغط الصور + Analytics |
| 17-21 | اختبار شامل ونهائي |

**المجموع:** 21 يوم (3 أسابيع)

---

## 🆘 مصادر مساعدة

### Documentation:
- [React Native Keychain](https://github.com/oblador/react-native-keychain)
- [React Native SSL Pinning](https://github.com/MaxToyberman/react-native-ssl-pinning)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)

### إذا واجهت مشاكل:
1. تحقق من الـ logs في Xcode/Android Studio
2. راجع Firebase Console للـ errors
3. استخدم `Logger.error()` للتتبع
4. اختبر على جهاز حقيقي (ليس simulator)

---

**Good Luck! 🚀**
