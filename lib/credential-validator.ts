/**
 * Credential Validator
 * Tests if platform credentials are valid by making lightweight API calls
 */

interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate Twitter/X credentials
 */
export async function validateTwitterCredentials(
  appKey: string,
  appSecret: string,
  accessToken: string,
  accessSecret: string
): Promise<ValidationResult> {
  try {
    // Twitter OAuth 1.0a requires signature - just check if all fields are present
    // A real validation would require making an authenticated API call
    if (!appKey || !appSecret || !accessToken || !accessSecret) {
      return { valid: false, error: 'Missing required credentials' };
    }
    
    // Basic format validation
    if (appKey.length < 10 || accessToken.length < 20) {
      return { valid: false, error: 'Invalid credential format' };
    }
    
    // For now, we'll trust that if all fields are present and reasonable length, they might be valid
    // TODO: Implement actual Twitter API verification call
    return { valid: true };
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Validate Facebook credentials and exchange for long-lived page token
 */
export async function validateFacebookCredentials(
  pageId: string,
  pageAccessToken: string,
  appId?: string,
  appSecret?: string
): Promise<ValidationResult & { longLivedToken?: string; expiresAt?: string }> {
  try {
    if (!pageId || !pageAccessToken) {
      return { valid: false, error: 'Missing required credentials' };
    }

    // Validate Page ID format (should be numeric)
    if (!/^\d+$/.test(pageId)) {
      return { valid: false, error: 'Page ID must be numeric' };
    }

    // Validate access token format (should start with specific patterns)
    if (pageAccessToken.length < 50) {
      return { valid: false, error: 'Access token too short' };
    }

    console.log('[Facebook] Starting validation for page:', pageId);

    // Step 1: Verify the token works
    const verifyResponse = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}?fields=id,name&access_token=${pageAccessToken}`
    );

    if (!verifyResponse.ok) {
      const error = await verifyResponse.json() as { error?: { message?: string; code?: number } };
      const message = error.error?.message || 'Invalid credentials';
      
      // Provide helpful context for common errors
      if (message.includes('decrypt') || message.includes('expired')) {
        return {
          valid: false,
          error: `Facebook token error: ${message}\n\nThis usually means:\n• Token is expired or invalid\n• Token was generated for a different Facebook app\n• Token format is incorrect\n\nPlease generate a new Page Access Token in Facebook Business Suite.`
        };
      }
      
      return { 
        valid: false, 
        error: message
      };
    }

    const pageInfo = await verifyResponse.json() as { id?: string; name?: string };
    console.log('[Facebook] ✅ Token verified for page:', pageInfo.name);

    // Step 2: Check if this is a user token or page token by inspecting it
    const debugResponse = await fetch(
      `https://graph.facebook.com/v18.0/debug_token?input_token=${pageAccessToken}&access_token=${pageAccessToken}`
    );

    let isPageToken = false;
    let expiresAt: string | undefined;

    if (debugResponse.ok) {
      const debugData = await debugResponse.json() as { 
        data?: { 
          type?: string; 
          expires_at?: number;
          data_access_expires_at?: number;
        } 
      };
      isPageToken = debugData.data?.type === 'PAGE';
      const expiresTimestamp = debugData.data?.expires_at || debugData.data?.data_access_expires_at;
      
      if (expiresTimestamp && expiresTimestamp > 0) {
        expiresAt = new Date(expiresTimestamp * 1000).toISOString();
        console.log('[Facebook] Token expires at:', expiresAt);
      } else {
        console.log('[Facebook] Token is non-expiring (long-lived page token)');
        expiresAt = 'never';
      }

      console.log('[Facebook] Token type:', debugData.data?.type, 'isPageToken:', isPageToken);
    }

    // Step 3: If we have app credentials and this is a user token, exchange for long-lived token
    if (appId && appSecret && !isPageToken) {
      console.log('[Facebook] Exchanging user token for long-lived token...');

      try {
        // Exchange short-lived user token for long-lived user token (60 days)
        const exchangeResponse = await fetch(
          `https://graph.facebook.com/v18.0/oauth/access_token?` +
          `grant_type=fb_exchange_token&` +
          `client_id=${appId}&` +
          `client_secret=${appSecret}&` +
          `fb_exchange_token=${pageAccessToken}`
        );

        if (exchangeResponse.ok) {
          const exchangeData = await exchangeResponse.json() as { access_token?: string; expires_in?: number };
          const longLivedUserToken = exchangeData.access_token;
          
          if (!longLivedUserToken) {
            return {
              valid: true,
              error: '⚠️ Could not exchange for long-lived token. Using provided token (may expire soon).'
            };
          }

          console.log('[Facebook] ✅ Got long-lived user token (60 days), expires in:', exchangeData.expires_in, 'seconds');

          // Step 4: Get long-lived page token from long-lived user token
          const pageTokenResponse = await fetch(
            `https://graph.facebook.com/v18.0/${pageId}?fields=access_token&access_token=${longLivedUserToken}`
          );

          if (pageTokenResponse.ok) {
            const pageTokenData = await pageTokenResponse.json() as { access_token?: string };
            const longLivedPageToken = pageTokenData.access_token;

            if (longLivedPageToken) {
              console.log('[Facebook] ✅ Got long-lived PAGE token (never expires)');
              
              return {
                valid: true,
                longLivedToken: longLivedPageToken,
                expiresAt: 'never'
              };
            }
          }
        }
      } catch (exchangeError) {
        console.error('[Facebook] Token exchange failed:', exchangeError);
        return {
          valid: true,
          error: '⚠️ Token exchange failed. Using provided token (may expire soon). Error: ' + 
                 (exchangeError instanceof Error ? exchangeError.message : 'Unknown error')
        };
      }
    }

    // Return as-is if it's already a page token or we don't have app credentials
    return { 
      valid: true,
      longLivedToken: isPageToken ? pageAccessToken : undefined,
      expiresAt: expiresAt
    };

  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Validate LinkedIn credentials and fetch personUrn
 */
export async function validateLinkedInCredentials(
  clientId: string,
  clientSecret: string,
  accessToken: string
): Promise<ValidationResult & { personUrn?: string }> {
  try {
    console.log('LinkedIn validation - checking access token:', {
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      hasAccessToken: !!accessToken,
      tokenLength: accessToken?.length || 0
    });

    if (!accessToken) {
      return { valid: false, error: 'Missing access token' };
    }

    // LinkedIn tokens should be fairly long (typically 200+ characters)
    if (accessToken.length < 50) {
      return { valid: false, error: 'Access token too short - does not appear to be a valid LinkedIn token' };
    }

    // Basic format validation - LinkedIn tokens are alphanumeric with underscores and hyphens
    if (!/^[A-Za-z0-9_-]+$/.test(accessToken)) {
      return { valid: false, error: 'Invalid token format' };
    }

    console.log('LinkedIn token format validation passed, fetching personUrn...');
    
    // Fetch user info to get the personUrn (sub field)
    // This requires r_liteprofile or r_basicprofile permission
    const response = await fetch('https://api.linkedin.com/v2/userinfo', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('LinkedIn userinfo API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('LinkedIn userinfo API error:', errorText);
      
      // If we get 403, it means the token doesn't have r_liteprofile permission
      // In this case, we can't get the personUrn automatically
      if (response.status === 403) {
        return { 
          valid: false, 
          error: 'Access token lacks r_liteprofile permission. Please re-authorize with OpenID Connect scopes (openid, profile, email) to automatically fetch personUrn.' 
        };
      }
      
      return { 
        valid: false, 
        error: `Failed to fetch user info: ${response.status} ${errorText}` 
      };
    }

    const userInfo = await response.json() as { sub?: string; name?: string; email?: string };
    console.log('LinkedIn userinfo response:', { 
      hasSub: !!userInfo.sub, 
      name: userInfo.name,
      email: userInfo.email 
    });

    if (!userInfo.sub) {
      return { 
        valid: false, 
        error: 'Could not retrieve personUrn from LinkedIn API. The "sub" field is missing.' 
      };
    }

    // The "sub" field is the personUrn in format "urn:li:person:XXXXXXX"
    const personUrn = userInfo.sub;
    console.log('✅ LinkedIn validation successful, personUrn:', personUrn);
    
    return { 
      valid: true,
      personUrn: personUrn,
      error: undefined
    };
  } catch (error) {
    console.error('LinkedIn validation exception:', error);
    return { valid: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Validate YouTube credentials
 */
export async function validateYouTubeCredentials(
  apiKey: string,
  channelId: string
): Promise<ValidationResult> {
  try {
    if (!apiKey || !channelId) {
      return { valid: false, error: 'Missing required credentials' };
    }

    // Make a lightweight API call to verify
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${apiKey}`
    );

    if (!response.ok) {
      const error = await response.json() as { error?: { message?: string } };
      return { 
        valid: false, 
        error: error.error?.message || 'Invalid credentials'
      };
    }

    const data = await response.json() as { items?: unknown[] };
    if (!data.items || data.items.length === 0) {
      return { valid: false, error: 'Channel not found' };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Validate Spotify credentials
 */
export async function validateSpotifyCredentials(
  clientId: string,
  clientSecret: string,
  showId: string
): Promise<ValidationResult> {
  try {
    if (!clientId || !clientSecret) {
      return { valid: false, error: 'Missing client credentials' };
    }

    // Get access token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
      },
      body: 'grant_type=client_credentials'
    });

    if (!tokenResponse.ok) {
      return { valid: false, error: 'Invalid client credentials' };
    }

    const tokenData = await tokenResponse.json() as { access_token?: string };
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return { valid: false, error: 'No access token received' };
    }

    // If showId provided, verify it exists
    if (showId) {
      const showResponse = await fetch(
        `https://api.spotify.com/v1/shows/${showId}`,
        {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }
      );

      if (!showResponse.ok) {
        return { valid: false, error: 'Show not found' };
      }
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Validate RSS feed URL
 */
export async function validateRSSFeed(url: string): Promise<ValidationResult> {
  try {
    if (!url) {
      return { valid: false, error: 'Missing RSS feed URL' };
    }

    const response = await fetch(url);
    if (!response.ok) {
      return { valid: false, error: 'Cannot access RSS feed' };
    }

    const text = await response.text();
    
    // Check if it's valid XML/RSS
    if (!text.includes('<rss') && !text.includes('<feed')) {
      return { valid: false, error: 'Not a valid RSS/Atom feed' };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Validate Threads credentials and fetch user ID
 * Threads uses Meta's Graph API (similar to Instagram)
 */
export async function validateThreadsCredentials(
  accessToken: string
): Promise<ValidationResult & { userId?: string; username?: string }> {
  try {
    console.log('[Threads] Starting validation');
    console.log('[Threads] Has access token:', !!accessToken, 'Length:', accessToken?.length || 0);

    if (!accessToken) {
      return { valid: false, error: 'Missing Threads access token' };
    }

    // Validate token format
    if (accessToken.length < 50) {
      return { valid: false, error: 'Access token too short - does not appear to be valid' };
    }

    console.log('[Threads] Token format validated, fetching user info...');

    // Fetch user ID and username from Threads API
    // Threads uses graph.threads.net, not graph.facebook.com
    const userResponse = await fetch(
      `https://graph.threads.net/v1.0/me?fields=id,username,name,threads_profile_picture_url&access_token=${accessToken}`
    );

    console.log('[Threads] User info API response status:', userResponse.status);

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error('[Threads] User info API error:', errorText);
      
      // Try to parse error
      try {
        const errorData = JSON.parse(errorText) as { error?: { message?: string; code?: number; type?: string } };
        const errorMsg = errorData.error?.message || errorText;
        
        if (userResponse.status === 401 || userResponse.status === 403) {
          return {
            valid: false,
            error: `Invalid or expired access token: ${errorMsg}`
          };
        }
        
        return {
          valid: false,
          error: `Failed to fetch user info: ${errorMsg}`
        };
      } catch {
        return {
          valid: false,
          error: `Failed to fetch user info: ${userResponse.status} ${errorText}`
        };
      }
    }

    const userData = await userResponse.json() as { 
      id?: string; 
      username?: string;
      name?: string;
      threads_profile_picture_url?: string;
    };

    console.log('[Threads] User data received:', { 
      hasId: !!userData.id, 
      hasUsername: !!userData.username,
      username: userData.username,
      name: userData.name
    });

    if (!userData.id) {
      return {
        valid: false,
        error: 'Could not retrieve user ID from Threads API. The response is missing the "id" field.'
      };
    }

    console.log('[Threads] ✅ Validation successful');
    console.log('[Threads] User ID:', userData.id);
    console.log('[Threads] Username:', userData.username);

    return {
      valid: true,
      userId: userData.id,
      username: userData.username,
      error: undefined
    };

  } catch (error) {
    console.error('[Threads] Validation exception:', error);
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
