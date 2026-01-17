#!/usr/bin/env node

/**
 * Comprehensive End-to-End Test Script
 * Simulates the complete product submission flow
 */

const http = require('http');
const jwt = require('jsonwebtoken');

// Configuration (same as in .env.local)
const JWT_SECRET = 'q8sport2025secretkey123456789';
const API_URL = 'http://localhost:3000';
const USER_ID = 'test-user-1';
const EMAIL = 'test@test.com';

console.log('\n===== END-TO-END PRODUCT SUBMISSION TEST =====\n');

// Step 1: Generate JWT Token
console.log('📝 Step 1: Generating JWT Token...');
const token = jwt.sign(
  {
    userId: USER_ID,
    email: EMAIL,
    role: 'USER'
  },
  JWT_SECRET,
  { expiresIn: '24h' }
);
console.log('✅ Token generated:', token.substring(0, 50) + '...\n');

// Step 2: Create test product data
console.log('📦 Step 2: Preparing test product data...');
const productData = {
  title: 'اختبار المنتج - Test Product',
  description: 'اختبار شامل لعملية الإضافة',
  price: 1000,
  productType: 'PART',
  category: 'parts',
  carBrand: 'Toyota',
  carModel: 'Camry',
  carYear: 2023,
  condition: 'NEW',
  contactPhone: '+96550000000',
  images: JSON.stringify(['data:image/jpeg;base64,fake-image-data']),
};
console.log('✅ Product data prepared:\n', productData, '\n');

// Step 3: Make POST request to create product
console.log('🚀 Step 3: Sending product creation request...');
console.log('   URL:', `${API_URL}/api/products`);
console.log('   Method: POST');
console.log('   Authorization: Bearer ' + token.substring(0, 30) + '...\n');

// Parse URL
const urlObj = new URL(`${API_URL}/api/products`);
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
    console.log('📊 Response Headers:', res.headers);
    
    try {
      const responseData = JSON.parse(data);
      console.log('📊 Response Body:');
      console.log(JSON.stringify(responseData, null, 2));

      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log('\n✅ TEST PASSED - Product created successfully!');
      } else {
        console.log('\n❌ TEST FAILED - Error response from server');
      }
    } catch (error) {
      console.log('❌ ERROR: Could not parse response as JSON');
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error.message);
  console.error('⚠️  Make sure Next.js server is running at http://localhost:3000');
  process.exit(1);
});

// Send request body
req.write(JSON.stringify(productData));
req.end();
