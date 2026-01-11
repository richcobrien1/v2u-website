import { NextResponse } from 'next/server';
import { generatePodcastFeed } from '@/lib/platforms/spotify-feed';
import { fetchR2Episodes } from '@/lib/r2-episodes';

export const runtime = 'nodejs';

/**
 * GET /api/podcast/feed.xml
 * Generate podcast RSS feed for Spotify/Apple Podcasts
 */
export async function GET() {
  try {
    console.log('📡 Generating podcast RSS feed...');

    // Fetch episodes from R2
    const episodes = await fetchR2Episodes();

    if (episodes.length === 0) {
      console.warn('⚠️ No episodes found for feed generation');
    }

    // Transform episodes to RSS format
    const rssEpisodes = episodes.map((ep) => {
      // Parse duration from "HH:MM:SS" or seconds
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
        audioUrl: ep.audioUrl, // R2 audio/video URL
        duration: durationSeconds,
        publishDate: new Date(ep.publishDate || ep.id),
        episodeNumber: undefined,
        season: undefined,
        explicit: false,
        imageUrl: ep.thumbnail,
        keywords: ep.category ? [ep.category] : [],
      };
    });

    // Podcast metadata
    const metadata = {
      title: 'AI Now with Alex and Jessica',
      description:
        'AI Now is your daily deep dive into artificial intelligence, technology trends, and the future of innovation. Join hosts Alex and Jessica as they explore the latest developments in AI, analyze breaking tech news, and discuss how emerging technologies are reshaping our world. From operational AI to breakthrough research, we bring you insightful conversations and expert analysis that matter.',
      author: 'V2U Media',
      email: 'podcast@v2u.us',
      imageUrl: 'https://www.v2u.us/podcast-cover.jpg', // TODO: Update with actual cover art URL
      category: 'Technology',
      subCategory: undefined,
      language: 'en-us',
      copyright: `© ${new Date().getFullYear()} V2U Media. All rights reserved.`,
      websiteUrl: 'https://www.v2u.us',
      explicit: false,
    };

    // Generate RSS feed
    const feed = generatePodcastFeed(metadata, rssEpisodes);

    console.log(`✅ Generated RSS feed with ${rssEpisodes.length} episodes`);

    // Return as XML
    return new NextResponse(feed, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('❌ Failed to generate podcast feed:', error);

    // Return error as XML for podcast clients
    const errorFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>AI Now with Alex and Jessica - Error</title>
    <description>Feed generation failed</description>
    <language>en-us</language>
  </channel>
</rss>`;

    return new NextResponse(errorFeed, {
      status: 500,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    });
  }
}
