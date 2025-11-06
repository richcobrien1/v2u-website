/**
 * Social Platform Integrations
 * Central export for all Level 2 posting platforms
 */

export { postToTwitter } from './twitter';
export { postToFacebook } from './facebook';
export { postToLinkedIn } from './linkedin';
export { postToInstagram } from './instagram';
export { postToThreads } from './threads';
export { postToTikTok } from './tiktok';

export interface PostContent {
  platform: string;
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
}

export interface PostResult {
  success: boolean;
  postId?: string;
  url?: string;
  error?: string;
}
