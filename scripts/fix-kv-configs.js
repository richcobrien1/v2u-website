/**
 * Direct KV update script to fix Rumble and Spotify configs
 * Run with: node scripts/fix-kv-configs.js
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CLOUDFLARE_KV_NAMESPACE_ID = process.env.CLOUDFLARE_KV_NAMESPACE_ID;

if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN || !CLOUDFLARE_KV_NAMESPACE_ID) {
  console.error('❌ Missing Cloudflare credentials in environment');
  process.exit(1);
}

async function updateKVKey(key, value) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${CLOUDFLARE_KV_NAMESPACE_ID}/values/${key}`;
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
      'Content-Type': 'text/plain'
    },
    body: JSON.stringify(value)
  });

  if (!response.ok) {
    throw new Error(`KV update failed: ${response.statusText}`);
  }

  return response;
}

async function main() {
  console.log('🔧 Fixing Rumble and Spotify KV configurations...\n');

  // Fix Rumble config
  const rumbleConfig = {
    credentials: {
      channelUrl: 'https://rumble.com/c/c-7188913',
      channelName: 'V2U Now'
    },
    enabled: true,
    configured: true
  };

  console.log('📹 Updating Rumble config...');
  await updateKVKey('automation:level1:rumble', rumbleConfig);
  console.log('✅ Rumble config updated\n');

  // Fix Spotify config
  const spotifyConfig = {
    credentials: {
      showId: '1NSlm2dueS2O2FFmW3rSZ3',
      showName: 'AI-Now with Alex and Jessica'
    },
    enabled: true,
    configured: true
  };

  console.log('🎧 Updating Spotify config...');
  await updateKVKey('automation:level1:spotify', spotifyConfig);
  console.log('✅ Spotify config updated\n');

  console.log('🎯 Done! Next automation check will include Rumble and Spotify.');
}

main().catch(console.error);
