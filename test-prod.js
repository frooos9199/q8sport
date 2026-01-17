const https = require('https');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'q8sport2025secretkey123456789';
const USER_ID = 'cmkioo59o0000kv04tcp8m5io';
const EMAIL = 'test@test.com';

const token = jwt.sign(
  { userId: USER_ID, email: EMAIL, role: 'USER' },
  JWT_SECRET,
  { expiresIn: '24h' }
);

const requestData = {
  title: 'طلب اختبار - Production Test',
  description: 'اختبار من الإنتاج',
  category: 'parts',
  contactPhone: '+96550000000',
};

const payload = JSON.stringify(requestData);

const options = {
  hostname: 'www.q8sportcar.com',
  port: 443,
  path: '/api/requests',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'Content-Length': payload.length
  }
};

console.log('\n🚀 اختبار إضافة مطلوب (PRODUCTION)...\n');
console.log('📤 الإرسال إلى:', `https://${options.hostname}${options.path}`);
console.log('🔐 التوكن:', token.substring(0, 40) + '...');

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('\n📊 النتيجة: Status', res.statusCode);
    console.log('📋 الرد:');
    console.log(data);
  });
});

req.on('error', (e) => {
  console.error('\n❌ خطأ:', e.message);
});

req.write(payload);
req.end();
