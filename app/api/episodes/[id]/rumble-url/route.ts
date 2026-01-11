import { NextRequest, NextResponse } from 'next/server';
import { kvStorage } from '@/lib/kv-storage';

export const runtime = 'nodejs';

interface UpdateRumbleUrlRequest {
  url: string;
  videoId?: string;
}

/**
 * PUT /api/episodes/[id]/rumble-url
 * Update episode with Rumble URL after manual upload
 * 
 * Body:
 * {
 *   "url": "https://rumble.com/v123abc-episode-title.html",
 *   "videoId": "v123abc"
 * }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const episodeId = params.id;
    const body: UpdateRumbleUrlRequest = await request.json();
    const { url, videoId } = body;

    if (!url) {
      return NextResponse.json({
        error: 'Missing required field: url',
      }, { status: 400 });
    }

    // Validate Rumble URL format
    if (!url.includes('rumble.com')) {
      return NextResponse.json({
        error: 'Invalid Rumble URL format',
        expected: 'https://rumble.com/v...',
      }, { status: 400 });
    }

    console.log(`🎯 Updating Rumble URL for episode: ${episodeId}`);
    console.log(`🔗 URL: ${url}`);

    // Extract video ID from URL if not provided
    let extractedVideoId = videoId;
    if (!extractedVideoId) {
      const match = url.match(/rumble\.com\/(v[a-z0-9]+)/i);
      if (match) {
        extractedVideoId = match[1];
      }
    }

    // Update episode platforms data
    const platformsKey = `episode:platforms:${episodeId}`;
    const existingData = await kvStorage.getFromKV(platformsKey);
    const platforms = existingData ? JSON.parse(existingData) : {};

    platforms.rumble = {
      ...platforms.rumble,
      status: 'uploaded',
      url,
      videoId: extractedVideoId,
      uploadedAt: new Date().toISOString(),
    };

    await kvStorage.saveToKV(platformsKey, JSON.stringify(platforms));

    // Update upload tracking
    const uploadData = await kvStorage.getFromKV(`rumble:upload:${episodeId}`);
    if (uploadData) {
      const upload = JSON.parse(uploadData);
      upload.status = 'completed';
      upload.url = url;
      upload.videoId = extractedVideoId;
      upload.completedAt = new Date().toISOString();
      await kvStorage.saveToKV(`rumble:upload:${episodeId}`, JSON.stringify(upload));
    }

    console.log('✅ Episode Rumble URL updated');

    return NextResponse.json({
      success: true,
      episodeId,
      rumbleUrl: url,
      videoId: extractedVideoId,
      message: 'Rumble URL updated successfully',
    });
  } catch (error) {
    console.error('❌ Failed to update Rumble URL:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
