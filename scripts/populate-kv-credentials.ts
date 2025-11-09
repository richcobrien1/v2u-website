/**
 * Populate Cloudflare KV with credentials from environment variables
 * Run this to sync .env credentials to Cloudflare KV
 * 
 * Usage: npx tsx scripts/populate-kv-credentials.ts
 */

import 'dotenv/config';

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID!;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN!;
const CLOUDFLARE_KV_NAMESPACE_ID = process.env.CLOUDFLARE_KV_NAMESPACE_ID!;

async function putKV(key: string, value: string) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${CLOUDFLARE_KV_NAMESPACE_ID}/values/${key}`;
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
      'Content-Type': 'text/plain'
    },
    body: value
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`KV PUT failed for ${key}: ${response.status} ${error}`);
  }
  
  console.log(`✅ Saved: ${key}`);
}

async function main() {
  console.log('🚀 Populating Cloudflare KV with credentials from .env...\n');

  // Twitter V2U
  await putKV('automation:level2:twitter', JSON.stringify({
    credentials: {
      appKey: process.env.TWITTER_API_KEY_V2U,
      appSecret: process.env.TWITTER_API_SECRET_V2U,
      accessToken: process.env.TWITTER_ACCESS_TOKEN_V2U,
      accessSecret: process.env.TWITTER_ACCESS_SECRET_V2U
    },
    enabled: true,
    configured: true,
    updatedAt: new Date().toISOString()
  }));

  // Twitter AI Now
  await putKV('automation:level2:twitter-ainow', JSON.stringify({
    credentials: {
      appKey: process.env.TWITTER_API_KEY_AI,
      appSecret: process.env.TWITTER_API_SECRET_AI,
      accessToken: process.env.TWITTER_ACCESS_TOKEN_AI,
      accessSecret: process.env.TWITTER_ACCESS_SECRET_AI
    },
    enabled: true,
    configured: true,
    updatedAt: new Date().toISOString()
  }));

  // LinkedIn
  await putKV('automation:level2:linkedin', JSON.stringify({
    credentials: {
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      accessToken: process.env.LINKEDIN_ACCESS_TOKEN
    },
    enabled: true,
    configured: true,
    updatedAt: new Date().toISOString()
  }));

  // Facebook V2U
  await putKV('automation:level2:facebook', JSON.stringify({
    credentials: {
      pageId: process.env.FACEBOOK_PAGE_ID_V2U,
      pageAccessToken: process.env.FACEBOOK_ACCESS_TOKEN_V2U
    },
    enabled: true,
    configured: true,
    updatedAt: new Date().toISOString()
  }));

  // Facebook AI Now
  await putKV('automation:level2:facebook-ainow', JSON.stringify({
    credentials: {
      pageId: process.env.FACEBOOK_PAGE_ID_AI,
      pageAccessToken: process.env.FACEBOOK_ACCESS_TOKEN_AI
    },
    enabled: true,
    configured: true,
    updatedAt: new Date().toISOString()
  }));

  // YouTube
  await putKV('automation:level1:youtube', JSON.stringify({
    credentials: {
      apiKey: process.env.YOUTUBE_API_KEY,
      channelId: process.env.YOUTUBE_CHANNEL_ID
    },
    enabled: true,
    configured: true,
    updatedAt: new Date().toISOString()
  }));

  console.log('\n✨ All credentials populated successfully!');
  console.log('🧪 Test with: curl -X POST https://www.v2u.us/api/automation/manual-post ...');
}

main().catch(console.error);
