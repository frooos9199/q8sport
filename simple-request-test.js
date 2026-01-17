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

console.log('🔐 Token:', token.substring(0, 40) + '...');

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

console.log('📤 Sending to:', options.hostname + options.path);

const requestData = {
  title: 'اختبار',
  description: 'اختبار',
  contactPhone: '+96550000000',
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('\n📊 Response Status:', res.statusCode);
    
    try {
      const response = JSON.parse(data);
      console.log('📦 Response:', JSON.stringify(response, null, 2));
    } catch (e) {
      console.log('Raw:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error.message);
});

req.write(JSON.stringify(requestData));
req.end();
