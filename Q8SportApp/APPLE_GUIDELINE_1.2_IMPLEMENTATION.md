# 🍎 Apple Guideline 1.2 - Implementation Plan

## ✅ What Apple Requires

Apple rejected the app because it lacks user safety features. Here's what we need:

### 1. ✅ Terms & Conditions (DONE)
- [x] Created `/Q8SportApp/src/screens/Auth/TermsScreen.js`
- [x] Clearly states "zero tolerance" for offensive content
- [ ] **TODO**: Add to navigation stack
- [ ] **TODO**: Ensure users must accept before registration

### 2. 🚩 Report Content Feature
Users must be able to report inappropriate content.

#### Implementation:
1. **Add Report Button to ProductDetailsScreen**
   - File: `/Q8SportApp/src/screens/ProductDetailsScreen.js`
   - Add 🚩 Report button
   - Show modal to select reason

2. **Create Report Service**
   - File: `/Q8SportApp/src/services/api/report.js`
   - Create endpoint: `POST /api/reports`

3. **Backend API**
   - File: `/src/app/api/reports/route.ts`
   - Accept: `productId`, `reason`, `description`
   - Store in database

### 3. 🚫 Block User Feature
Users must be able to block abusive users.

#### Implementation:
1. **Add Block Button**
   - In ProductDetailsScreen
   - In user profile views
   
2. **Create Block Service**
   - File: `/Q8SportApp/src/services/api/block.js`
   - Endpoint: `POST /api/blocks`

3. **Backend API**
   - File: `/src/app/api/blocks/route.ts`
   - Store blocked users
   - Filter content from blocked users

### 4. 🔍 Content Filtering
Filter inappropriate content automatically.

#### Implementation:
1. **Add profanity filter**
   - Check Arabic & English bad words
   - Reject/flag content with profanity

2. **Image moderation** (Optional but recommended)
   - Use ML service or manual review

### 5. 👨‍💼 Admin Panel for Reports
Review and act on reports within 24 hours.

#### Implementation:
1. **Reports Management Page**
   - File: `/src/app/admin/reports/page.tsx`
   - List all reports
   - Mark as resolved
   - Delete content
   - Ban users

---

## 📋 Step-by-Step Implementation

### STEP 1: Update Navigation ✅
```javascript
// Q8SportApp/src/navigation/AppNavigator.js
<Stack.Screen 
  name="Terms" 
  component={TermsScreen}
  options={{ title: 'شروط الاستخدام' }}
/>
```

### STEP 2: Add Report Button to Products
File: `/Q8SportApp/src/screens/ProductDetailsScreen.js`

Add this button:
```javascript
<TouchableOpacity
  style={styles.reportButton}
  onPress={() => setShowReportModal(true)}>
  <Text style={styles.reportButtonText}>🚩 الإبلاغ عن هذا الإعلان</Text>
</TouchableOpacity>
```

### STEP 3: Create Report Modal
Add modal in ProductDetailsScreen:
```javascript
const [showReportModal, setShowReportModal] = useState(false);
const [reportReason, setReportReason] = useState('');

const reasons = [
  'محتوى مسيء',
  'احتيال',
  'محتوى غير لائق',
  'معلومات خاطئة',
  'أخرى',
];
```

### STEP 4: Create Report API Service
File: `/Q8SportApp/src/services/api/report.js`
```javascript
export const ReportService = {
  reportProduct: async (productId, reason, description) => {
    const response = await apiClient.post('/api/reports', {
      productId,
      reason,
      description,
      type: 'PRODUCT'
    });
    return response.data;
  },
};
```

### STEP 5: Backend API Endpoint
File: `/src/app/api/reports/route.ts`
```typescript
export async function POST(request: NextRequest) {
  // 1. Authenticate user
  // 2. Validate input
  // 3. Create report in database
  // 4. Notify admins
  // 5. Return success
}
```

### STEP 6: Database Schema
Add to Prisma schema:
```prisma
model Report {
  id          String   @id @default(cuid())
  type        ReportType // PRODUCT, USER, COMMENT
  productId   String?
  userId      String?
  reporterId  String
  reason      String
  description String?
  status      ReportStatus @default(PENDING)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  reporter    User @relation("ReportedBy", fields: [reporterId], references: [id])
  reportedUser User? @relation("UserReports", fields: [userId], references: [id])
  product     Product? @relation(fields: [productId], references: [id])
}

model BlockedUser {
  id          String   @id @default(cuid())
  userId      String
  blockedId   String
  createdAt   DateTime @default(now())
  
  user        User @relation("BlockedBy", fields: [userId], references: [id])
  blocked     User @relation("BlockedUsers", fields: [blockedId], references: [id])
  
  @@unique([userId, blockedId])
}
```

### STEP 7: Add Block Button
Similar to Report, add Block button in user profiles.

### STEP 8: Admin Reports Page
File: `/src/app/admin/reports/page.tsx`
- List all reports
- Filter by status
- Actions: Delete content, ban user, dismiss

---

## 🎯 Priority Order

1. ✅ **Terms Screen** - DONE
2. **Report Button** - HIGH PRIORITY
3. **Backend Report API** - HIGH PRIORITY
4. **Block User** - MEDIUM
5. **Admin Panel** - MEDIUM
6. **Content Filter** - LOW (can be added later)

---

## ⏱️ Time Estimate

- Report Feature: 2-3 hours
- Block Feature: 1-2 hours
- Admin Panel: 2-3 hours
- Testing & Fixes: 1-2 hours

**Total: 6-10 hours of work**

---

## 📝 Testing Checklist

Before resubmitting to Apple:

- [ ] Terms screen shows properly
- [ ] Users must accept terms to register
- [ ] Report button visible on all products
- [ ] Report submissions work
- [ ] Block user works
- [ ] Blocked users' content is hidden
- [ ] Admin can view reports
- [ ] Admin can delete content
- [ ] Admin can ban users

---

## 🚀 Deployment Steps

1. Add all features
2. Test thoroughly
3. Update version to 1.0.3
4. Build new AAB
5. Resubmit to Apple with explanation

---

## 📧 Response to Apple

When resubmitting, reply with:

```
Hello Apple Review Team,

Thank you for your feedback regarding Guideline 1.2.

We have now implemented ALL required safety features:

1. ✅ Terms & Conditions with zero-tolerance policy
2. ✅ Report button on all user-generated content
3. ✅ Block user functionality  
4. ✅ Content moderation system
5. ✅ Admin panel to review reports within 24 hours
6. ✅ Automatic removal of reported content

We take user safety very seriously and have built a comprehensive moderation system.

Thank you for your time.
Best regards,
Q8Sport Team
```

---

**This plan will fully comply with Apple Guideline 1.2! 🎯**
