/**
 * Test Twitter AI Now credentials directly
 */
import { TwitterApi } from 'twitter-api-v2';

async function testTwitterAINow() {
  console.log('🧪 Testing Twitter AI Now credentials...\n');
  
  const client = new TwitterApi({
    appKey: 'yJgeMEuWZ2ZrJBjGi5ACMRAnx',
    appSecret: 'FJcnMapPadpryvU3MS6K88LiBO9qk83Z7JC21jaZJAGyJPEgru',
    accessToken: '1952426895381016576-LtgJabwj4iZj99J4H6MsrNbf39Ocd7',
    accessSecret: 'LS907c9AtiNmS7M5kDgGDNzNro5RhJSywUaulXKEIFkkC',
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
