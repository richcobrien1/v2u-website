import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';

interface EpisodeMetadata {
  fullTitle?: string;
  primaryKeywords?: string[];
  detailedDescription?: string;
  timestamps?: Array<{ time: string; title: string }>;
  hashtags?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { r2Key, metadata } = await request.json() as {
      r2Key: string;
      metadata: EpisodeMetadata;
    };

    if (!r2Key || !metadata) {
      return NextResponse.json(
        { error: 'Missing r2Key or metadata' },
        { status: 400 }
      );
    }

    // Load existing metadata file
    const metadataPath = path.join(process.cwd(), 'data', 'episode-metadata.json');
    let existingData: Record<string, EpisodeMetadata> = {};
    
    try {
      const fileContent = await readFile(metadataPath, 'utf-8');
      existingData = JSON.parse(fileContent);
    } catch {
      // File doesn't exist yet, start fresh
      console.log('Creating new episode-metadata.json file');
    }

    // Add or update metadata for this episode
    existingData[r2Key] = metadata;

    // Save back to file
    await writeFile(
      metadataPath,
      JSON.stringify(existingData, null, 2),
      'utf-8'
    );

    return NextResponse.json({
      success: true,
      message: 'Metadata saved successfully',
      r2Key,
    });

  } catch (error) {
    console.error('Error saving metadata:', error);
    return NextResponse.json(
      { 
        error: 'Failed to save metadata',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
