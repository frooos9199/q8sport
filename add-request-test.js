#!/usr/bin/env node

const https = require('https');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'q8sport2025secretkey123456789';
const USER_ID = 'cmkioo59o0000kv04tcp8m5io';
const EMAIL = 'test@test.com';

// إنشاء token
const token = jwt.sign(
  { userId: USER_ID, email: EMAIL, role: 'USER' },
  JWT_SECRET,
  { expiresIn: '24h' }
);

console.log('\n🚀 إضافة مطلوب جديد...\n');

const requestData = {
  title: 'طلب مصد أمامي - تجريبي',
  description: 'مصد أمامي أصلي لتويوتا كامري 2023 بحالة جيدة',
  category: 'parts',
  carBrand: 'Toyota',
  carModel: 'Camry',
  carYear: 2023,
  partName: 'مصد أمامي',
  condition: 'USED',
  budget: 800,
  urgent: false,
  contactPhone: '+965123456789',
  contactWhatsapp: '+965123456789',
};

const options = {
  hostname: 'www.q8sportcar.com',
  port: 443,
  path: '/api/requests',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  }
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('📊 الحالة:', res.statusCode);
    
    try {
      const response = JSON.parse(data);
      
      if (res.statusCode === 200 || res.statusCode === 201) {
        console.log('\n✅ تم إضافة المطلوب بنجاح!\n');
        console.log('📋 تفاصيل المطلوب:');
        console.log('   ID:', response.request?.id);
        console.log('   العنوان:', response.request?.title);
        console.log('   الوصف:', response.request?.description);
        console.log('   الفئة:', response.request?.category);
        console.log('   ماركة السيارة:', response.request?.carBrand);
        console.log('   موديل السيارة:', response.request?.carModel);
        console.log('   السنة:', response.request?.carYear);
        console.log('   الحالة:', response.request?.status);
        console.log('   الميزانية:', response.request?.budget);
        console.log('   رقم الهاتف:', response.request?.contactPhone);
        console.log('   الرسالة:', response.message);
        console.log('\n');
      } else {
        console.log('\n❌ خطأ:\n');
        console.log(JSON.stringify(response, null, 2));
        console.log('\n');
      }
    } catch (e) {
      console.log('\n❌ خطأ في القراءة:\n');
      console.log(data);
      console.log('\n');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ خطأ في الاتصال:', error.message);
});

req.write(JSON.stringify(requestData));
req.end();
