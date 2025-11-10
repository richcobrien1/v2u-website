const { TwitterApi } = require('twitter-api-v2');

// Try the current tokens
const client = new TwitterApi({
  appKey: 'yJgeMEuWZ2ZrJBjGi5ACMRAnx',
  appSecret: 'FJcnMapPadpryvU3MS6K88LiBO9qk83Z7JC21jaZJAGyJPEgru',
  accessToken: '1952426895381016576-LtgJabwj4iZj99J4H6MsrNbf39Ocd7',
  accessSecret: 'LS907c9AtiNmS7M5kDgGDNzNro5RhJSywUaulXKEIFkkC',
});

async function testAuth() {
  console.log('Testing AI Now Twitter credentials...\n');
  try {
    const me = await client.v2.me();
    console.log('✅ Authentication successful!');
    console.log('User:', me.data);
    console.log('\nThese tokens WORK - will update .env.local');
  } catch (error) {
    console.error('❌ Authentication failed with current tokens');
    console.error('Error:', error.data || error.message);
    
    // Try using same tokens as V2U (might be same account)
    console.log('\n🔄 Trying V2U tokens for AI Now account...');
    const client2 = new TwitterApi({
      appKey: 'BulQVrhLBcpue87jiRzjWF3Qn',
      appSecret: 'lHVnI8mQSVbJK9oJlbOfKUIcosciCsonAAgnxqIME4nKsO8uJV',
      accessToken: '1889027791393562624-rOqnj8ezcdTd8k1kKCrmItV9BpjA1q',
      accessSecret: 'Zi1mu8gXZscviHrv0NMCjH42KQFD58Wn4gWXGW68F5MOf',
    });
    
    try {
      const me2 = await client2.v2.me();
      console.log('✅ V2U tokens work for AI Now!');
      console.log('User:', me2.data);
      console.log('\n💡 Both accounts use same Twitter app - will use V2U tokens for both');
    } catch (error2) {
      console.error('❌ V2U tokens also failed');
      console.error('Error:', error2.data || error2.message);
      console.log('\n⚠️  AI Now Twitter account needs new tokens generated');
    }
  }
}

testAuth();
