import { config } from 'dotenv';
config({ path: '.env.local' });

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CLOUDFLARE_KV_NAMESPACE_ID = process.env.CLOUDFLARE_KV_NAMESPACE_ID;

async function check() {
  const platforms = ['facebook', 'facebook-ainow'];
  
  for (const platform of platforms) {
    const key = `automation:level2:${platform}`;
    const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${CLOUDFLARE_KV_NAMESPACE_ID}/values/${key}`;
    
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}` }
    });
    
    const data = await response.json();
    console.log(`\n${platform}:`, JSON.stringify(data, null, 2));
  }
}

check();
