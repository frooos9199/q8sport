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
  title: 'طلب اختبار - Test Request',
  description: 'هذا طلب تجريبي لاختبار الإضافة',
  category: 'parts',
  contactPhone: '+96550000000',
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

console.log('\n🚀 اختبار إضافة مطلوب...\n');
console.log('📤 الإرسال إلى:', options.hostname + options.path);
console.log('🔐 التوكن:', token.substring(0, 40) + '...');

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('\n📊 النتيجة: Status', res.statusCode);
    
    try {
      const response = JSON.parse(data);
      
      if (res.statusCode === 200 || res.statusCode === 201) {
        console.log('✅ النجاح! تم إضافة المطلوب');
        console.log('   المعرف:', response.request?.id || response.id);
        console.log('   العنوان:', response.request?.title || response.title);
      } else {
        console.log('❌ خطأ:', response.error || response.message);
      }
    } catch (e) {
      console.log('Error:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ خطأ:', error.message);
});

req.write(JSON.stringify(requestData));
req.end();
