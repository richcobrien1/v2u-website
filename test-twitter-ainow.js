const { TwitterApi } = require('twitter-api-v2');

// SECURITY: Credentials moved to environment variables
// Set in .env.local: TWITTER_AINOW_APP_KEY, TWITTER_AINOW_APP_SECRET, etc.
const client = new TwitterApi({
  appKey: process.env.TWITTER_AINOW_APP_KEY || '',
  appSecret: process.env.TWITTER_AINOW_APP_SECRET || '',
  accessToken: process.env.TWITTER_AINOW_ACCESS_TOKEN || '',
  accessSecret: process.env.TWITTER_AINOW_ACCESS_SECRET || '',
});

async function testAuth() {
  console.log('Testing AI Now Twitter credentials...\n');
  try {
    const me = await client.v2.me();
    console.log('✅ Authentication successful!');
    console.log('User:', me.data);
    console.log('\nThese tokens WORK - will update .env.local');
  } catch (error) {
    console.error('❌ Authentication failed with current tokens');
    console.error('Error:', error.data || error.message);
    
    // Fallback: Try V2U credentials (credentials removed for security)
    console.log('\n🔄 Trying V2U tokens for AI Now account...');
    const client2 = new TwitterApi({
      appKey: process.env.TWITTER_APP_KEY || '',
      appSecret: process.env.TWITTER_APP_SECRET || '',
      accessToken: process.env.TWITTER_ACCESS_TOKEN || '',
      accessSecret: process.env.TWITTER_ACCESS_SECRET || '',
    });
    
    try {
      const me2 = await client2.v2.me();
      console.log('✅ V2U tokens work for AI Now!');
      console.log('User:', me2.data);
      console.log('\n💡 Both accounts use same Twitter app - will use V2U tokens for both');
    } catch (error2) {
      console.error('❌ V2U tokens also failed');
      console.error('Error:', error2.data || error2.message);
      console.log('\n⚠️  AI Now Twitter account needs new tokens generated');
    }
  }
}

testAuth();
