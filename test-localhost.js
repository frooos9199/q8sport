#!/usr/bin/env node

const http = require('http');
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

console.log('\n🚀 Testing localhost with Authorization header...\n');
console.log('Token:', token.substring(0, 20) + '...');

const requestData = {
  title: 'طلب مصد أمامي - تجريبي',
  description: 'مصد أمامي أصلي',
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

const payload = JSON.stringify(requestData);

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/requests',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'Content-Length': payload.length,
  }
};

console.log('📤 Sending request to localhost:3000/api/requests');
console.log('📋 Headers:', {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token.substring(0, 20)}...`,
  'Content-Length': payload.length,
});
console.log('');

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('📊 الحالة:', res.statusCode);
    console.log('');
    
    try {
      const response = JSON.parse(data);
      if (response.success) {
        console.log('✅ نجح:\n', JSON.stringify(response, null, 2));
      } else {
        console.log('❌ خطأ:\n', JSON.stringify(response, null, 2));
      }
    } catch (e) {
      console.log('📝 Response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error.message);
});

req.write(payload);
req.end();
