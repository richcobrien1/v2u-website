const { TwitterApi } = require('twitter-api-v2');

// SECURITY: Credentials moved to environment variables
// Set in .env.local: TWITTER_APP_KEY, TWITTER_APP_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET
const client = new TwitterApi({
  appKey: process.env.TWITTER_APP_KEY || '',
  appSecret: process.env.TWITTER_APP_SECRET || '',
  accessToken: process.env.TWITTER_ACCESS_TOKEN || '',
  accessSecret: process.env.TWITTER_ACCESS_SECRET || '',
});

async function testAuth() {
  try {
    const me = await client.v2.me();
    console.log('✅ Authentication successful!');
    console.log('User:', me.data);
  } catch (error) {
    console.error('❌ Authentication failed:');
    console.error(error);
  }
}

testAuth();
