// Check Facebook App Configuration
const userToken = 'EAATsC3s5vgkBP90WTW7ZC1UlU3xhXm1wxZBMewy68ToHSm3aYAm1XnEj94jZAnHQXl9R1qmEGCEeKcBQVAXskNyH9BLyh9AUeJ0W8l0sMkfGteJ7jFus2A2gdDQasfvVIVy59MTilAcTzwxeZCSdIPmU8Ir4D7vGY8d1zQjhfOOSFiX2zo927y7gK56nk9XBQXtH6lPxuCQ02cNEANZA34LjZAp2ov6mm0gAsD7OZCvOKNr8jJSIMRNs1birMW1F5dZCKzgwFlX840Ys30YiinlZBZB72e';

// Get pages with their roles
console.log('🔍 Checking your Facebook pages and permissions...\n');

const pagesResponse = await fetch(`https://graph.facebook.com/v18.0/me/accounts?fields=id,name,access_token,tasks&access_token=${userToken}`);
const pagesData = await pagesResponse.json();

if (pagesData.error) {
  console.error('❌ Error:', pagesData.error.message);
  process.exit(1);
}

for (const page of pagesData.data) {
  console.log(`\n📄 Page: ${page.name} (${page.id})`);
  console.log(`Tasks: ${page.tasks?.join(', ') || 'None'}`);
  
  // Try to post to the page
  console.log('\n🧪 Testing post capability...');
  const testPost = await fetch(`https://graph.facebook.com/v18.0/${page.id}/feed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'TEST - DELETE ME',
      access_token: page.access_token,
      published: false // Don't actually publish
    })
  });
  
  const testResult = await testPost.json();
  if (testResult.error) {
    console.log(`❌ Cannot post: ${testResult.error.message}`);
    console.log(`   Error code: ${testResult.error.code}`);
    
    if (testResult.error.code === 200) {
      console.log('\n💡 SOLUTION:');
      console.log('   1. Go to https://developers.facebook.com/apps/');
      console.log('   2. Select your app: "AI-Now"');
      console.log('   3. Go to "Use Cases" in left menu');
      console.log('   4. Find "Page public content access" or "Page public metadata access"');
      console.log('   5. Click "Add" or "Configure"');
      console.log('   6. Complete the business verification');
    }
  } else {
    console.log(`✅ Can post to this page!`);
    console.log(`   Page token: ${page.access_token.substring(0, 30)}...`);
  }
}
