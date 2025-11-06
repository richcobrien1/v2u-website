/**
 * Twitter/X API Integration
 * Uses OAuth 1.0a for posting
 */

import crypto from 'crypto';

interface TwitterCredentials {
  appKey: string;
  appSecret: string;
  accessToken: string;
  accessSecret: string;
}

interface PostContent {
  platform: string;
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
}

/**
 * Generate OAuth 1.0a signature
 */
function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string
): string {
  // Sort parameters
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');

  // Create signature base string
  const signatureBase = [
    method.toUpperCase(),
    encodeURIComponent(url),
    encodeURIComponent(sortedParams)
  ].join('&');

  // Create signing key
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;

  // Generate signature
  const signature = crypto
    .createHmac('sha1', signingKey)
    .update(signatureBase)
    .digest('base64');

  return signature;
}

/**
 * Post to Twitter/X
 */
export async function postToTwitter(
  credentials: TwitterCredentials,
  content: PostContent
): Promise<{ success: boolean; postId?: string; url?: string; error?: string }> {
  try {
    const { appKey, appSecret, accessToken, accessSecret } = credentials;

    // Validate credentials
    if (!appKey || !appSecret || !accessToken || !accessSecret) {
      return { success: false, error: 'Missing Twitter credentials' };
    }

    // Generate post message
    const emoji = content.platform === 'youtube' ? '🎥' : content.platform === 'spotify' ? '🎙️' : '📹';
    const platformName = content.platform === 'youtube' ? 'YouTube' : 
                        content.platform === 'spotify' ? 'Spotify' : 
                        'Rumble';
    
    let message = `${emoji} New on ${platformName}: ${content.title}\n\n`;
    
    // Add description (Twitter has ~280 char limit)
    const maxDescLength = 150;
    if (content.description.length > maxDescLength) {
      message += content.description.substring(0, maxDescLength) + '...\n\n';
    } else {
      message += content.description + '\n\n';
    }
    
    message += `🔗 ${content.url}\n\n#AINow #AI #Technology`;

    // Twitter API v2 endpoint
    const apiUrl = 'https://api.twitter.com/2/tweets';

    // OAuth 1.0a parameters
    const oauthParams: Record<string, string> = {
      oauth_consumer_key: appKey,
      oauth_token: accessToken,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_nonce: crypto.randomBytes(32).toString('base64'),
      oauth_version: '1.0'
    };

    // Generate signature
    const signature = generateOAuthSignature(
      'POST',
      apiUrl,
      oauthParams,
      appSecret,
      accessSecret
    );

    oauthParams.oauth_signature = signature;

    // Build Authorization header
    const authHeader = 'OAuth ' + Object.keys(oauthParams)
      .map(key => `${encodeURIComponent(key)}="${encodeURIComponent(oauthParams[key])}"`)
      .join(', ');

    // Post tweet
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: message
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Twitter API error:', errorData);
      return { 
        success: false, 
        error: `Twitter API error: ${response.status} - ${JSON.stringify(errorData)}` 
      };
    }

    const data = await response.json() as { data: { id: string } };
    const tweetId = data.data.id;

    return {
      success: true,
      postId: tweetId,
      url: `https://twitter.com/i/web/status/${tweetId}`
    };
  } catch (error) {
    console.error('Twitter posting error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
