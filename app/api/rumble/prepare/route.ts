import { NextRequest, NextResponse } from 'next/server';
import { prepareRumbleUpload, formatRumbleDescription, formatRumbleTitle } from '@/lib/platforms/rumble-uploader';
import { kvStorage } from '@/lib/kv-storage';

export const runtime = 'nodejs';

interface PrepareRequest {
  episodeId: string;
  videoUrl: string;
  title: string;
  description: string;
  tags?: string[];
  category?: string;
  visibility?: 'public' | 'unlisted' | 'private';
  timestamps?: Array<{ time: string; title: string }>;
  hashtags?: string[];
}

/**
 * POST /api/rumble/prepare
 * Prepare episode for manual Rumble upload
 * 
 * Body:
 * {
 *   "episodeId": "2026-01-08-ai-now",
 *   "videoUrl": "https://r2.../episode.mp4",
 *   "title": "AI Now: Episode Title",
 *   "description": "Full description...",
 *   "tags": ["AI", "Technology"],
 *   "timestamps": [{"time": "00:00", "title": "Intro"}],
 *   "hashtags": ["#AI", "#Technology"]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body: PrepareRequest = await request.json();
    const {
      episodeId,
      videoUrl,
      title,
      description,
      tags,
      category,
      visibility,
      timestamps,
      hashtags,
    } = body;

    if (!episodeId || !videoUrl || !title || !description) {
      return NextResponse.json({
        error: 'Missing required fields',
        required: ['episodeId', 'videoUrl', 'title', 'description'],
      }, { status: 400 });
    }

    console.log(`📋 Preparing Rumble upload for episode: ${episodeId}`);

    // Format title and description for Rumble
    const rumbleTitle = formatRumbleTitle(title);
    const rumbleDescription = formatRumbleDescription(description, timestamps, hashtags);

    // Prepare upload package
    const uploadPackage = prepareRumbleUpload(episodeId, videoUrl, {
      title: rumbleTitle,
      description: rumbleDescription,
      tags,
      category,
      visibility,
    });

    // Save upload package to KV for tracking
    await kvStorage.set(
      `rumble:upload:${episodeId}`,
      {
        ...uploadPackage,
        status: 'prepared',
        preparedAt: new Date().toISOString(),
      }
    );

    // Update episode platforms data
    try {
      const platformsKey = `episode:platforms:${episodeId}`;
      const existingData = await kvStorage.get<Record<string, unknown>>(platformsKey);
      const platforms = existingData || {};

      platforms.rumble = {
        status: 'manual-pending',
        preparedAt: new Date().toISOString(),
        videoUrl,
        title: rumbleTitle,
        description: rumbleDescription,
      };

      await kvStorage.set(platformsKey, platforms);
      console.log('💾 Episode platforms data updated');
    } catch (updateError) {
      console.warn('⚠️ Failed to update episode platforms:', updateError);
    }

    console.log('✅ Rumble upload package prepared');

    return NextResponse.json({
      success: true,
      package: uploadPackage,
      message: 'Rumble upload package prepared. Follow instructions to upload manually.',
    });
  } catch (error) {
    console.error('❌ Rumble preparation failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

/**
 * GET /api/rumble/prepare?episodeId=xxx
 * Get prepared upload package
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const episodeId = searchParams.get('episodeId');

    if (!episodeId) {
      return NextResponse.json({
        error: 'Missing episodeId parameter',
      }, { status: 400 });
    }

    const packageData = await kvStorage.get<Record<string, unknown>>(`rumble:upload:${episodeId}`);

    if (!packageData) {
      return NextResponse.json({
        error: 'Upload package not found',
        message: 'Prepare the upload first with POST /api/rumble/prepare',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      package: packageData,
    });
  } catch (error) {
    console.error('❌ Failed to get upload package:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
