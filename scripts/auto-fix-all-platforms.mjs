import { config } from 'dotenv';
config({ path: '.env.local' });

const platforms = [
  'twitter',
  'twitter-ainow', 
  'facebook',
  'facebook-ainow',
  'linkedin',
  'instagram',
  'threads',
  'bluesky'
];

console.log('🔧 Auto-fixing all platform credentials...\n');

for (const platform of platforms) {
  console.log(`\n📍 Validating ${platform}...`);
  
  try {
    const response = await fetch(`http://localhost:3000/api/automation/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        level: 2,
        platformId: platform
      })
    });

    const result = await response.json();
    
    if (result.valid) {
      console.log(`✅ ${platform}: Valid`);
    } else {
      console.log(`❌ ${platform}: ${result.error || 'Invalid'}`);
      if (result.details) {
        console.log(`   Details: ${result.details}`);
      }
    }
  } catch (error) {
    console.error(`❌ ${platform}: Exception - ${error.message}`);
  }
}

console.log('\n✨ Validation complete!');
