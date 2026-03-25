/**
 * Test Twitter AI Now credentials directly
 */
import { TwitterApi } from 'twitter-api-v2';

async function testTwitterAINow() {
  console.log('🧪 Testing Twitter AI Now credentials...\n');
  
  // SECURITY: Credentials moved to environment variables
  const client = new TwitterApi({
    appKey: process.env.TWITTER_AINOW_APP_KEY || '',
    appSecret: process.env.TWITTER_AINOW_APP_SECRET || '',
    accessToken: process.env.TWITTER_AINOW_ACCESS_TOKEN || '',
    accessSecret: process.env.TWITTER_AINOW_ACCESS_SECRET || '',
  });

  try {
    // Test with v1.1 API first (more permissive)
    console.log('Test 1: Verifying credentials with v1.1 API...');
    const user = await client.v1.verifyCredentials();
    console.log('✅ Authenticated as:', user.screen_name);
    console.log('   User ID:', user.id_str);
    console.log('   Name:', user.name);
    
    // Now try v2
    console.log('\nTest 2: Trying v2 API...');
    const userV2 = await client.v2.me();
    console.log('✅ V2 API works! User:', userV2.data.username);
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.code) console.error('   Code:', error.code);
    if (error.data) console.error('   Data:', JSON.stringify(error.data, null, 2));
    if (error.errors) console.error('   Errors:', JSON.stringify(error.errors, null, 2));
  }
}

testTwitterAINow();
