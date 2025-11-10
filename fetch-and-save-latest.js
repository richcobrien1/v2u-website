#!/usr/bin/env node

/**
 * Fetch latest YouTube video and save to v2u.ai KV storage
 */

const BASE_URL = 'https://v2u.ai';

async function fetchLatestYouTubeVideo() {
  console.log('\n🎥 Fetching latest YouTube video from v2u.ai...\n');
  
  try {
    // Get config to find YouTube credentials
    const configRes = await fetch(`${BASE_URL}/api/automation/config`);
    const config = await configRes.json();
    
    const youtubeApiKey = config.level1?.youtube?.credentials?.apiKey;
    const channelId = config.level1?.youtube?.credentials?.channelId;
    
    if (!youtubeApiKey || !channelId) {
      console.error('❌ YouTube credentials not found in config');
      return;
    }
    
    console.log('✅ Found YouTube credentials');
    console.log('📡 Fetching latest video from channel...\n');
    
    // Fetch latest video
    const ytResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?key=${youtubeApiKey}&channelId=${channelId}&part=snippet&order=date&maxResults=1&type=video`
    );
    
    if (!ytResponse.ok) {
      console.error('❌ YouTube API error:', ytResponse.status);
      return;
    }
    
    const data = await ytResponse.json();
    const video = data.items?.[0];
    
    if (!video) {
      console.error('❌ No videos found');
      return;
    }
    
    const episode = {
      title: video.snippet.title,
      description: video.snippet.description,
      youtubeUrl: `https://www.youtube.com/watch?v=${video.id.videoId}`,
      spotifyUrl: '', // Will be populated by news-collector when available
      rumbleUrl: '',  // Will be populated by news-collector when available
      publishDate: video.snippet.publishedAt
    };
    
    console.log('📺 Found latest video:');
    console.log('   Title:', episode.title);
    console.log('   YouTube:', episode.youtubeUrl);
    console.log('   Published:', new Date(episode.publishDate).toLocaleString());
    console.log('\n💾 Saving to KV storage...\n');
    
    // Save to KV via social-post endpoint
    const saveResponse = await fetch(`${BASE_URL}/api/social-post`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        platforms: [], // Empty = just save metadata
        episode: episode
      })
    });
    
    const result = await saveResponse.json();
    
    if (saveResponse.ok) {
      console.log('✅ Episode metadata saved to KV storage!');
      console.log('\n🎉 Now you can click "Post Latest Now" in the admin panel.\n');
      console.log('🔗 Admin panel: https://v2u.ai/admin/social-posting\n');
    } else {
      console.error('❌ Failed to save episode metadata');
      console.error('Error:', result.error || result);
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

fetchLatestYouTubeVideo();
