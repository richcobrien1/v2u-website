// Test automation check locally
const CRON_SECRET = process.env.CRON_SECRET || 'v2u-cron-secret-1762538623';

async function testAutomation() {
  try {
    console.log('Testing automation check endpoint...');
    console.log('Using CRON_SECRET:', CRON_SECRET.substring(0, 10) + '...');
    
    const response = await fetch('http://localhost:3000/api/automation/check', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`
      }
    });

    const data = await response.json();
    console.log('\nResponse Status:', response.status);
    console.log('Response Data:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error('❌ Request failed:', response.status);
    } else {
      console.log('✅ Request successful');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAutomation();
