# Response Template for App Store Connect

---

## Message to Send to Apple Review Team:

---

**Subject:** Re: Guideline 2.1 - Demo Account Credentials Updated

Dear Apple Review Team,

Thank you for your feedback regarding the demo account credentials.

We have investigated and resolved the issue. The test account was missing from the production database, but it has now been created and fully tested.

**Updated Demo Account Credentials:**

```
Username: test@test.com
Password: 123123
```

**Account Details:**
- Full admin access with all features enabled
- Pre-loaded with 4 demo products (cars and spare parts)
- All functionalities accessible
- Verified and tested on January 27, 2026

**What You Can Test:**
1. Login with the credentials above
2. Browse products on the home screen
3. View product details with images
4. Add new products (cars or spare parts)
5. Edit/delete existing products
6. Access admin dashboard
7. View user management features
8. Test all app functionalities

**Verification Completed:**
✅ Account created in production database
✅ Login tested and working
✅ All permissions configured
✅ Demo products added
✅ Full feature access confirmed

We have thoroughly tested the login process and can confirm the credentials are working correctly. The account provides full access to all features and functionality in the app.

If you encounter any issues or need any additional information, please don't hesitate to reach out through App Store Connect. We're available to provide immediate support.

Thank you for your patience and for reviewing our app!

Best regards,
Q8Sport Team

---

**Submission ID:** 23d28156-a06e-4c7e-9f76-3e566de560cf
**Version:** 1.0.2

---

## Steps to Update in App Store Connect:

1. Log into [App Store Connect](https://appstoreconnect.apple.com)
2. Navigate to your app submission
3. Find the "Demo Account Information" section
4. Update with the credentials above:
   - Username: `test@test.com`
   - Password: `123123`
5. Add the message above in the "Notes" or reply to the review message
6. Click "Resubmit for Review"

---

## Additional Information (if requested):

**App Features:**
- User authentication with email/password
- Browse and search for cars and spare parts
- View detailed product information
- Upload and manage products
- Contact sellers via phone/WhatsApp
- Admin dashboard for management
- Arabic language interface
- User and shop management
- Reports and analytics

**Demo Products Included:**
1. Ford Raptor Engine 2022 (Spare Part)
2. Ford Raptor 2023 (Full Car)
3. Chevrolet Camaro SS 2021 (Full Car)
4. Corvette Parts (Spare Parts)

**Technical Details:**
- Backend: Next.js API running on Vercel
- Database: PostgreSQL with Prisma ORM
- Authentication: JWT tokens with bcrypt password hashing
- Platform: iOS app with React Native

---

**Account is ready and verified for review!** ✅
