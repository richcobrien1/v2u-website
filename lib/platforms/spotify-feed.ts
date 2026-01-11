/**
 * Spotify Podcast RSS Feed Generator
 * Generates podcast RSS 2.0 feed with iTunes tags for Spotify distribution
 */

interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  duration: number; // in seconds
  publishDate: Date;
  episodeNumber?: number;
  season?: number;
  explicit?: boolean;
  imageUrl?: string;
  keywords?: string[];
}

interface PodcastMetadata {
  title: string;
  description: string;
  author: string;
  email: string;
  imageUrl: string;
  category: string;
  subCategory?: string;
  language?: string;
  copyright?: string;
  websiteUrl?: string;
  explicit?: boolean;
}

/**
 * Format duration as HH:MM:SS for iTunes
 */
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Escape XML special characters
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generate podcast RSS feed
 */
export function generatePodcastFeed(
  metadata: PodcastMetadata,
  episodes: PodcastEpisode[]
): string {
  const now = new Date().toUTCString();

  // Sort episodes by publish date (newest first)
  const sortedEpisodes = [...episodes].sort(
    (a, b) => b.publishDate.getTime() - a.publishDate.getTime()
  );

  const episodeItems = sortedEpisodes
    .map((episode) => {
      const episodeImageUrl = episode.imageUrl || metadata.imageUrl;
      const keywords = episode.keywords?.join(', ') || '';

      return `
    <item>
      <title>${escapeXml(episode.title)}</title>
      <description><![CDATA[${episode.description}]]></description>
      <pubDate>${episode.publishDate.toUTCString()}</pubDate>
      <guid isPermaLink="false">${escapeXml(episode.id)}</guid>
      <enclosure url="${escapeXml(episode.audioUrl)}" type="audio/mpeg" length="0"/>
      <itunes:title>${escapeXml(episode.title)}</itunes:title>
      <itunes:summary><![CDATA[${episode.description}]]></itunes:summary>
      <itunes:duration>${formatDuration(episode.duration)}</itunes:duration>
      <itunes:explicit>${episode.explicit ? 'true' : 'false'}</itunes:explicit>
      <itunes:image href="${escapeXml(episodeImageUrl)}"/>
      ${episode.episodeNumber ? `<itunes:episode>${episode.episodeNumber}</itunes:episode>` : ''}
      ${episode.season ? `<itunes:season>${episode.season}</itunes:season>` : ''}
      <itunes:episodeType>full</itunes:episodeType>
      ${keywords ? `<itunes:keywords>${escapeXml(keywords)}</itunes:keywords>` : ''}
    </item>`;
    })
    .join('\n');

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(metadata.title)}</title>
    <description><![CDATA[${metadata.description}]]></description>
    <language>${metadata.language || 'en-us'}</language>
    <copyright>${escapeXml(metadata.copyright || `© ${new Date().getFullYear()} ${metadata.author}`)}</copyright>
    <lastBuildDate>${now}</lastBuildDate>
    <link>${escapeXml(metadata.websiteUrl || 'https://www.v2u.us')}</link>
    <atom:link href="${escapeXml(metadata.websiteUrl || 'https://www.v2u.us')}/api/podcast/feed.xml" rel="self" type="application/rss+xml"/>
    
    <itunes:author>${escapeXml(metadata.author)}</itunes:author>
    <itunes:summary><![CDATA[${metadata.description}]]></itunes:summary>
    <itunes:owner>
      <itunes:name>${escapeXml(metadata.author)}</itunes:name>
      <itunes:email>${escapeXml(metadata.email)}</itunes:email>
    </itunes:owner>
    <itunes:image href="${escapeXml(metadata.imageUrl)}"/>
    <itunes:category text="${escapeXml(metadata.category)}">
      ${metadata.subCategory ? `<itunes:category text="${escapeXml(metadata.subCategory)}"/>` : ''}
    </itunes:category>
    <itunes:explicit>${metadata.explicit ? 'true' : 'false'}</itunes:explicit>
    <itunes:type>episodic</itunes:type>
    
    ${episodeItems}
  </channel>
</rss>`;

  return feed;
}

/**
 * Validate podcast feed against Spotify requirements
 */
export function validatePodcastFeed(metadata: PodcastMetadata, episodes: PodcastEpisode[]): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!metadata.title || metadata.title.length === 0) {
    errors.push('Podcast title is required');
  }

  if (!metadata.description || metadata.description.length < 10) {
    errors.push('Podcast description must be at least 10 characters');
  }

  if (!metadata.author || metadata.author.length === 0) {
    errors.push('Podcast author is required');
  }

  if (!metadata.email || !metadata.email.includes('@')) {
    errors.push('Valid email is required');
  }

  if (!metadata.imageUrl || !metadata.imageUrl.startsWith('http')) {
    errors.push('Valid podcast image URL is required');
  }

  if (!metadata.category) {
    errors.push('Podcast category is required');
  }

  // Episode validation
  if (episodes.length === 0) {
    warnings.push('No episodes in feed');
  }

  episodes.forEach((episode, index) => {
    if (!episode.title) {
      errors.push(`Episode ${index + 1}: Title is required`);
    }

    if (!episode.description || episode.description.length < 10) {
      errors.push(`Episode ${index + 1}: Description must be at least 10 characters`);
    }

    if (!episode.audioUrl || !episode.audioUrl.startsWith('http')) {
      errors.push(`Episode ${index + 1}: Valid audio URL is required`);
    }

    if (!episode.audioUrl.endsWith('.mp3') && !episode.audioUrl.endsWith('.m4a')) {
      warnings.push(`Episode ${index + 1}: Audio should be MP3 or M4A format`);
    }

    if (episode.duration <= 0) {
      errors.push(`Episode ${index + 1}: Duration must be greater than 0`);
    }

    if (!episode.publishDate) {
      errors.push(`Episode ${index + 1}: Publish date is required`);
    }
  });

  // Recommendations
  if (!metadata.websiteUrl) {
    warnings.push('Podcast website URL recommended');
  }

  if (metadata.description.length < 100) {
    warnings.push('Longer podcast description recommended (100+ characters)');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get recommended iTunes categories
 */
export const iTunesCategories = {
  'Arts': ['Books', 'Design', 'Fashion & Beauty', 'Food', 'Performing Arts', 'Visual Arts'],
  'Business': ['Careers', 'Entrepreneurship', 'Investing', 'Management', 'Marketing', 'Non-Profit'],
  'Comedy': ['Comedy Interviews', 'Improv', 'Stand-Up'],
  'Education': ['Courses', 'How To', 'Language Learning', 'Self-Improvement'],
  'Fiction': ['Comedy Fiction', 'Drama', 'Science Fiction'],
  'Government': [],
  'History': [],
  'Health & Fitness': ['Alternative Health', 'Fitness', 'Medicine', 'Mental Health', 'Nutrition', 'Sexuality'],
  'Kids & Family': ['Education for Kids', 'Parenting', 'Pets & Animals', 'Stories for Kids'],
  'Leisure': ['Animation & Manga', 'Automotive', 'Aviation', 'Crafts', 'Games', 'Hobbies', 'Home & Garden', 'Video Games'],
  'Music': ['Music Commentary', 'Music History', 'Music Interviews'],
  'News': ['Business News', 'Daily News', 'Entertainment News', 'News Commentary', 'Politics', 'Sports News', 'Tech News'],
  'Religion & Spirituality': ['Buddhism', 'Christianity', 'Hinduism', 'Islam', 'Judaism', 'Religion', 'Spirituality'],
  'Science': ['Astronomy', 'Chemistry', 'Earth Sciences', 'Life Sciences', 'Mathematics', 'Natural Sciences', 'Nature', 'Physics', 'Social Sciences'],
  'Society & Culture': ['Documentary', 'Personal Journals', 'Philosophy', 'Places & Travel', 'Relationships'],
  'Sports': ['Baseball', 'Basketball', 'Cricket', 'Fantasy Sports', 'Football', 'Golf', 'Hockey', 'Rugby', 'Running', 'Soccer', 'Swimming', 'Tennis', 'Volleyball', 'Wilderness', 'Wrestling'],
  'Technology': [],
  'True Crime': [],
  'TV & Film': ['After Shows', 'Film History', 'Film Interviews', 'Film Reviews', 'TV Reviews'],
};
