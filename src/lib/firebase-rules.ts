// ============================================
// 🔒 Firestore Rules - انسخها في Firebase Console
// Firestore Database > Rules
// ============================================
//
// rules_version = '2';
// service cloud.firestore {
//   match /databases/{database}/documents {
//
//     // السيارات - الكل يقرأ، بس المسجلين يكتبون
//     match /cars/{carId} {
//       allow read: if true;
//       allow create: if request.auth != null;
//       allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
//     }
//
//     // قطع الغيار
//     match /parts/{partId} {
//       allow read: if true;
//       allow create: if request.auth != null;
//       allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
//     }
//
//     // الطلبات
//     match /requests/{requestId} {
//       allow read: if true;
//       allow create: if request.auth != null;
//       allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
//     }
//
//     // المعرض - الكل يقرأ
//     match /gallery/{itemId} {
//       allow read: if true;
//       allow write: if request.auth != null;
//     }
//
//     // المستخدمين - يقرأ ملفه بس
//     match /users/{userId} {
//       allow read: if true;
//       allow write: if request.auth != null && request.auth.uid == userId;
//     }
//   }
// }
//
// ============================================
// 🔒 Storage Rules - انسخها في Firebase Console
// Storage > Rules
// ============================================
//
// rules_version = '2';
// service firebase.storage {
//   match /b/{bucket}/o {
//     match /{allPaths=**} {
//       allow read: if true;
//       allow write: if request.auth != null
//                    && request.resource.size < 10 * 1024 * 1024
//                    && request.resource.contentType.matches('image/.*');
//     }
//   }
// }

export {};
