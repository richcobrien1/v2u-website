import { NextRequest, NextResponse } from 'next/server';
import { fetchR2Episodes } from '@/lib/r2-episodes';
import { readFile } from 'fs/promises';
import path from 'path';

// Episode metadata structure for the player
interface EpisodeMetadata {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnail: string;
  videos: {
    landscape: string;
    portrait: string;
    square: string;
  };
  duration: number;
  series: string;
  tags: string[];
  platforms?: {
    youtubeUrl?: string;
    rumbleUrl?: string;
    spotifyUrl?: string;
  };
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const episodeId = params.id;

  try {
    // Fetch all episodes from R2 (same source as podcast-dashboard)
    const allEpisodes = await fetchR2Episodes();
    
    console.log(`[Player API] Looking for episode: ${episodeId}`);
    console.log(`[Player API] Total episodes available: ${allEpisodes.length}`);
    console.log(`[Player API] First few episode IDs:`, allEpisodes.slice(0, 3).map(ep => ep.id));
    
    // Load platform URLs
    let platformsData: Record<string, { youtubeUrl?: string; rumbleUrl?: string; spotifyUrl?: string }> = {};
    try {
      const dataPath = path.join(process.cwd(), 'data', 'episode-platforms.json');
      const fileContent = await readFile(dataPath, 'utf-8');
      platformsData = JSON.parse(fileContent);
    } catch {
      console.log('No episode-platforms.json found');
    }

    // Find the episode by ID
    const r2Episode = allEpisodes.find(ep => ep.id === episodeId);

    if (!r2Episode) {
      console.log(`[Player API] Episode not found. Available IDs:`, allEpisodes.map(ep => ep.id));
      return NextResponse.json(
        { 
          error: 'Episode not found', 
          requestedId: episodeId,
          availableEpisodes: allEpisodes.length,
          sampleIds: allEpisodes.slice(0, 5).map(ep => ({ id: ep.id, title: ep.title }))
        },
        { status: 404 }
      );
    }

    // Convert R2Episode to player metadata format
    const episode: EpisodeMetadata = {
      id: r2Episode.id,
      title: r2Episode.title,
      description: r2Episode.description,
      publishedAt: new Date(r2Episode.publishDate).toISOString(),
      thumbnail: r2Episode.thumbnail,
      videos: {
        // Use the main audioUrl (video URL) for all formats
        // Later we can add format-specific URLs when available
        landscape: r2Episode.audioUrl,
        portrait: r2Episode.audioUrl,
        square: r2Episode.audioUrl,
      },
      duration: parseDuration(r2Episode.duration),
      series: getCategoryLabel(r2Episode.category),
      tags: [r2Episode.category, ...(r2Episode.subcategory ? [r2Episode.subcategory] : [])],
      platforms: platformsData[episodeId],
    };

    return NextResponse.json(episode);

  } catch (error) {
    console.error('Error fetching episode:', error);
    return NextResponse.json(
      { error: 'Failed to load episode' },
      { status: 500 }
    );
  }
}

// Helper to convert duration string (MM:SS) to seconds
function parseDuration(duration: string): number {
  const [mins, secs] = duration.split(':').map(Number);
  return (mins * 60) + (secs || 0);
}

// Helper to get friendly category label
function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    'ai-now': 'AI-Now',
    'ai-now-educate': 'AI-Now Educate',
    'ai-now-commercial': 'AI-Now Commercial',
    'ai-now-conceptual': 'AI-Now Conceptual',
    'ai-now-reviews': 'AI-Now Reviews',
  };
  return labels[category] || 'AI-Now';
}

// List all episodes
export async function POST() {
  try {
    // Fetch all episodes from R2 (same source as podcast-dashboard)
    const allEpisodes = await fetchR2Episodes();
    
    // Load platform URLs
    let platformsData: Record<string, { youtubeUrl?: string; rumbleUrl?: string; spotifyUrl?: string }> = {};
    try {
      const dataPath = path.join(process.cwd(), 'data', 'episode-platforms.json');
      const fileContent = await readFile(dataPath, 'utf-8');
      platformsData = JSON.parse(fileContent);
    } catch {
      console.log('No episode-platforms.json found');
    }

    // Convert all episodes to player format
    const episodes: EpisodeMetadata[] = allEpisodes.map(r2Episode => ({
      id: r2Episode.id,
      title: r2Episode.title,
      description: r2Episode.description,
      publishedAt: new Date(r2Episode.publishDate).toISOString(),
      thumbnail: r2Episode.thumbnail,
      videos: {
        landscape: r2Episode.audioUrl,
        portrait: r2Episode.audioUrl,
        square: r2Episode.audioUrl,
      },
      duration: parseDuration(r2Episode.duration),
      series: getCategoryLabel(r2Episode.category),
      tags: [r2Episode.category, ...(r2Episode.subcategory ? [r2Episode.subcategory] : [])],
      platforms: platformsData[r2Episode.id],
    }));

    return NextResponse.json({
      episodes,
      total: episodes.length,
    });

  } catch (error) {
    console.error('Error listing episodes:', error);
    return NextResponse.json(
      { error: 'Failed to list episodes' },
      { status: 500 }
    );
  }
}
