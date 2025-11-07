// Check which Twitter account we're using
require('dotenv').config({ path: '.env.local' });
const { TwitterApi } = require('twitter-api-v2');

async function checkAccount() {
  console.log('Checking Twitter credentials...');
  
  const client = new TwitterApi({
    appKey: process.env.TWITTER_APP_KEY || '',
    appSecret: process.env.TWITTER_APP_SECRET || '',
    accessToken: process.env.TWITTER_ACCESS_TOKEN || '',
    accessSecret: process.env.TWITTER_ACCESS_SECRET || ''
  });

  try {
    const me = await client.v2.me();
    console.log('✅ Connected to Twitter account:');
    console.log('Username: @' + me.data.username);
    console.log('Name:', me.data.name);
    console.log('ID:', me.data.id);
    console.log('\nProfile: https://twitter.com/' + me.data.username);
  } catch (error) {
    console.error('❌ ERROR:', error.message);
  }
}

checkAccount();
