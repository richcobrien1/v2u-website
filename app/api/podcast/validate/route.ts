import { NextRequest, NextResponse } from 'next/server';
import { validatePodcastFeed } from '@/lib/platforms/spotify-feed';
import { fetchR2Episodes } from '@/lib/r2-episodes';

export const runtime = 'nodejs';

/**
 * GET /api/podcast/validate
 * Validate podcast RSS feed against Spotify requirements
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Validating podcast feed...');

    // Fetch episodes
    const episodes = await fetchR2Episodes();

    // Transform to RSS format
    const rssEpisodes = episodes.map((ep) => {
      let durationSeconds = 0;
      if (ep.duration) {
        if (typeof ep.duration === 'number') {
          durationSeconds = ep.duration;
        } else if (typeof ep.duration === 'string') {
          const parts = ep.duration.split(':').map(Number);
          if (parts.length === 3) {
            durationSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
          } else if (parts.length === 2) {
            durationSeconds = parts[0] * 60 + parts[1];
          }
        }
      }

      return {
        id: ep.id,
        title: ep.title,
        description: ep.description || ep.title,
        audioUrl: ep.url,
        duration: durationSeconds,
        publishDate: new Date(ep.publishedDate || ep.id),
        episodeNumber: undefined,
        season: undefined,
        explicit: false,
        imageUrl: ep.thumbnail,
        keywords: ep.category ? [ep.category] : [],
      };
    });

    // Metadata
    const metadata = {
      title: 'AI Now with Alex and Jessica',
      description:
        'AI Now is your daily deep dive into artificial intelligence, technology trends, and the future of innovation.',
      author: 'V2U Media',
      email: 'podcast@v2u.us',
      imageUrl: 'https://www.v2u.us/podcast-cover.jpg',
      category: 'Technology',
      language: 'en-us',
      copyright: `© ${new Date().getFullYear()} V2U Media`,
      websiteUrl: 'https://www.v2u.us',
      explicit: false,
    };

    // Validate
    const validation = validatePodcastFeed(metadata, rssEpisodes);

    console.log(`🔍 Validation: ${validation.valid ? 'PASS' : 'FAIL'}`);
    if (validation.errors.length > 0) {
      console.log(`❌ Errors: ${validation.errors.length}`);
    }
    if (validation.warnings.length > 0) {
      console.log(`⚠️ Warnings: ${validation.warnings.length}`);
    }

    return NextResponse.json({
      valid: validation.valid,
      errors: validation.errors,
      warnings: validation.warnings,
      episodeCount: rssEpisodes.length,
      feedUrl: 'https://www.v2u.us/api/podcast/feed.xml',
      message: validation.valid
        ? 'Feed is valid and ready for Spotify submission'
        : 'Feed has validation errors that must be fixed',
    });
  } catch (error) {
    console.error('❌ Validation failed:', error);
    return NextResponse.json({
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
