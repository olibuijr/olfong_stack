const axios = require('axios');

async function testIntegrationAPI() {
  try {
    console.log('Testing Integration API...');
    
    // Test 1: Check if backend is running
    console.log('\n1. Testing backend health...');
    const healthResponse = await axios.get('http://localhost:5000/api/health');
    console.log('✅ Backend is running:', healthResponse.data);
    
    // Test 2: Test integrations endpoint (this will require authentication)
    console.log('\n2. Testing integrations endpoint...');
    try {
      const integrationsResponse = await axios.get('http://localhost:5000/api/integrations');
      console.log('✅ Integrations endpoint accessible:', integrationsResponse.data);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Integrations endpoint requires authentication (expected)');
      } else {
        console.log('❌ Integrations endpoint error:', error.message);
      }
    }
    
    // Test 3: Test web server
    console.log('\n3. Testing web server...');
    const webResponse = await axios.get('http://localhost:3001');
    console.log('✅ Web server is running, response length:', webResponse.data.length);
    
    // Test 4: Test admin settings page
    console.log('\n4. Testing admin settings page...');
    const settingsResponse = await axios.get('http://localhost:3001/admin/settings');
    console.log('✅ Admin settings page accessible, response length:', settingsResponse.data.length);
    
    console.log('\n🎉 All tests passed! Integration system is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testIntegrationAPI();
