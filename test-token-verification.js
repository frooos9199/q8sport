#!/usr/bin/env node

/**
 * Token Verification Test Script
 * Tests the complete flow from token generation to verification
 */

const jwt = require('jsonwebtoken');

// Configuration
const JWT_SECRET = 'q8sport2025secretkey123456789';
const USER_ID = 'test-user-id';
const EMAIL = 'test@test.com';
const ROLE = 'USER';

console.log('\n===== TOKEN VERIFICATION TEST =====\n');

// Step 1: Generate a token
console.log('📝 Step 1: Generating JWT Token...');
console.log('   JWT_SECRET:', JWT_SECRET);
console.log('   USER_ID:', USER_ID);
console.log('   EMAIL:', EMAIL);

const token = jwt.sign(
  {
    userId: USER_ID,
    email: EMAIL,
    role: ROLE
  },
  JWT_SECRET,
  { expiresIn: '24h' }
);

console.log('✅ Token generated successfully!');
console.log('   Token:', token.substring(0, 50) + '...\n');

// Step 2: Decode the token without verification (to see payload)
console.log('🔍 Step 2: Decoding token payload (without verification)...');
const decoded = jwt.decode(token);
console.log('✅ Token decoded:');
console.log('   userId:', decoded.userId);
console.log('   email:', decoded.email);
console.log('   role:', decoded.role);
console.log('   iat:', new Date(decoded.iat * 1000).toISOString());
console.log('   exp:', new Date(decoded.exp * 1000).toISOString(), '\n');

// Step 3: Verify the token
console.log('🔐 Step 3: Verifying token with JWT_SECRET...');
try {
  const verified = jwt.verify(token, JWT_SECRET);
  console.log('✅ Token verification SUCCESS!');
  console.log('   Verified userId:', verified.userId);
  console.log('   Verified email:', verified.email, '\n');
} catch (error) {
  console.error('❌ Token verification FAILED!');
  console.error('   Error:', error.message, '\n');
  process.exit(1);
}

// Step 4: Test with wrong secret
console.log('🔐 Step 4: Testing with WRONG secret (should fail)...');
try {
  const verified = jwt.verify(token, 'wrong-secret-key');
  console.error('❌ UNEXPECTED: Token verified with wrong secret!');
  process.exit(1);
} catch (error) {
  console.log('✅ Correctly rejected with wrong secret:');
  console.log('   Error:', error.message, '\n');
}

// Step 5: Test expired token
console.log('⏰ Step 5: Testing token expiration...');
const expiredToken = jwt.sign(
  {
    userId: USER_ID,
    email: EMAIL,
    role: ROLE
  },
  JWT_SECRET,
  { expiresIn: '1ms' } // Expire immediately
);

// Wait a bit to ensure token is expired
setTimeout(() => {
  try {
    jwt.verify(expiredToken, JWT_SECRET);
    console.error('❌ UNEXPECTED: Expired token verified!');
    process.exit(1);
  } catch (error) {
    console.log('✅ Correctly rejected expired token:');
    console.log('   Error:', error.message, '\n');
  }

  console.log('===== ALL TESTS PASSED ✅ =====\n');
}, 10);
