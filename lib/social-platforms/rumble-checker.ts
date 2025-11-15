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
 * Get latest video from Rumble channel RSS feed
 */
export async function getLatestRumbleVideo(config: {
  channelUrl: string;
}): Promise<RumbleVideo | null> {
  try {
    // Rumble RSS feed format: https://rumble.com/c/[channel]/rss
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
    const guidMatch = item.match(/<guid.*?>(.*?)<\/guid>/);

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
