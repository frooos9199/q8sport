#!/usr/bin/env node

/**
 * Complete End-to-End Request Submission Test
 */

const http = require('http');
const jwt = require('jsonwebtoken');

// Configuration
const JWT_SECRET = 'q8sport2025secretkey123456789';
const API_URL = 'http://localhost:3000';
const USER_ID = 'cmkioo59o0000kv04tcp8m5io';
const EMAIL = 'test@test.com';

console.log('\n===== END-TO-END REQUEST SUBMISSION TEST =====\n');

// Generate JWT Token
console.log('📝 Generating JWT Token...');
const token = jwt.sign(
  {
    userId: USER_ID,
    email: EMAIL,
    role: 'USER'
  },
  JWT_SECRET,
  { expiresIn: '24h' }
);
console.log('✅ Token generated\n');

// Prepare request data
console.log('📦 Preparing request data...');
const requestData = {
  title: 'طلب قطع - Complete Test Request',
  description: 'طلب تجريبي شامل لاختبار النظام',
  carBrand: 'Toyota',
  carModel: 'Camry',
  carYear: 2023,
  category: 'parts',
  partName: 'مصد أمامي',
  condition: 'NEW',
  budget: 500,
  urgent: false,
  contactPhone: '+96550000000',
  contactWhatsapp: '+96550000000',
};
console.log('✅ Request data prepared\n');

// Make POST request
console.log('🚀 Sending request creation request...');
console.log('   URL: http://localhost:3000/api/requests\n');

const urlObj = new URL(`${API_URL}/api/requests`);
const options = {
  hostname: urlObj.hostname,
  port: urlObj.port || 3000,
  path: urlObj.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  }
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('📊 Response Status:', res.statusCode);
    
    try {
      const responseData = JSON.parse(data);
      
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log('\n✅ SUCCESS! Request created:');
        console.log('   Request ID:', responseData.id);
        console.log('   Title:', responseData.title);
        console.log('   User ID:', responseData.userId);
        console.log('   Status:', responseData.status);
        console.log('\n✅ TEST PASSED - Request submitted successfully!\n');
      } else {
        console.log('\n❌ ERROR Response:');
        console.log(JSON.stringify(responseData, null, 2));
      }
    } catch (error) {
      console.log('❌ ERROR: Could not parse response as JSON');
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error.message);
  process.exit(1);
});

req.write(JSON.stringify(requestData));
req.end();
