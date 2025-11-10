/**
 * Bluesky (AT Protocol) Client
 * 
 * Simple authentication and posting for Bluesky social network.
 * Uses AT Protocol's REST API with JWT authentication.
 * 
 * Authentication: Username + App Password (no OAuth needed!)
 * Generate app password: Bluesky app → Settings → App Passwords
 */

interface BlueskySession {
  accessJwt: string;
  refreshJwt: string;
  handle: string;
  did: string;
  email?: string;
}

interface BlueskyPost {
  $type?: string;
  text: string;
  createdAt: string;
  langs?: string[];
  facets?: Array<{
    index: { byteStart: number; byteEnd: number };
    features: Array<{
      $type: string;
      uri?: string;
      did?: string;
    }>;
  }>;
  embed?: {
    $type: string;
    images?: Array<{
      alt: string;
      image: unknown;
      aspectRatio?: { width: number; height: number };
    }>;
    external?: {
      uri: string;
      title: string;
      description: string;
      thumb?: unknown;
    };
  };
  reply?: {
    root: { uri: string; cid: string };
    parent: { uri: string; cid: string };
  };
}

const BLUESKY_PDS_URL = 'https://bsky.social';

/**
 * Create session (login) with username and app password
 */
export async function createBlueskySession(
  identifier: string,
  password: string
): Promise<BlueskySession> {
  console.log('[Bluesky] Creating session for:', identifier);

  const response = await fetch(`${BLUESKY_PDS_URL}/xrpc/com.atproto.server.createSession`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[Bluesky] Session creation failed:', error);
    throw new Error(`Failed to create Bluesky session: ${response.status} ${error}`);
  }

  const session = await response.json() as BlueskySession;
  console.log('[Bluesky] Session created for:', session.handle, '(DID:', session.did, ')');

  return session;
}

/**
 * Refresh session JWT when expired
 */
export async function refreshBlueskySession(refreshJwt: string): Promise<BlueskySession> {
  console.log('[Bluesky] Refreshing session');

  const response = await fetch(`${BLUESKY_PDS_URL}/xrpc/com.atproto.server.refreshSession`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${refreshJwt}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[Bluesky] Session refresh failed:', error);
    throw new Error(`Failed to refresh Bluesky session: ${response.status}`);
  }

  const session = await response.json() as BlueskySession;
  console.log('[Bluesky] Session refreshed for:', session.handle);

  return session;
}

/**
 * Parse URLs from text and create link facets
 * Facets are byte-indexed annotations for rich text
 */
function parseUrlFacets(text: string): Array<{
  index: { byteStart: number; byteEnd: number };
  features: Array<{ $type: string; uri: string }>;
}> {
  const facets: Array<{
    index: { byteStart: number; byteEnd: number };
    features: Array<{ $type: string; uri: string }>;
  }> = [];

  // URL regex from AT Protocol spec
  // Matches http(s) URLs, tweaked to disallow trailing punctuation
  const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*[-a-zA-Z0-9@%_+~#//=])?/g;
  
  const textBytes = Buffer.from(text, 'utf-8');
  let match;

  while ((match = urlRegex.exec(text)) !== null) {
    const url = match[0];
    
    // Calculate byte positions (not character positions!)
    const beforeText = text.substring(0, match.index);
    const byteStart = Buffer.from(beforeText, 'utf-8').length;
    const byteEnd = byteStart + Buffer.from(url, 'utf-8').length;

    facets.push({
      index: { byteStart, byteEnd },
      features: [{
        $type: 'app.bsky.richtext.facet#link',
        uri: url,
      }],
    });
  }

  console.log(`[Bluesky] Parsed ${facets.length} URL(s) from text`);
  return facets;
}

/**
 * Parse mentions from text and create mention facets
 * Mentions are @handles that link to user profiles
 */
async function parseMentionFacets(
  text: string,
  accessJwt: string
): Promise<Array<{
  index: { byteStart: number; byteEnd: number };
  features: Array<{ $type: string; did: string }>;
}>> {
  const facets: Array<{
    index: { byteStart: number; byteEnd: number };
    features: Array<{ $type: string; did: string }>;
  }> = [];

  // Mention regex from AT Protocol spec
  const mentionRegex = /[$|\W](@([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)/g;
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    const mention = match[1]; // Includes the @
    const handle = mention.substring(1); // Remove @

    // Resolve handle to DID
    try {
      const response = await fetch(
        `${BLUESKY_PDS_URL}/xrpc/com.atproto.identity.resolveHandle?handle=${encodeURIComponent(handle)}`,
        {
          headers: { 'Authorization': `Bearer ${accessJwt}` },
        }
      );

      if (!response.ok) {
        console.warn(`[Bluesky] Could not resolve handle @${handle}, skipping mention`);
        continue;
      }

      const { did } = await response.json() as { did: string };

      // Calculate byte positions
      const beforeText = text.substring(0, match.index + 1); // +1 to include the character before @
      const byteStart = Buffer.from(beforeText, 'utf-8').length;
      const byteEnd = byteStart + Buffer.from(mention, 'utf-8').length;

      facets.push({
        index: { byteStart, byteEnd },
        features: [{
          $type: 'app.bsky.richtext.facet#mention',
          did,
        }],
      });

      console.log(`[Bluesky] Resolved mention @${handle} → ${did}`);
    } catch (error) {
      console.warn(`[Bluesky] Error resolving @${handle}:`, error);
    }
  }

  return facets;
}

/**
 * Create a post on Bluesky
 */
export async function createBlueskyPost(
  session: BlueskySession,
  text: string,
  options?: {
    langs?: string[];
    parseLinks?: boolean;
    parseMentions?: boolean;
  }
): Promise<{ uri: string; cid: string }> {
  console.log('[Bluesky] Creating post');
  console.log('[Bluesky] Text length:', text.length, 'chars');

  // Bluesky has a 300 character limit (grapheme clusters, not bytes)
  if (text.length > 300) {
    console.warn('[Bluesky] Post exceeds 300 characters, truncating');
    text = text.substring(0, 297) + '...';
  }

  // Build post record
  const post: BlueskyPost = {
    $type: 'app.bsky.feed.post',
    text,
    createdAt: new Date().toISOString(),
  };

  // Add language tags if provided
  if (options?.langs) {
    post.langs = options.langs;
  }

  // Parse and add facets (links and mentions)
  const facets: BlueskyPost['facets'] = [];

  if (options?.parseLinks !== false) {
    const linkFacets = parseUrlFacets(text);
    facets.push(...linkFacets);
  }

  if (options?.parseMentions) {
    const mentionFacets = await parseMentionFacets(text, session.accessJwt);
    facets.push(...mentionFacets);
  }

  if (facets.length > 0) {
    post.facets = facets;
  }

  // Create the post record
  const response = await fetch(`${BLUESKY_PDS_URL}/xrpc/com.atproto.repo.createRecord`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.accessJwt}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      repo: session.did,
      collection: 'app.bsky.feed.post',
      record: post,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[Bluesky] Post creation failed:', error);
    throw new Error(`Failed to create Bluesky post: ${response.status} ${error}`);
  }

  const result = await response.json() as { uri: string; cid: string };
  console.log('[Bluesky] ✅ Post created:', result.uri);

  // Construct web URL for the post
  const postUrl = `https://bsky.app/profile/${session.handle}/post/${result.uri.split('/').pop()}`;
  console.log('[Bluesky] Post URL:', postUrl);

  return result;
}

/**
 * Upload image to Bluesky
 * Returns blob reference to use in post embeds
 */
export async function uploadBlueskyImage(
  session: BlueskySession,
  imageBuffer: Buffer,
  mimeType: string
): Promise<{
  $type: 'blob';
  ref: { $link: string };
  mimeType: string;
  size: number;
}> {
  console.log('[Bluesky] Uploading image');
  console.log('[Bluesky] Size:', imageBuffer.length, 'bytes');
  console.log('[Bluesky] MIME type:', mimeType);

  // Bluesky image size limit: 1,000,000 bytes
  if (imageBuffer.length > 1000000) {
    throw new Error(`Image too large: ${imageBuffer.length} bytes (max 1,000,000)`);
  }

  const response = await fetch(`${BLUESKY_PDS_URL}/xrpc/com.atproto.repo.uploadBlob`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.accessJwt}`,
      'Content-Type': mimeType,
    },
    body: imageBuffer as unknown as BodyInit,
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[Bluesky] Image upload failed:', error);
    throw new Error(`Failed to upload Bluesky image: ${response.status}`);
  }

  const result = await response.json() as {
    blob: {
      $type: 'blob';
      ref: { $link: string };
      mimeType: string;
      size: number;
    };
  };

  console.log('[Bluesky] ✅ Image uploaded:', result.blob.ref.$link);

  return result.blob;
}

/**
 * Post with credentials (creates session automatically)
 * Convenience function for one-off posting
 */
export async function postToBluesky(
  username: string,
  appPassword: string,
  text: string,
  options?: {
    langs?: string[];
    parseLinks?: boolean;
    parseMentions?: boolean;
  }
): Promise<{ success: boolean; postUrl?: string; error?: string }> {
  try {
    // Create session
    const session = await createBlueskySession(username, appPassword);

    // Create post
    const result = await createBlueskyPost(session, text, options);

    // Construct web URL
    const postUrl = `https://bsky.app/profile/${session.handle}/post/${result.uri.split('/').pop()}`;

    return {
      success: true,
      postUrl,
    };
  } catch (error) {
    console.error('[Bluesky] Post failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
