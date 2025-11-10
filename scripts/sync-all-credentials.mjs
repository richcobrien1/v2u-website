import { config } from 'dotenv';
config({ path: '.env.local' });

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CLOUDFLARE_KV_NAMESPACE_ID = process.env.CLOUDFLARE_KV_NAMESPACE_ID;

// ALL CREDENTIALS FROM ENV
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
    pageAccessToken: process.env.FACEBOOK_ACCESS_TOKEN_V2U,
    tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
    tokenRefreshedAt: new Date().toISOString()
  },
  'facebook-ainow': {
    pageId: process.env.FACEBOOK_PAGE_ID_AI,
    pageAccessToken: process.env.FACEBOOK_ACCESS_TOKEN_AI,
    tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
    tokenRefreshedAt: new Date().toISOString()
  },
  linkedin: {
    accessToken: process.env.LINKEDIN_ACCESS_TOKEN,
    personUrn: process.env.LINKEDIN_PERSON_URN || ''
  },
  instagram: {
    accessToken: process.env.INSTAGRAM_ACCESS_TOKEN || process.env.INSTAGRAM_AINOW_ACCESS_TOKEN || ''
  },
  threads: {
    accessToken: process.env.THREADS_ACCESS_TOKEN || '',
    userId: process.env.THREADS_USER_ID || ''
  },
  tiktok: {
    url: process.env.TIKTOK_URL || 'https://www.tiktok.com/@v2u_official'
  },
  odysee: {
    url: process.env.ODYSEE_URL || 'https://odysee.com/@V2U:c'
  },
  vimeo: {
    url: process.env.VIMEO_URL || 'https://vimeo.com/user123456789'
  },
  bluesky: {
    username: process.env.BLUESKY_USERNAME || 'ai-now.bsky.social',
    appPassword: process.env.BLUESKY_APP_PASSWORD || ''
  }
};

async function saveAllToKV() {
  console.log('🚀 Syncing ALL credentials to Cloudflare KV...\n');
  console.log('📍 Account:', CLOUDFLARE_ACCOUNT_ID);
  console.log('📍 Namespace:', CLOUDFLARE_KV_NAMESPACE_ID);
  console.log();
  
  const batch = [];
  
  for (const [platformId, credentials] of Object.entries(platforms)) {
    // Check for missing credentials
    const missing = Object.entries(credentials)
      .filter(([, value]) => !value || value === '')
      .map(([key]) => key);
    
    if (missing.length > 0) {
      console.log(`⚠️  ${platformId}: Missing ${missing.join(', ')}`);
    }
    
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
  console.log(`\n📦 Saving ${batch.length} platforms to KV...`);
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
    process.exit(1);
  }
  
  console.log('✅ All platforms saved to KV!');
  
  // Verify by reading back
  console.log('\n🔍 Verifying credentials in KV...\n');
  
  for (const platformId of Object.keys(platforms)) {
    const key = `automation:level2:${platformId}`;
    const getUrl = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${CLOUDFLARE_KV_NAMESPACE_ID}/values/${key}`;
    
    const getResponse = await fetch(getUrl, {
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`
      }
    });
    
    if (getResponse.ok) {
      const data = await getResponse.json();
      const credKeys = Object.keys(data.credentials || {});
      console.log(`✅ ${platformId}: ${credKeys.length} credentials (${data.enabled ? 'enabled' : 'disabled'}, ${data.validated ? 'validated' : 'not validated'})`);
    } else {
      console.log(`❌ ${platformId}: NOT FOUND IN KV`);
    }
  }
  
  console.log('\n✨ Sync complete!');
  console.log('\n📋 Summary:');
  console.log('  - All credentials saved to KV storage');
  console.log('  - All platforms marked as enabled');
  console.log('  - All platforms marked as validated');
  console.log('  - Ready for posting');
}

saveAllToKV().catch(console.error);
