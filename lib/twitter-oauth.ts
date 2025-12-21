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
): Promise<{ success: boolean; tweetId?: string; error?: string; debugInfo?: Record<string, unknown>; alreadyPosted?: boolean }> {
  const debugInfo: Record<string, unknown> = {};
  
  try {
    const url = 'https://api.twitter.com/2/tweets';
    const payload = { text };

    console.log('[Twitter OAuth] Starting post request');
    console.log('[Twitter OAuth] Tweet text:', text);
    console.log('[Twitter OAuth] Credentials present:', {
      hasConsumerKey: !!consumerKey,
      hasConsumerSecret: !!consumerSecret,
      hasAccessToken: !!accessToken,
      hasAccessSecret: !!accessSecret,
      consumerKeyLength: consumerKey?.length || 0,
      consumerSecretLength: consumerSecret?.length || 0,
      accessTokenLength: accessToken?.length || 0,
      accessSecretLength: accessSecret?.length || 0,
      consumerKeyPreview: consumerKey?.substring(0, 10) + '...',
      accessTokenPreview: accessToken?.substring(0, 10) + '...'
    });

    debugInfo.credentials = {
      consumerKeyLength: consumerKey?.length || 0,
      accessTokenLength: accessToken?.length || 0,
      consumerKeyPreview: consumerKey?.substring(0, 10) + '...',
      accessTokenPreview: accessToken?.substring(0, 10) + '...'
    };

    // Build OAuth header
    const authHeader = buildOAuthHeader(
      'POST',
      url,
      consumerKey,
      consumerSecret,
      accessToken,
      accessSecret
    );

    console.log('[Twitter OAuth] Authorization header (first 100 chars):', authHeader.substring(0, 100) + '...');
    debugInfo.authHeaderPreview = authHeader.substring(0, 100) + '...';

    // Make request
    console.log('[Twitter OAuth] Making POST request to:', url);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log('[Twitter OAuth] Response status:', response.status);
    console.log('[Twitter OAuth] Response headers:', Object.fromEntries(response.headers.entries()));
    
    debugInfo.responseStatus = response.status;
    debugInfo.responseHeaders = Object.fromEntries(response.headers.entries());

    // Get response body text first to handle both JSON and non-JSON responses
    const responseText = await response.text();
    console.log('[Twitter OAuth] Raw response body:', responseText);
    debugInfo.rawResponse = responseText;

    let result: { 
      detail?: string; 
      error?: { message?: string }; 
      data?: { id?: string };
      errors?: Array<{ message?: string; code?: number }>;
      title?: string;
      status?: number;
    };

    try {
      result = JSON.parse(responseText);
      console.log('[Twitter OAuth] Parsed JSON response:', JSON.stringify(result, null, 2));
      debugInfo.parsedResponse = result;
    } catch (parseError) {
      console.error('[Twitter OAuth] Failed to parse JSON response:', parseError);
      debugInfo.parseError = parseError instanceof Error ? parseError.message : 'Unknown parse error';
      return {
        success: false,
        error: `Invalid JSON response: ${responseText}`,
        debugInfo
      };
    }

    if (!response.ok) {
      const errorMsg = result.detail || result.title || result.error?.message || 
                      (result.errors && result.errors[0]?.message) || 
                      `HTTP ${response.status}`;
      
      console.error('[Twitter OAuth] ❌ Error Response:', {
        status: response.status,
        title: result.title,
        detail: result.detail,
        errors: result.errors,
        fullResponse: result
      });

      // Check for duplicate content (status 403)
      if (response.status === 403 && errorMsg.toLowerCase().includes('duplicate')) {
        console.log('[Twitter OAuth] ✅ Content already posted (duplicate detected)');
        debugInfo.duplicate = true;
        return {
          success: true, // Treat as success
          alreadyPosted: true,
          tweetId: 'duplicate',
          debugInfo
        };
      }

      // Check for specific OAuth errors
      if (response.status === 401) {
        console.error('[Twitter OAuth] 401 Unauthorized - Possible causes:');
        console.error('  1. OAuth signature mismatch (check timestamp, nonce, signature generation)');
        console.error('  2. Invalid consumer key or access token');
        console.error('  3. Tokens from different app than consumer key');
        console.error('  4. Tokens revoked or expired');
        console.error('  5. App permissions insufficient (need Read+Write)');
        
        debugInfo.possibleCauses = [
          'OAuth signature mismatch',
          'Invalid consumer key or access token',
          'Tokens from different app',
          'Tokens revoked or expired',
          'Insufficient app permissions (need Read+Write)'
        ];
      }

      return {
        success: false,
        error: errorMsg,
        debugInfo
      };
    }

    if (!result.data?.id) {
      console.error('[Twitter OAuth] No tweet ID in response:', result);
      debugInfo.error = 'No tweet ID in response';
      return {
        success: false,
        error: 'No tweet ID returned',
        debugInfo
      };
    }

    console.log('[Twitter OAuth] ✅ Tweet posted successfully, ID:', result.data.id);
    debugInfo.success = true;
    debugInfo.tweetId = result.data.id;
    
    return {
      success: true,
      tweetId: result.data?.id,
      debugInfo
    };

  } catch (error) {
    console.error('[Twitter OAuth] Exception:', error);
    debugInfo.exception = error instanceof Error ? error.message : 'Unknown error';
    debugInfo.stack = error instanceof Error ? error.stack : undefined;
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      debugInfo
    };
  }
}
