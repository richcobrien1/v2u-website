/**
 * Spotify Podcast Checker
 * Monitors Spotify show for new episodes
 */

export interface SpotifyEpisode {
  id: string;
  title: string;
  url: string;
  publishedAt: string;
  description?: string;
  imageUrl?: string;
  durationMs?: number;
}

/**
 * Get latest episode from Spotify - uses direct URL from KV storage or API
 */
export async function getLatestSpotifyEpisode(config: {
  showId: string;
  accessToken?: string;
  latestEpisodeUrl?: string;
  latestEpisodeTitle?: string;
  latestEpisodeDate?: string;
}): Promise<SpotifyEpisode | null> {
  try {
    // If we have a direct episode URL from manual update, use that
    if (config.latestEpisodeUrl) {
      const url = config.latestEpisodeUrl;
      const episodeId = url.split('/').pop() || 'unknown';
      
      const episode: SpotifyEpisode = {
        id: episodeId,
        title: config.latestEpisodeTitle || 'Latest Spotify Episode',
        url: url,
        publishedAt: config.latestEpisodeDate || new Date().toISOString(),
        description: '',
        imageUrl: undefined,
        durationMs: undefined
      };

      console.log(`🎵 Latest Spotify episode (from URL): ${episode.title}`);
      console.log(`   Published: ${episode.publishedAt}`);
      console.log(`   URL: ${episode.url}`);

      return episode;
    }

    // If we have access token, use Spotify API
    if (config.accessToken) {
      return await getLatestFromSpotifyAPI(config.showId, config.accessToken);
    }
    
    // Otherwise use RSS feed if available
    return await getLatestFromSpotifyRSS(config.showId);
  } catch (error) {
    console.error('Error fetching Spotify episode:', error);
    return null;
  }
}

/**
 * Get latest episode using Spotify Web API
 */
async function getLatestFromSpotifyAPI(
  showId: string,
  accessToken: string
): Promise<SpotifyEpisode | null> {
  try {
    console.log(`🎵 Fetching from Spotify API: ${showId}`);
    
    const response = await fetch(
      `https://api.spotify.com/v1/shows/${showId}/episodes?limit=1`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!response.ok) {
      console.error(`Spotify API fetch failed: ${response.status}`);
      return null;
    }

    const data = await response.json() as {
      items?: Array<{
        id: string;
        name: string;
        external_urls: { spotify: string };
        release_date: string;
        description?: string;
        images?: Array<{ url: string }>;
        duration_ms?: number;
      }>;
    };
    
    if (!data.items || data.items.length === 0) {
      console.log('No episodes found in Spotify show');
      return null;
    }

    const episode = data.items[0];
    
    const spotifyEpisode: SpotifyEpisode = {
      id: episode.id,
      title: episode.name,
      url: episode.external_urls.spotify,
      publishedAt: episode.release_date,
      description: episode.description,
      imageUrl: episode.images?.[0]?.url,
      durationMs: episode.duration_ms
    };

    console.log(`🎵 Latest Spotify episode: ${spotifyEpisode.title}`);
    console.log(`   Published: ${spotifyEpisode.publishedAt}`);
    console.log(`   URL: ${spotifyEpisode.url}`);

    return spotifyEpisode;
  } catch (error) {
    console.error('Error fetching from Spotify API:', error);
    return null;
  }
}

/**
 * Get latest episode from Spotify RSS feed
 */
async function getLatestFromSpotifyRSS(showId: string): Promise<SpotifyEpisode | null> {
  try {
    // Spotify RSS feed format: https://anchor.fm/s/[showId]/podcast/rss
    // Note: This may not work for all shows
    const rssUrl = `https://anchor.fm/s/${showId}/podcast/rss`;
    
    console.log(`🎵 Fetching Spotify RSS: ${rssUrl}`);
    
    const response = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'V2U-Content-Checker/1.0'
      }
    });

    if (!response.ok) {
      console.error(`Spotify RSS fetch failed: ${response.status}`);
      return null;
    }

    const xmlText = await response.text();
    
    // Parse RSS feed (simplified - gets first item)
    const itemMatch = xmlText.match(/<item>([\s\S]*?)<\/item>/);
    if (!itemMatch) {
      console.log('No items found in Spotify RSS feed');
      return null;
    }

    const item = itemMatch[1];
    
    // Extract fields
    const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/);
    const linkMatch = item.match(/<link>(.*?)<\/link>/);
    const pubDateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);
    const descMatch = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/);
    const guidMatch = item.match(/<guid.*?>(.*?)<\/guid>/);
    const imageMatch = item.match(/<itunes:image href="(.*?)"/);
    const durationMatch = item.match(/<itunes:duration>(.*?)<\/itunes:duration>/);

    if (!titleMatch || !linkMatch || !pubDateMatch) {
      console.error('Failed to parse required Spotify RSS fields');
      return null;
    }

    const title = titleMatch[1];
    const url = linkMatch[1];
    const pubDate = new Date(pubDateMatch[1]).toISOString();
    const description = descMatch ? descMatch[1] : '';
    const imageUrl = imageMatch ? imageMatch[1] : undefined;
    
    // Extract episode ID from GUID or URL
    const episodeId = (guidMatch ? guidMatch[1].split('/').pop() : url.split('/').pop()) || 'unknown';

    // Parse duration if available (format can be HH:MM:SS or seconds)
    let durationMs: number | undefined;
    if (durationMatch) {
      const dur = durationMatch[1];
      if (dur.includes(':')) {
        const parts = dur.split(':').map(Number);
        if (parts.length === 3) {
          durationMs = (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000;
        } else if (parts.length === 2) {
          durationMs = (parts[0] * 60 + parts[1]) * 1000;
        }
      } else {
        durationMs = Number(dur) * 1000;
      }
    }

    const episode: SpotifyEpisode = {
      id: episodeId,
      title,
      url,
      publishedAt: pubDate,
      description,
      imageUrl,
      durationMs
    };

    console.log(`🎵 Latest Spotify episode: ${episode.title}`);
    console.log(`   Published: ${episode.publishedAt}`);
    console.log(`   URL: ${episode.url}`);

    return episode;
  } catch (error) {
    console.error('Error fetching Spotify RSS:', error);
    return null;
  }
}

/**
 * Get recent episodes from Spotify API (for backfilling missed posts)
 * @param config - Spotify show config
 * @param daysBack - How many days back to check (default: 7)
 * @returns Array of recent episodes, sorted oldest to newest
 */
export async function getRecentSpotifyEpisodes(
  config: { showId: string; accessToken?: string },
  daysBack: number = 7
): Promise<SpotifyEpisode[]> {
  if (!config.accessToken) {
    console.warn('getRecentSpotifyEpisodes: no accessToken available, skipping');
    return [];
  }

  try {
    const response = await fetch(
      `https://api.spotify.com/v1/shows/${config.showId}/episodes?limit=10`,
      { headers: { 'Authorization': `Bearer ${config.accessToken}` } }
    );

    if (!response.ok) {
      console.error(`Spotify API fetch failed: ${response.status}`);
      return [];
    }

    const data = await response.json() as {
      items?: Array<{
        id: string;
        name: string;
        external_urls: { spotify: string };
        release_date: string;
        description?: string;
        images?: Array<{ url: string }>;
        duration_ms?: number;
      }>;
    };

    if (!data.items || data.items.length === 0) return [];

    const cutoffDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

    const episodes = data.items
      .filter(ep => new Date(ep.release_date) >= cutoffDate)
      .map(ep => ({
        id: ep.id,
        title: ep.name,
        url: ep.external_urls.spotify,
        publishedAt: ep.release_date,
        description: ep.description,
        imageUrl: ep.images?.[0]?.url,
        durationMs: ep.duration_ms
      }));

    // Sort oldest to newest
    return episodes.sort((a, b) =>
      new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
    );
  } catch (error) {
    console.error('Error fetching recent Spotify episodes:', error);
    return [];
  }
}

/**
 * Check if content is recent (within specified hours)
 */
export function isContentRecent(publishedAt: string, hoursAgo: number = 24): boolean {
  const publishedDate = new Date(publishedAt);
  const now = new Date();
  const hoursDiff = (now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60);
  
  const isRecent = hoursDiff <= hoursAgo;
  console.log(`⏰ Content age: ${hoursDiff.toFixed(1)} hours (recent: ${isRecent})`);
  
  return isRecent;
}
