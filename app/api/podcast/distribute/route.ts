import { NextRequest, NextResponse } from 'next/server';
import { uploadVideoToYouTube } from '@/lib/platforms/youtube-uploader';
import { prepareRumbleUpload, formatRumbleDescription, formatRumbleTitle } from '@/lib/platforms/rumble-uploader';
import { kvStorage } from '@/lib/kv-storage';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for YouTube uploads

interface DistributeRequest {
  episodeId: string;
  videoUrl: string;
  title: string;
  description: string;
  tags?: string[];
  timestamps?: Array<{ time: string; title: string }>;
  hashtags?: string[];
  thumbnailUrl?: string;
  platforms?: ('youtube' | 'rumble' | 'spotify')[];
}

/**
 * POST /api/podcast/distribute
 * Distribute episode to all Level 1 platforms
 * 
 * Body:
 * {
 *   "episodeId": "2026-01-08-ai-now",
 *   "videoUrl": "https://r2.../episode.mp4",
 *   "title": "AI Now: Episode Title",
 *   "description": "Full description...",
 *   "tags": ["AI", "Technology"],
 *   "timestamps": [{"time": "00:00", "title": "Intro"}],
 *   "hashtags": ["#AI", "#Technology"],
 *   "thumbnailUrl": "https://r2.../thumb.jpg",
 *   "platforms": ["youtube", "rumble", "spotify"]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body: DistributeRequest = await request.json();
    const {
      episodeId,
      videoUrl,
      title,
      description,
      tags,
      timestamps,
      hashtags,
      thumbnailUrl,
      platforms = ['youtube', 'rumble', 'spotify'],
    } = body;

    if (!episodeId || !videoUrl || !title || !description) {
      return NextResponse.json({
        error: 'Missing required fields',
        required: ['episodeId', 'videoUrl', 'title', 'description'],
      }, { status: 400 });
    }

    console.log(`🚀 Starting distribution for episode: ${episodeId}`);
    console.log(`📺 Platforms: ${platforms.join(', ')}`);

    const results: Record<string, any> = {};

    // YouTube Distribution
    if (platforms.includes('youtube')) {
      console.log('\n📺 YouTube Upload...');
      try {
        const level1Config = await kvStorage.getLevel1Config();
        const youtubeConfig = level1Config?.youtube;

        if (youtubeConfig?.credentials?.accessToken) {
          const credentials = {
            clientId: youtubeConfig.credentials.clientId,
            clientSecret: youtubeConfig.credentials.clientSecret,
            redirectUri:
              youtubeConfig.credentials.redirectUri ||
              'https://www.v2u.us/api/youtube/callback',
            accessToken: youtubeConfig.credentials.accessToken,
            refreshToken: youtubeConfig.credentials.refreshToken,
            expiryDate: youtubeConfig.credentials.expiryDate,
          };

          const uploadResult = await uploadVideoToYouTube(
            credentials,
            videoUrl,
            {
              title,
              description,
              tags,
              categoryId: '28', // Science & Technology
              privacyStatus: 'public',
              thumbnailUrl,
            }
          );

          results.youtube = uploadResult;

          if (uploadResult.success) {
            console.log(`✅ YouTube: ${uploadResult.url}`);

            // Update episode platforms
            const platformsKey = `episode:platforms:${episodeId}`;
            const existingData = await kvStorage.getFromKV(platformsKey);
            const platformsData = existingData ? JSON.parse(existingData) : {};

            platformsData.youtube = {
              status: 'uploaded',
              videoId: uploadResult.videoId,
              url: uploadResult.url,
              uploadedAt: new Date().toISOString(),
            };

            await kvStorage.saveToKV(platformsKey, JSON.stringify(platformsData));
          } else {
            console.error(`❌ YouTube failed: ${uploadResult.error}`);
          }
        } else {
          results.youtube = {
            success: false,
            error: 'YouTube not authenticated. Complete OAuth flow first.',
            skipped: true,
          };
          console.log('⚠️ YouTube: Not authenticated, skipping');
        }
      } catch (youtubeError) {
        results.youtube = {
          success: false,
          error:
            youtubeError instanceof Error
              ? youtubeError.message
              : 'Unknown error',
        };
        console.error('❌ YouTube error:', youtubeError);
      }
    }

    // Rumble Distribution (Prepare for manual upload)
    if (platforms.includes('rumble')) {
      console.log('\n📹 Rumble Preparation...');
      try {
        const rumbleTitle = formatRumbleTitle(title);
        const rumbleDescription = formatRumbleDescription(
          description,
          timestamps,
          hashtags
        );

        const uploadPackage = prepareRumbleUpload(episodeId, videoUrl, {
          title: rumbleTitle,
          description: rumbleDescription,
          tags,
          category: 'Science & Technology',
          visibility: 'public',
        });

        // Save package to KV
        await kvStorage.saveToKV(
          `rumble:upload:${episodeId}`,
          JSON.stringify({
            ...uploadPackage,
            status: 'prepared',
            preparedAt: new Date().toISOString(),
          })
        );

        // Update episode platforms
        const platformsKey = `episode:platforms:${episodeId}`;
        const existingData = await kvStorage.getFromKV(platformsKey);
        const platformsData = existingData ? JSON.parse(existingData) : {};

        platformsData.rumble = {
          status: 'manual-pending',
          preparedAt: new Date().toISOString(),
          videoUrl,
          title: rumbleTitle,
          description: rumbleDescription,
        };

        await kvStorage.saveToKV(platformsKey, JSON.stringify(platformsData));

        results.rumble = {
          success: true,
          package: uploadPackage,
          message: 'Upload package prepared. Manual upload required.',
        };

        console.log('✅ Rumble: Package prepared');
      } catch (rumbleError) {
        results.rumble = {
          success: false,
          error:
            rumbleError instanceof Error ? rumbleError.message : 'Unknown error',
        };
        console.error('❌ Rumble error:', rumbleError);
      }
    }

    // Spotify Distribution (RSS feed auto-updates)
    if (platforms.includes('spotify')) {
      console.log('\n🎵 Spotify RSS...');
      try {
        // Spotify ingests via RSS feed
        // The feed is auto-generated at /api/podcast/feed.xml
        // No direct action needed - just confirm episode is in feed

        results.spotify = {
          success: true,
          message:
            'Episode will appear in RSS feed automatically. Spotify will ingest on next refresh.',
          feedUrl: 'https://www.v2u.us/api/podcast/feed.xml',
          note: 'Spotify typically refreshes feeds every 6-8 hours',
        };

        console.log('✅ Spotify: RSS feed will auto-update');
      } catch (spotifyError) {
        results.spotify = {
          success: false,
          error:
            spotifyError instanceof Error ? spotifyError.message : 'Unknown error',
        };
        console.error('❌ Spotify error:', spotifyError);
      }
    }

    // Save distribution log
    await kvStorage.saveToKV(
      `distribution:log:${episodeId}:${Date.now()}`,
      JSON.stringify({
        episodeId,
        platforms,
        results,
        timestamp: new Date().toISOString(),
      })
    );

    const successCount = Object.values(results).filter(
      (r: any) => r.success
    ).length;
    const totalCount = platforms.length;

    console.log(
      `\n✅ Distribution complete: ${successCount}/${totalCount} successful`
    );

    return NextResponse.json({
      success: successCount > 0,
      episodeId,
      platforms,
      results,
      summary: {
        total: totalCount,
        successful: successCount,
        failed: totalCount - successCount,
      },
      message: `Distribution completed: ${successCount}/${totalCount} platforms successful`,
    });
  } catch (error) {
    console.error('❌ Distribution failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
