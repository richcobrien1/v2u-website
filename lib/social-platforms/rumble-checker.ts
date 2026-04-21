/**
 * Rumble Content Checker
 * Monitors Rumble channel for new videos
 */

export interface RumbleVideo {
  id: string;
  title: string;
  url: string;
  publishedAt: string;
  thumbnailUrl?: string;
  description?: string;
}

/**
 * Get latest video from Rumble - uses direct URL from KV storage or RSS feed
 */
export async function getLatestRumbleVideo(config: {
  channelUrl: string;
  latestVideoUrl?: string;
  latestVideoTitle?: string;
  latestVideoDate?: string;
}): Promise<RumbleVideo | null> {
  try {
    // If we have a direct video URL from manual update, use that
    if (config.latestVideoUrl) {
      const url = config.latestVideoUrl;
      const videoId = url.split('/').find(part => part.startsWith('v')) || url.split('/').pop() || 'unknown';
      
      const video: RumbleVideo = {
        id: videoId,
        title: config.latestVideoTitle || 'Latest Rumble Video',
        url: url,
        publishedAt: config.latestVideoDate || new Date().toISOString(),
        thumbnailUrl: undefined,
        description: ''
      };

      console.log(`📹 Latest Rumble video (from URL): ${video.title}`);
      console.log(`   Published: ${video.publishedAt}`);
      console.log(`   URL: ${video.url}`);

      return video;
    }

    // Fallback to RSS if no direct URL provided
    const rssUrl = config.channelUrl.includes('/rss') 
      ? config.channelUrl 
      : `${config.channelUrl}/rss`;

    console.log(`📹 Fetching Rumble RSS: ${rssUrl}`);
    
    const response = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'V2U-Content-Checker/1.0'
      }
    });

    if (!response.ok) {
      console.error(`Rumble RSS fetch failed: ${response.status}`);
      return null;
    }

    const xmlText = await response.text();
    
    // Parse RSS feed (simplified - gets first item)
    const itemMatch = xmlText.match(/<item>([\s\S]*?)<\/item>/);
    if (!itemMatch) {
      console.log('No items found in Rumble RSS feed');
      return null;
    }

    const item = itemMatch[1];
    
    // Extract fields
    const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/);
    const linkMatch = item.match(/<link>(.*?)<\/link>/);
    const pubDateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);
    const descMatch = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/);

    if (!titleMatch || !linkMatch || !pubDateMatch) {
      console.error('Failed to parse required Rumble RSS fields');
      return null;
    }

    const title = titleMatch[1];
    const url = linkMatch[1];
    const pubDate = new Date(pubDateMatch[1]).toISOString();
    const description = descMatch ? descMatch[1] : '';
    
    // Extract video ID from URL (last segment)
    const videoId = url.split('/').pop() || url.split('-').pop() || 'unknown';

    // Try to extract thumbnail from description
    const thumbMatch = description.match(/<img.*?src="(.*?)"/);
    const thumbnailUrl = thumbMatch ? thumbMatch[1] : undefined;

    const video: RumbleVideo = {
      id: videoId,
      title,
      url,
      publishedAt: pubDate,
      thumbnailUrl,
      description
    };

    console.log(`📹 Latest Rumble video: ${video.title}`);
    console.log(`   Published: ${video.publishedAt}`);
    console.log(`   URL: ${video.url}`);

    return video;
  } catch (error) {
    console.error('Error fetching Rumble video:', error);
    return null;
  }
}

/**
 * Get recent videos from Rumble RSS (for backfilling missed posts)
 * @param config - Rumble channel config
 * @param daysBack - How many days back to check (default: 7)
 * @returns Array of recent videos, sorted oldest to newest
 */
export async function getRecentRumbleVideos(
  config: { channelUrl: string },
  daysBack: number = 7
): Promise<RumbleVideo[]> {
  try {
    const rssUrl = config.channelUrl.includes('/rss')
      ? config.channelUrl
      : `${config.channelUrl}/rss`;

    const response = await fetch(rssUrl, {
      headers: { 'User-Agent': 'V2U-Content-Checker/1.0' }
    });

    if (!response.ok) {
      console.error(`Rumble RSS fetch failed: ${response.status}`);
      return [];
    }

    const xmlText = await response.text();
    const cutoffDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

    const items: RumbleVideo[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(xmlText)) !== null) {
      const item = match[1];

      const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/);
      const linkMatch = item.match(/<link>(.*?)<\/link>/);
      const pubDateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);
      const descMatch = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/);

      if (!titleMatch || !linkMatch || !pubDateMatch) continue;

      const pubDate = new Date(pubDateMatch[1]);
      if (pubDate < cutoffDate) continue;

      const url = linkMatch[1];
      const description = descMatch ? descMatch[1] : '';
      const videoId = url.split('/').pop() || url.split('-').pop() || 'unknown';
      const thumbMatch = description.match(/<img.*?src="(.*?)"/);

      items.push({
        id: videoId,
        title: titleMatch[1],
        url,
        publishedAt: pubDate.toISOString(),
        thumbnailUrl: thumbMatch ? thumbMatch[1] : undefined,
        description
      });
    }

    // Sort oldest to newest
    return items.sort((a, b) =>
      new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
    );
  } catch (error) {
    console.error('Error fetching recent Rumble videos:', error);
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
