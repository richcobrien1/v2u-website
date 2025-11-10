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
    pageAccessToken: process.env.FACEBOOK_ACCESS_TOKEN_V2U
  },
  'facebook-ainow': {
    pageId: process.env.FACEBOOK_PAGE_ID_AI,
    pageAccessToken: process.env.FACEBOOK_ACCESS_TOKEN_AI
  },
  linkedin: {
    accessToken: process.env.LINKEDIN_ACCESS_TOKEN,
    personUrn: process.env.LINKEDIN_PERSON_URN
  },
  instagram: {
    accessToken: process.env.INSTAGRAM_ACCESS_TOKEN
  },
  threads: {
    accessToken: process.env.THREADS_ACCESS_TOKEN,
    userId: process.env.THREADS_USER_ID
  },
  tiktok: {
    url: process.env.TIKTOK_URL
  },
  odysee: {
    url: process.env.ODYSEE_URL
  },
  vimeo: {
    url: process.env.VIMEO_URL
  },
  bluesky: {
    username: process.env.BLUESKY_USERNAME,
    appPassword: process.env.BLUESKY_APP_PASSWORD
  }
};

async function saveAll() {
  for (const [platformId, credentials] of Object.entries(platforms)) {
    console.log(`\nÌ≥ù Saving ${platformId}...`);
    
    const response = await fetch('https://v2u.ai/api/automation/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        level: 2,
        platformId,
        credentials,
        enabled: true
      })
    });
    
    const result = await response.json();
    console.log(result.success ? `‚úÖ ${platformId} saved` : `‚ùå ${platformId} failed: ${result.error}`);
  }
}

saveAll().catch(console.error);
