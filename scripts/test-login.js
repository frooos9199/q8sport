const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://www.q8sportcar.com';

async function testLogin() {
  try {
    console.log('🔐 Testing login with test@test.com...\n');

    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@test.com',
        password: '123123',
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ LOGIN SUCCESSFUL!\n');
      console.log('User Details:');
      console.log('  - ID:', data.user.id);
      console.log('  - Email:', data.user.email);
      console.log('  - Name:', data.user.name);
      console.log('  - Role:', data.user.role);
      console.log('  - Status:', data.user.status);
      console.log('  - Verified:', data.user.verified);
      console.log('\nPermissions:');
      console.log('  - Can Manage Products:', data.user.permissions?.canManageProducts);
      console.log('  - Can Manage Users:', data.user.permissions?.canManageUsers);
      console.log('  - Can View Reports:', data.user.permissions?.canViewReports);
      console.log('\nToken:', data.token ? '✅ Generated' : '❌ Missing');
      
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ TEST ACCOUNT IS WORKING CORRECTLY!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    } else {
      console.error('❌ LOGIN FAILED!');
      console.error('Status:', response.status);
      console.error('Error:', data.error || data);
      console.log('\n');
    }

  } catch (error) {
    console.error('❌ Error testing login:', error);
  }
}

testLogin();
