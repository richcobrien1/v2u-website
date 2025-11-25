import { NextResponse } from 'next/server';
import { kvStorage } from '@/lib/kv-storage';
import { getLatestYouTubeVideo, isVideoRecent } from '@/lib/social-platforms/youtube-checker';
import { getLatestRumbleVideo, isContentRecent as isRumbleRecent } from '@/lib/social-platforms/rumble-checker';
import { getLatestSpotifyEpisode, isContentRecent as isSpotifyRecent } from '@/lib/social-platforms/spotify-checker';

export const runtime = 'nodejs';

/**
 * GET /api/automation/debug-check
 * Debug endpoint to see why automation isn't detecting new content
 */
export async function GET() {
  try {
    const level1Config = await kvStorage.getLevel1Config();
    const debugInfo: Record<string, unknown> = {};

    // YouTube Debug
    if (level1Config.youtube?.configured) {
      const latestVideo = await getLatestYouTubeVideo({
        apiKey: level1Config.youtube.credentials.apiKey || '',
        channelId: level1Config.youtube.credentials.channelId || ''
      });

      if (latestVideo) {
        const isRecent = isVideoRecent(latestVideo.publishedAt, 24);
        const alreadyPosted = await kvStorage.hasPostedVideo(latestVideo.id);
        
        debugInfo.youtube = {
          found: true,
          videoId: latestVideo.id,
          title: latestVideo.title,
          publishedAt: latestVideo.publishedAt,
          url: latestVideo.url,
          isRecent24h: isRecent,
          alreadyPosted: alreadyPosted,
          willPost: isRecent && !alreadyPosted,
          hoursAgo: Math.round((Date.now() - new Date(latestVideo.publishedAt).getTime()) / (1000 * 60 * 60))
        };
      } else {
        debugInfo.youtube = { found: false, error: 'No video found' };
      }
    }

    // Rumble Debug
    if (level1Config.rumble?.configured) {
      try {
        const latestRumble = await getLatestRumbleVideo({
          channelUrl: level1Config.rumble.credentials.channelUrl || '',
          channelName: level1Config.rumble.credentials.channelName || ''
        });

        if (latestRumble) {
          const isRecent = isRumbleRecent(latestRumble.publishedAt, 24);
          const alreadyPosted = await kvStorage.hasPostedVideo(latestRumble.id);
          
          debugInfo.rumble = {
            found: true,
            videoId: latestRumble.id,
            title: latestRumble.title,
            publishedAt: latestRumble.publishedAt,
            url: latestRumble.url,
            isRecent24h: isRecent,
            alreadyPosted: alreadyPosted,
            willPost: isRecent && !alreadyPosted,
            hoursAgo: Math.round((Date.now() - new Date(latestRumble.publishedAt).getTime()) / (1000 * 60 * 60))
          };
        } else {
          debugInfo.rumble = { found: false, error: 'No video found' };
        }
      } catch (error) {
        debugInfo.rumble = { 
          found: false, 
          error: error instanceof Error ? error.message : 'Unknown error',
          channelUrl: level1Config.rumble.credentials.channelUrl
        };
      }
    }

    // Spotify Debug
    if (level1Config.spotify?.configured) {
      try {
        const latestEpisode = await getLatestSpotifyEpisode({
          showId: level1Config.spotify.credentials.showId || '',
          accessToken: level1Config.spotify.credentials.accessToken || ''
        });

        if (latestEpisode) {
          const isRecent = isSpotifyRecent(latestEpisode.publishedAt, 24);
          const alreadyPosted = await kvStorage.hasPostedVideo(latestEpisode.id);
          
          debugInfo.spotify = {
            found: true,
            episodeId: latestEpisode.id,
            title: latestEpisode.title,
            publishedAt: latestEpisode.publishedAt,
            url: latestEpisode.url,
            isRecent24h: isRecent,
            alreadyPosted: alreadyPosted,
            willPost: isRecent && !alreadyPosted,
            hoursAgo: Math.round((Date.now() - new Date(latestEpisode.publishedAt).getTime()) / (1000 * 60 * 60))
          };
        } else {
          debugInfo.spotify = { found: false, error: 'No episode found' };
        }
      } catch (error) {
        debugInfo.spotify = { 
          found: false, 
          error: error instanceof Error ? error.message : 'Unknown error',
          showId: level1Config.spotify.credentials.showId
        };
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      debugInfo
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
