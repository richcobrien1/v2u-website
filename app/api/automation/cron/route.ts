import { NextRequest, NextResponse } from 'next/server';
import { kvStorage } from '@/lib/kv-storage';

export const runtime = 'nodejs';

/**
 * GET /api/automation/cron
 * Called hourly by Vercel Cron to check for new content
 * Schedule: "0 * * * *" (every hour at minute 0)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify this is actually from Vercel Cron
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Load automation state from KV
    const status = await kvStorage.getStatus();
    
    if (!status?.running) {
      return NextResponse.json({
        success: true,
        message: 'Automation is stopped',
        skipped: true
      });
    }

    const results = {
      youtube: { checked: false, newVideos: 0, posted: 0, errors: [] as string[] },
      rumble: { checked: false, newVideos: 0, posted: 0, errors: [] as string[] },
      spotify: { checked: false, newEpisodes: 0, posted: 0, errors: [] as string[] },
      scheduled: { checked: false, executed: 0, errors: [] as string[] }
    };

    // Execute scheduled posts
    try {
      const baseUrl = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : 'http://localhost:3000';
      
      const scheduleResponse = await fetch(`${baseUrl}/api/social-schedule`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });

      const scheduleData = await scheduleResponse.json() as {
        success: boolean;
        executed?: number;
        results?: Array<{ postId: string; success: boolean }>;
      };

      results.scheduled.checked = true;
      if (scheduleData.success && scheduleData.executed) {
        results.scheduled.executed = scheduleData.executed;
      }
    } catch (error) {
      results.scheduled.errors.push(error instanceof Error ? error.message : 'Unknown error');
    }

    // Check YouTube for new videos
    if (process.env.YOUTUBE_API_KEY) {
      try {
        const newVideos = await checkYouTubeForNewContent();
        results.youtube.checked = true;
        results.youtube.newVideos = newVideos.length;

        // Post each new video to appropriate Level 2 platforms
        for (const video of newVideos) {
          try {
            await postToSocialMedia(video, determinePlatforms(video));
            results.youtube.posted++;
          } catch (error) {
            results.youtube.errors.push(error instanceof Error ? error.message : 'Unknown error');
          }
        }
      } catch (error) {
        results.youtube.errors.push(error instanceof Error ? error.message : 'Unknown error');
      }
    }

    // Check Rumble for new videos
    if (process.env.RUMBLE_API_KEY) {
      try {
        const newVideos = await checkRumbleForNewContent();
        results.rumble.checked = true;
        results.rumble.newVideos = newVideos.length;

        for (const video of newVideos) {
          try {
            await postToSocialMedia(video, determinePlatforms(video));
            results.rumble.posted++;
          } catch (error) {
            results.rumble.errors.push(error instanceof Error ? error.message : 'Unknown error');
          }
        }
      } catch (error) {
        results.rumble.errors.push(error instanceof Error ? error.message : 'Unknown error');
      }
    }

    // Check Spotify for new episodes
    if (process.env.SPOTIFY_CLIENT_ID) {
      try {
        const newEpisodes = await checkSpotifyForNewContent();
        results.spotify.checked = true;
        results.spotify.newEpisodes = newEpisodes.length;

        for (const episode of newEpisodes) {
          try {
            await postToSocialMedia(episode, ['twitter', 'facebook']);
            results.spotify.posted++;
          } catch (error) {
            results.spotify.errors.push(error instanceof Error ? error.message : 'Unknown error');
          }
        }
      } catch (error) {
        results.spotify.errors.push(error instanceof Error ? error.message : 'Unknown error');
      }
    }

    // Update last check time and increment counter in KV
    const now = new Date().toISOString();
    const nextCheck = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    
    await kvStorage.saveStatus({
      running: true,
      lastCheck: now,
      nextCheck,
      checksToday: (status?.checksToday || 0) + 1
    });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: 'Cron job failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

interface VideoContent {
  id: string;
  title: string;
  description: string;
  url: string;
  platform: 'youtube' | 'rumble' | 'spotify';
  publishedAt: string;
  aspectRatio?: 'landscape' | 'portrait';
  thumbnailUrl?: string;
}

/**
 * Check YouTube API for new videos since last check
 */
async function checkYouTubeForNewContent(): Promise<VideoContent[]> {
  // TODO: Get last check time from KV
  // TODO: Call YouTube Data API v3 to get videos uploaded since last check
  // TODO: Filter to only videos we haven't posted yet
  // Example: GET https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=XXX&order=date&publishedAfter=XXX
  
  return []; // Return empty array for now
}

/**
 * Check Rumble API for new videos since last check
 */
async function checkRumbleForNewContent(): Promise<VideoContent[]> {
  // TODO: Get last check time from KV
  // TODO: Call Rumble API to get videos uploaded since last check
  // TODO: Filter to only videos we haven't posted yet
  
  return []; // Return empty array for now
}

/**
 * Check Spotify API for new episodes since last check
 */
async function checkSpotifyForNewContent(): Promise<VideoContent[]> {
  // TODO: Get last check time from KV
  // TODO: Get Spotify access token using client credentials
  // TODO: Call Spotify API to get episodes published since last check
  // Example: GET https://api.spotify.com/v1/shows/{id}/episodes
  
  return []; // Return empty array for now
}

/**
 * Determine which Level 2 platforms to post to based on content type
 */
function determinePlatforms(video: VideoContent): string[] {
  // Desktop/Landscape videos → LinkedIn + Facebook
  // Mobile/Portrait videos → X + Threads + Instagram
  // Spotify (audio) → X + Facebook
  
  if (video.platform === 'spotify') {
    return ['twitter', 'facebook'];
  }
  
  if (video.aspectRatio === 'portrait') {
    return ['twitter', 'threads', 'instagram'];
  }
  
  // Default to landscape/desktop
  return ['linkedin', 'facebook'];
}

/**
 * Post content to Level 2 social platforms using existing /api/social-post endpoint
 */
async function postToSocialMedia(video: VideoContent, platforms: string[]): Promise<void> {
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:3000';

  const episode = {
    title: video.title,
    description: video.description,
    youtubeUrl: video.platform === 'youtube' ? video.url : undefined,
    rumbleUrl: video.platform === 'rumble' ? video.url : undefined,
    spotifyUrl: video.platform === 'spotify' ? video.url : undefined,
    category: 'Technology',
    publishDate: video.publishedAt
  };

  const response = await fetch(`${baseUrl}/api/social-post`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      platforms,
      episode
    })
  });

  if (!response.ok) {
    const error = await response.json() as { error?: string };
    throw new Error(`Failed to post to social media: ${error.error || 'Unknown error'}`);
  }

  // TODO: Store posted content ID in KV to avoid duplicate posts
}
