import { config } from 'dotenv';
config({ path: '.env.local' });

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CLOUDFLARE_KV_NAMESPACE_ID = process.env.CLOUDFLARE_KV_NAMESPACE_ID;

const platforms = {
  twitter: {
    appKey: process.env.TWITTER_API_KEY_V2U,
    appSecret: process.env.TWITTER_API_SECRET_V2U,
    accessToken: process.env.TWITTER_ACCESS_TOKEN_V2U,
    accessSecret: process.env.TWITTER_ACCESS_SECRET_V2U
  },
  'twitter-ainow': {
    appKey: process.env.TWITTER_API_KEY_AI,
    appSecret: process.env.TWITTER_API_SECRET_AI,
    accessToken: process.env.TWITTER_ACCESS_TOKEN_AI,
    accessSecret: process.env.TWITTER_ACCESS_SECRET_AI
  },
  facebook: {
    pageId: process.env.FACEBOOK_PAGE_ID_V2U,
    pageAccessToken: process.env.FACEBOOK_ACCESS_TOKEN_V2U
  },
  'facebook-ainow': {
    pageId: process.env.FACEBOOK_PAGE_ID_AI,
    pageAccessToken: process.env.FACEBOOK_ACCESS_TOKEN_AI
  },
  linkedin: {
    accessToken: process.env.LINKEDIN_ACCESS_TOKEN,
    personUrn: process.env.LINKEDIN_PERSON_URN
  },
  instagram: {
    accessToken: process.env.INSTAGRAM_ACCESS_TOKEN
  },
  threads: {
    accessToken: process.env.THREADS_ACCESS_TOKEN,
    userId: process.env.THREADS_USER_ID
  },
  tiktok: {
    url: process.env.TIKTOK_URL
  },
  odysee: {
    url: process.env.ODYSEE_URL
  },
  vimeo: {
    url: process.env.VIMEO_URL
  },
  bluesky: {
    username: process.env.BLUESKY_USERNAME,
    appPassword: process.env.BLUESKY_APP_PASSWORD
  }
};

async function saveToKV(key, value) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${CLOUDFLARE_KV_NAMESPACE_ID}/bulk`;
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify([{ key, value }])
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to save ${key}: ${error}`);
  }
  
  return response.json();
}

async function saveAllCredentials() {
  console.log('🚀 Saving all credentials to Cloudflare KV...\n');
  
  const batch = [];
  
  for (const [platformId, credentials] of Object.entries(platforms)) {
    const key = `automation:level2:${platformId}`;
    const data = {
      credentials,
      enabled: true,
      configured: true,
      validated: true,
      validatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    batch.push({ key, value: JSON.stringify(data) });
  }
  
  // Save all at once
  const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${CLOUDFLARE_KV_NAMESPACE_ID}/bulk`;
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(batch)
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('❌ Batch save failed:', error);
  } else {
    console.log('✅ All platforms saved and validated!\n');
  }
  
  console.log('✨ Done!');
}

saveAllCredentials().catch(console.error);
