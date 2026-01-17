const http = require('http');
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
  title: 'طلب اختبار - Test Request',
  description: 'هذا طلب تجريبي لاختبار الإضافة',
  category: 'parts',
  contactPhone: '+96550000000',
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
    'Content-Length': payload.length
  }
};

console.log('\n🚀 اختبار إضافة مطلوب (LOCAL)...\n');
console.log('📤 الإرسال إلى:', `http://${options.hostname}:${options.port}${options.path}`);
console.log('🔐 التوكن:', token.substring(0, 40) + '...');

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('\n📊 النتيجة: Status', res.statusCode);
    console.log('📋 الرد الكامل:');
    console.log(data);
    
    try {
      const response = JSON.parse(data);
      
      if (res.statusCode === 200 || res.statusCode === 201) {
        console.log('\n✅ النجاح! تم إضافة المطلوب');
        console.log('   ID:', response.request?.id);
      } else {
        console.log('\n❌ فشل:', response.error || response.message);
      }
    } catch (e) {
      console.log('\n⚠️ خطأ في فحص الرد');
    }
  });
});

req.on('error', (e) => {
  console.error('\n❌ خطأ الاتصال:', e.message);
  console.error('   تأكد من أن dev server يعمل على localhost:3000');
});

req.write(payload);
req.end();
