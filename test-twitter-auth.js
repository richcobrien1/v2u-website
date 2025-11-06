const { TwitterApi } = require('twitter-api-v2');

const client = new TwitterApi({
  appKey: 'BulQVrhLBcpue87jiRzjWF3Qn',
  appSecret: 'lHVnI8mQSVbJK9oJlbOfKUIcosciCsonAAgnxqIME4nKsO8uJV',
  accessToken: '1889027791393562624-rOqnj8ezcdTd8k1kKCrmItV9BpjA1q',
  accessSecret: 'Zi1mu8gXZscviHrv0NMCjH42KQFD58Wn4gWXGW68F5MOf',
});

async function testAuth() {
  try {
    const me = await client.v2.me();
    console.log('✅ Authentication successful!');
    console.log('User:', me.data);
  } catch (error) {
    console.error('❌ Authentication failed:');
    console.error(error);
  }
}

testAuth();
