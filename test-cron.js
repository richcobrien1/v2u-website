// Test if automation endpoints are accessible
// Run with: node test-cron.js

const BASE_URL = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}` 
  : 'https://www.v2u.us';

async function testEndpoint(path, description) {
  console.log(`\n🔍 Testing: ${description}`);
  console.log(`   URL: ${BASE_URL}${path}`);
  
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: path.includes('post-latest') ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'vercel-cron/1.0' // Simulate Vercel cron
      }
    });
    
    const data = await response.json();
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Response:`, JSON.stringify(data, null, 2).substring(0, 500));
    
    return { success: response.ok, status: response.status, data };
  } catch (error) {
    console.error(`   ❌ Error:`, error.message);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 V2U Automation Cron Test');
  console.log('='.repeat(50));
  
  // Test 1: Check automation status
  await testEndpoint('/api/automation/status', 'Automation Status');
  
  // Test 2: Check if automation is running
  const statusResult = await testEndpoint('/api/automation/status', 'Get Running State');
  if (statusResult.data?.status?.running === false) {
    console.log('\n⚠️  WARNING: Automation is DISABLED!');
    console.log('   Go to /admin/social-posting and toggle automation ON');
  }
  
  // Test 3: Test the check endpoint (reads Level 1)
  await testEndpoint('/api/automation/check', 'Check Level 1 Platforms');
  
  // Test 4: Test the post-latest endpoint (posts to Level 2)
  await testEndpoint('/api/automation/post-latest', 'Post Latest to Level 2');
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Test complete');
  console.log('\n💡 If automation is disabled, enable it at:');
  console.log(`   ${BASE_URL}/admin/social-posting`);
}

runTests().catch(console.error);
