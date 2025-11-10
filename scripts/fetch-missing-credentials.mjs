import { config } from 'dotenv';
config({ path: '.env.local' });

const LINKEDIN_ACCESS_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN;
const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_AINOW_ACCESS_TOKEN;

async function fetchMissingCredentials() {
  const results = {};
  
  // 1. Fetch LinkedIn personUrn
  console.log('🔍 Fetching LinkedIn personUrn...');
  try {
    const linkedinResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { 'Authorization': `Bearer ${LINKEDIN_ACCESS_TOKEN}` }
    });
    
    if (linkedinResponse.ok) {
      const data = await linkedinResponse.json();
      results.LINKEDIN_PERSON_URN = data.sub;
      console.log(`✅ LinkedIn personUrn: ${data.sub}`);
    } else {
      console.log(`❌ LinkedIn failed: ${linkedinResponse.status}`);
    }
  } catch (e) {
    console.log(`❌ LinkedIn error:`, e.message);
  }
  
  // 2. Fetch Threads user ID (using Instagram token)
  console.log('\n🔍 Fetching Threads user ID...');
  try {
    const threadsResponse = await fetch(`https://graph.threads.net/v1.0/me?fields=id,username&access_token=${INSTAGRAM_ACCESS_TOKEN}`);
    
    if (threadsResponse.ok) {
      const data = await threadsResponse.json();
      results.THREADS_ACCESS_TOKEN = INSTAGRAM_ACCESS_TOKEN;
      results.THREADS_USER_ID = data.id;
      console.log(`✅ Threads user ID: ${data.id}`);
      console.log(`✅ Threads username: ${data.username}`);
    } else {
      console.log(`❌ Threads failed: ${threadsResponse.status}`);
      const error = await threadsResponse.text();
      console.log(error);
    }
  } catch (e) {
    console.log(`❌ Threads error:`, e.message);
  }
  
  // 3. Instagram - just use the correct env var
  results.INSTAGRAM_ACCESS_TOKEN = INSTAGRAM_ACCESS_TOKEN;
  console.log(`\n✅ Instagram token: ${INSTAGRAM_ACCESS_TOKEN.substring(0, 20)}...`);
  
  // Output for Vercel
  console.log('\n\n📋 ADD THESE TO VERCEL ENV VARS:\n');
  for (const [key, value] of Object.entries(results)) {
    console.log(`${key}="${value}"`);
  }
  
  // Also save to .env.local
  console.log('\n\n📝 Appending to .env.local...');
  const fs = await import('fs');
  let envContent = '';
  
  for (const [key, value] of Object.entries(results)) {
    if (key !== 'THREADS_ACCESS_TOKEN') { // Don't duplicate Instagram token
      envContent += `${key}="${value}"\n`;
    }
  }
  
  fs.appendFileSync('.env.local', `\n# Auto-fetched credentials\n${envContent}`);
  console.log('✅ Credentials added to .env.local');
  
  return results;
}

fetchMissingCredentials().catch(console.error);
