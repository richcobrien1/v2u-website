/**
 * Twitter OAuth 1.0a Signature Generation
 * Required for Twitter API v1.1 and v2 posting
 */

import crypto from 'crypto';

interface OAuthParams {
  oauth_consumer_key: string;
  oauth_token: string;
  oauth_signature_method: 'HMAC-SHA1';
  oauth_timestamp: string;
  oauth_nonce: string;
  oauth_version: '1.0';
}

/**
 * Generate OAuth 1.0a signature for Twitter API
 */
export function generateOAuthSignature(
  method: 'GET' | 'POST',
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string
): string {
  // Sort parameters
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${percentEncode(key)}=${percentEncode(params[key])}`)
    .join('&');

  // Create signature base string
  const signatureBaseString = [
    method.toUpperCase(),
    percentEncode(url),
    percentEncode(sortedParams)
  ].join('&');

  // Create signing key
  const signingKey = `${percentEncode(consumerSecret)}&${percentEncode(tokenSecret)}`;

  // Generate signature
  const signature = crypto
    .createHmac('sha1', signingKey)
    .update(signatureBaseString)
    .digest('base64');

  return signature;
}

/**
 * Build OAuth authorization header
 */
export function buildOAuthHeader(
  method: 'GET' | 'POST',
  url: string,
  consumerKey: string,
  consumerSecret: string,
  accessToken: string,
  accessSecret: string,
  additionalParams: Record<string, string> = {}
): string {
  // Generate OAuth parameters
  const oauthParams: OAuthParams = {
    oauth_consumer_key: consumerKey,
    oauth_token: accessToken,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_nonce: crypto.randomBytes(32).toString('base64').replace(/\W/g, ''),
    oauth_version: '1.0'
  };

  // Combine OAuth params with additional params for signature
  const allParams = { ...oauthParams, ...additionalParams };

  // Generate signature
  const signature = generateOAuthSignature(
    method,
    url,
    allParams,
    consumerSecret,
    accessSecret
  );

  // Build authorization header
  const authParams = {
    ...oauthParams,
    oauth_signature: signature
  };

  const authHeader = 'OAuth ' + Object.keys(authParams)
    .sort()
    .map(key => `${percentEncode(key)}="${percentEncode(authParams[key as keyof typeof authParams])}"`)
    .join(', ');

  return authHeader;
}

/**
 * Percent encode per RFC 3986
 */
function percentEncode(str: string): string {
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A');
}

/**
 * Post a tweet using OAuth 1.0a
 */
export async function postTweet(
  text: string,
  consumerKey: string,
  consumerSecret: string,
  accessToken: string,
  accessSecret: string
): Promise<{ success: boolean; tweetId?: string; error?: string }> {
  try {
    const url = 'https://api.twitter.com/2/tweets';
    const payload = { text };

    // Build OAuth header
    const authHeader = buildOAuthHeader(
      'POST',
      url,
      consumerKey,
      consumerSecret,
      accessToken,
      accessSecret
    );

    // Make request
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log('[Twitter OAuth] Response status:', response.status);
    const result = await response.json() as { 
      detail?: string; 
      error?: { message?: string }; 
      data?: { id?: string };
      errors?: Array<{ message?: string }>;
      title?: string;
    };
    console.log('[Twitter OAuth] Response body:', JSON.stringify(result));

    if (!response.ok) {
      const errorMsg = result.detail || result.title || result.error?.message || 
                      (result.errors && result.errors[0]?.message) || 
                      `HTTP ${response.status}`;
      console.error('[Twitter OAuth] Error:', errorMsg, result);
      return {
        success: false,
        error: errorMsg
      };
    }

    if (!result.data?.id) {
      console.error('[Twitter OAuth] No tweet ID in response:', result);
      return {
        success: false,
        error: 'No tweet ID returned'
      };
    }

    console.log('[Twitter OAuth] ✅ Tweet posted successfully, ID:', result.data.id);
    return {
      success: true,
      tweetId: result.data?.id
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
