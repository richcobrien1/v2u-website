// Direct Twitter post test
require('dotenv').config({ path: '.env.local' });
const { TwitterApi } = require('twitter-api-v2');

async function postNow() {
  console.log('Getting Twitter credentials from env...');
  
  // From .env.local
  const client = new TwitterApi({
    appKey: process.env.TWITTER_APP_KEY || '',
    appSecret: process.env.TWITTER_APP_SECRET || '',
    accessToken: process.env.TWITTER_ACCESS_TOKEN || '',
    accessSecret: process.env.TWITTER_ACCESS_SECRET || ''
  });

  const tweet = `🎥 New Video: November 7, 2025, AI-Now - Race for AI Supremacy - Deep Dive with Alex and Jessica

https://www.youtube.com/watch?v=C-Fj2vjBE74`;

  console.log('Posting to Twitter...');
  console.log('Tweet text:', tweet);
  
  try {
    const result = await client.v2.tweet(tweet);
    console.log('✅ SUCCESS! Tweet posted!');
    console.log('Tweet ID:', result.data.id);
    console.log('View at: https://twitter.com/user/status/' + result.data.id);
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    if (error.data) console.error('Error data:', error.data);
  }
}

postNow();
