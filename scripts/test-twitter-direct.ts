/**
 * Test Twitter credentials directly
 */
import { TwitterApi } from 'twitter-api-v2';
import 'dotenv/config';

async function testTwitter() {
  console.log('🧪 Testing Twitter V2U credentials...\n');
  
  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY_V2U!,
    appSecret: process.env.TWITTER_API_SECRET_V2U!,
    accessToken: process.env.TWITTER_ACCESS_TOKEN_V2U!,
    accessSecret: process.env.TWITTER_ACCESS_SECRET_V2U!,
  });

  try {
    // Test 1: Verify credentials
    console.log('Test 1: Verifying credentials...');
    const user = await client.v2.me();
    console.log('✅ Authenticated as:', user.data.username);
    console.log('   User ID:', user.data.id);
    console.log('   Name:', user.data.name);
    
    // Test 2: Try to post a test tweet
    console.log('\nTest 2: Attempting to post a tweet...');
    const tweet = await client.v2.tweet('Test from V2U automation - ' + new Date().toISOString());
    console.log('✅ Tweet posted successfully!');
    console.log('   Tweet ID:', tweet.data.id);
    console.log('   URL: https://twitter.com/V2U_now/status/' + tweet.data.id);
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.code) console.error('   Code:', error.code);
    if (error.data) console.error('   Data:', JSON.stringify(error.data, null, 2));
  }
  
  console.log('\n🧪 Testing Twitter AI Now credentials...\n');
  
  const clientAI = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY_AI!,
    appSecret: process.env.TWITTER_API_SECRET_AI!,
    accessToken: process.env.TWITTER_ACCESS_TOKEN_AI!,
    accessSecret: process.env.TWITTER_ACCESS_SECRET_AI!,
  });

  try {
    console.log('Test 1: Verifying credentials...');
    const user = await clientAI.v2.me();
    console.log('✅ Authenticated as:', user.data.username);
    console.log('   User ID:', user.data.id);
    console.log('   Name:', user.data.name);
    
    console.log('\nTest 2: Attempting to post a tweet...');
    const tweet = await clientAI.v2.tweet('Test from AI Now automation - ' + new Date().toISOString());
    console.log('✅ Tweet posted successfully!');
    console.log('   Tweet ID:', tweet.data.id);
    console.log('   URL: https://twitter.com/AI_Now/status/' + tweet.data.id);
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.code) console.error('   Code:', error.code);
    if (error.data) console.error('   Data:', JSON.stringify(error.data, null, 2));
  }
}

testTwitter();
