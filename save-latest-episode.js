#!/usr/bin/env node

/**
 * Manual script to save latest episode metadata to KV
 * Run this to test the post-latest functionality
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://v2u.ai';

async function saveLatestEpisode() {
  // Get the latest episode data - UPDATE THESE URLs WITH REAL ONES
  const episode = {
    title: "November 7, 2025, AI-Now - Race for AI Supremacy - Deep Dive with Alex and Jesica",
    description: "Latest episode discussing AI race for supremacy, technology trends, and deep analysis",
    youtubeUrl: "https://www.youtube.com/watch?v=EXAMPLE_ID", // <-- REPLACE WITH REAL YOUTUBE URL
    spotifyUrl: "https://open.spotify.com/episode/EXAMPLE_ID", // <-- REPLACE WITH REAL SPOTIFY URL  
    rumbleUrl: "https://rumble.com/EXAMPLE_ID", // <-- REPLACE WITH REAL RUMBLE URL
    category: "technology",
    publishDate: "2025-11-07T00:00:00.000Z"
  };

  console.log('\n📤 Saving episode metadata to KV...\n');
  console.log('Title:', episode.title);
  console.log('YouTube:', episode.youtubeUrl);
  console.log('Spotify:', episode.spotifyUrl);
  console.log('Rumble:', episode.rumbleUrl);
  console.log('\n⚠️  NOTE: Update the URLs above with real ones before running!\n');

  try {
    const response = await fetch(`${BASE_URL}/api/social-post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        platforms: [], // Empty array means just save metadata, don't post
        episode: episode
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('\n✅ Episode metadata saved successfully!');
      console.log('\nNow you can click "Post Latest Now" in the admin panel.');
    } else {
      console.error('\n❌ Failed to save episode metadata');
      console.error('Error:', result.error || result);
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

saveLatestEpisode();
