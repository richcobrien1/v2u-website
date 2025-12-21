import { NextRequest, NextResponse } from 'next/server';

// Episode metadata structure stored in R2
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
}

// Mock data for testing - will be replaced with R2 fetch
const MOCK_EPISODES: Record<string, EpisodeMetadata> = {
  'test-123': {
    id: 'test-123',
    title: 'AI-Now Episode 1: The Future of AI',
    description: 'Join Alex and Jessica as they dive deep into the latest AI developments, breaking news, and trends shaping our digital future.',
    publishedAt: '2025-12-20T00:00:00Z',
    thumbnail: 'https://pub-1d6863c908d24eb59db6e318d7d6f63c.r2.dev/promos/AI-Now%20Episode%20Cover%20Art.jpg',
    videos: {
      landscape: 'https://pub-1d6863c908d24eb59db6e318d7d6f63c.r2.dev/videos/test-landscape.mp4',
      portrait: 'https://pub-1d6863c908d24eb59db6e318d7d6f63c.r2.dev/videos/test-portrait.mp4',
      square: 'https://pub-1d6863c908d24eb59db6e318d7d6f63c.r2.dev/videos/test-square.mp4',
    },
    duration: 1800, // 30 minutes
    series: 'AI-Now',
    tags: ['AI', 'Technology', 'News'],
  },
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const episodeId = params.id;

  try {
    // TODO: Replace with actual R2 fetch
    // const metadataUrl = `${process.env.R2_PUBLIC_DOMAIN}/episodes/${episodeId}/metadata.json`;
    // const response = await fetch(metadataUrl);
    // const episode = await response.json();

    // For now, use mock data
    const episode = MOCK_EPISODES[episodeId];

    if (!episode) {
      return NextResponse.json(
        { error: 'Episode not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(episode);

  } catch (error) {
    console.error('Error fetching episode:', error);
    return NextResponse.json(
      { error: 'Failed to load episode' },
      { status: 500 }
    );
  }
}

// List all episodes
export async function POST() {
  try {
    // TODO: Fetch list from R2
    // For now, return mock data
    const episodes = Object.values(MOCK_EPISODES);

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
