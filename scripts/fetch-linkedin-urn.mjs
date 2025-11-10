import { config } from 'dotenv';
config({ path: '.env.local' });

const TOKEN = process.env.LINKEDIN_ACCESS_TOKEN;

async function fetchPersonUrn() {
  console.log('🔍 Fetching LinkedIn personUrn...\n');
  
  const response = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: {
      'Authorization': `Bearer ${TOKEN}`
    }
  });
  
  if (!response.ok) {
    console.error('❌ Failed:', response.status, response.statusText);
    const text = await response.text();
    console.error(text);
    return;
  }
  
  const data = await response.json();
  console.log('✅ LinkedIn userinfo:', JSON.stringify(data, null, 2));
  
  if (data.sub) {
    console.log(`\n📋 Add to Vercel env vars:`);
    console.log(`LINKEDIN_PERSON_URN="${data.sub}"`);
  }
}

fetchPersonUrn().catch(console.error);
