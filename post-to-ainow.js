// Post to AI_Now_v2u account
require('dotenv').config({ path: '.env.local' });
const { TwitterApi } = require('twitter-api-v2');

async function postToAINow() {
  console.log('Posting to @AI_Now_v2u...');
  
  const client = new TwitterApi({
    appKey: process.env.TWITTER_AINOW_APP_KEY || '',
    appSecret: process.env.TWITTER_AINOW_APP_SECRET || '',
    accessToken: process.env.TWITTER_AINOW_ACCESS_TOKEN || '',
    accessSecret: process.env.TWITTER_AINOW_ACCESS_SECRET || ''
  });

  const tweet = `🎥 New Video: November 7, 2025, AI-Now - Race for AI Supremacy - Deep Dive with Alex and Jessica

https://www.youtube.com/watch?v=C-Fj2vjBE74`;

  console.log('Tweet text:', tweet);
  
  try {
    // First verify the account
    const me = await client.v2.me();
    console.log('✅ Connected to: @' + me.data.username);
    
    // Post the tweet
    const result = await client.v2.tweet(tweet);
    console.log('✅ SUCCESS! Tweet posted to @AI_Now_v2u!');
    console.log('Tweet ID:', result.data.id);
    console.log('View at: https://twitter.com/AI_Now_v2u/status/' + result.data.id);
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    if (error.data) console.error('Error data:', error.data);
  }
}

postToAINow();
