import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

interface PlatformUrls {
  youtubeUrl?: string;
  rumbleUrl?: string;
  spotifyUrl?: string;
}

/**
 * PUT /api/episodes/[id]/platforms
 * Update platform URLs for an episode
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: PlatformUrls = await request.json();

    // Validate URLs
    if (body.youtubeUrl && !body.youtubeUrl.includes('youtube.com')) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }
    if (body.rumbleUrl && !body.rumbleUrl.includes('rumble.com')) {
      return NextResponse.json(
        { error: 'Invalid Rumble URL' },
        { status: 400 }
      );
    }
    if (body.spotifyUrl && !body.spotifyUrl.includes('spotify.com')) {
      return NextResponse.json(
        { error: 'Invalid Spotify URL' },
        { status: 400 }
      );
    }

    // Read platform URLs file
    const dataPath = path.join(process.cwd(), 'data', 'episode-platforms.json');
    let platformsData: Record<string, PlatformUrls> = {};

    try {
      const fileContent = await readFile(dataPath, 'utf-8');
      platformsData = JSON.parse(fileContent);
    } catch (error) {
      // File doesn't exist yet, start with empty object
      console.log('Creating new episode-platforms.json file');
    }

    // Update the episode's platform URLs
    platformsData[id] = {
      youtubeUrl: body.youtubeUrl || undefined,
      rumbleUrl: body.rumbleUrl || undefined,
      spotifyUrl: body.spotifyUrl || undefined,
    };

    // Save back to file
    await writeFile(dataPath, JSON.stringify(platformsData, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'Platform URLs updated successfully',
      data: platformsData[id],
    });

  } catch (error) {
    console.error('Error updating platform URLs:', error);
    return NextResponse.json(
      { error: 'Failed to update platform URLs' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/episodes/[id]/platforms
 * Get platform URLs for an episode
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dataPath = path.join(process.cwd(), 'data', 'episode-platforms.json');

    try {
      const fileContent = await readFile(dataPath, 'utf-8');
      const platformsData: Record<string, PlatformUrls> = JSON.parse(fileContent);
      
      return NextResponse.json(platformsData[id] || {});
    } catch (error) {
      // File doesn't exist, return empty object
      return NextResponse.json({});
    }

  } catch (error) {
    console.error('Error reading platform URLs:', error);
    return NextResponse.json(
      { error: 'Failed to read platform URLs' },
      { status: 500 }
    );
  }
}
