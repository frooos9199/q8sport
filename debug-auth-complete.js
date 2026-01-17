#!/usr/bin/env node

/**
 * Comprehensive Debug Script
 * Tests the complete flow and identifies where the issue is
 */

const http = require('http');
const jwt = require('jsonwebtoken');

// Configuration
const JWT_SECRET = 'q8sport2025secretkey123456789';
const PRODUCTION_URL = 'https://www.q8sportcar.com';
const USER_ID = 'cmkioo59o0000kv04tcp8m5io'; // test@test.com
const EMAIL = 'test@test.com';

console.log('\n╔════════════════════════════════════════════════════════════════╗');
console.log('║         COMPREHENSIVE AUTHENTICATION & SUBMISSION TEST          ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

// Step 1: Generate token with correct secret
console.log('📝 Step 1: Generating JWT token...');
const token = jwt.sign(
  { userId: USER_ID, email: EMAIL, role: 'USER' },
  JWT_SECRET,
  { expiresIn: '24h' }
);
console.log('✅ Token:', token.substring(0, 50) + '...\n');

// Step 2: Verify token can be decoded
console.log('🔐 Step 2: Verifying token with same secret...');
try {
  const decoded = jwt.verify(token, JWT_SECRET);
  console.log('✅ Token verified successfully');
  console.log('   userId:', decoded.userId);
  console.log('   email:', decoded.email, '\n');
} catch (error) {
  console.error('❌ Token verification failed:', error.message, '\n');
  process.exit(1);
}

// Step 3: Test product submission
console.log('📦 Step 3: Testing product submission...');

const productData = {
  title: 'اختبار شامل - Debug Test',
  description: 'منتج تجريبي',
  price: 1000,
  productType: 'PART',
  category: 'parts',
  contactPhone: '+96550000000',
  images: JSON.stringify(['data:image/jpeg;base64,test']),
};

const makeRequest = (path, data, callback) => {
  const options = {
    hostname: 'www.q8sportcar.com',
    port: 443,
    path: path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    }
  };

  const https = require('https');
  const req = https.request(options, (res) => {
    let responseData = '';

    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      try {
        const parsed = JSON.parse(responseData);
        callback(res.statusCode, parsed);
      } catch (e) {
        callback(res.statusCode, { error: 'Parse error', raw: responseData });
      }
    });
  });

  req.on('error', (error) => {
    callback(0, { error: error.message });
  });

  req.write(JSON.stringify(data));
  req.end();
};

// Test product
makeRequest('/api/products', productData, (status, response) => {
  console.log('   Status:', status);
  if (status === 201) {
    console.log('✅ Product submission SUCCESS\n');
  } else {
    console.log('❌ Product submission FAILED');
    console.log('   Error:', response.error || response);
    console.log();
  }

  // Step 4: Test request submission
  console.log('📋 Step 4: Testing request submission...');

  const requestData = {
    title: 'اختبار - Debug Test',
    description: 'طلب تجريبي',
    category: 'parts',
    contactPhone: '+96550000000',
  };

  makeRequest('/api/requests', requestData, (status, response) => {
    console.log('   Status:', status);
    if (status === 200 || status === 201) {
      console.log('✅ Request submission SUCCESS\n');
    } else {
      console.log('❌ Request submission FAILED');
      console.log('   Error:', response.error || response);
      console.log();
    }

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('If both tests passed: System is working correctly');
    console.log('If product test passed but request failed: Check requests endpoint');
    console.log('If both failed: Check token or authorization headers');
    console.log('═══════════════════════════════════════════════════════════════\n');
  });
});
