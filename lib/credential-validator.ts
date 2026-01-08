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
  accessToken: string,
  organizationUrn?: string
): Promise<ValidationResult & { personUrn?: string; organizationUrn?: string; organizations?: Array<{ id: string; name: string }> }> {
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

    console.log('LinkedIn token format validation passed, testing token...');
    
    // Test the token by trying to fetch the user's profile
    // Use /v2/me endpoint which works with w_member_social permission
    const response = await fetch('https://api.linkedin.com/v2/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });

    console.log('LinkedIn /v2/me API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('LinkedIn /v2/me API error:', errorText);
      return { 
        valid: false, 
        error: `LinkedIn API error: ${errorText}` 
      };
    }

    const meData = await response.json() as { id?: string };
    console.log('LinkedIn /v2/me response:', { hasId: !!meData.id });

    if (!meData.id) {
      return { 
        valid: false, 
        error: 'Could not retrieve profile from LinkedIn API.' 
      };
    }

    // Use the ID as personUrn
    const personUrn = meData.id;
    console.log('✅ LinkedIn validation successful, personUrn:', personUrn);
    
    // If organizationUrn is provided, validate it by fetching organization info
    const validatedOrgUrn = organizationUrn;
    const organizations: Array<{ id: string; name: string }> = [];
    
    if (organizationUrn) {
      try {
        // Extract organization ID from URN (format: urn:li:organization:108130024)
        const orgIdMatch = organizationUrn.match(/urn:li:organization:(\d+)/);
        if (!orgIdMatch) {
          console.warn('⚠️ Invalid organizationUrn format:', organizationUrn);
          return {
            valid: false,
            error: 'Invalid organizationUrn format. Expected format: urn:li:organization:XXXXXXX'
          };
        }
        
        const orgId = orgIdMatch[1];
        console.log('[LinkedIn] Validating organization ID:', orgId);
        
        // Validate organization access
        const orgResponse = await fetch(`https://api.linkedin.com/v2/organizations/${orgId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0'
          }
        });
        
        if (!orgResponse.ok) {
          const errorText = await orgResponse.text();
          console.error('[LinkedIn] Organization validation failed:', errorText);
          return {
            valid: false,
            error: `Cannot access organization ${orgId}. Make sure your access token has w_organization_social permission and you are an admin of this company page.`
          };
        }
        
        const orgData = await orgResponse.json() as { localizedName?: string };
        console.log('[LinkedIn] ✅ Organization validated:', orgData.localizedName);
        
        organizations.push({
          id: orgId,
          name: orgData.localizedName || `Organization ${orgId}`
        });
      } catch (error) {
        console.error('[LinkedIn] Exception validating organization:', error);
        return {
          valid: false,
          error: `Failed to validate organization: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }
    }
    
    return { 
      valid: true,
      personUrn: personUrn,
      organizationUrn: validatedOrgUrn,
      organizations: organizations.length > 0 ? organizations : undefined,
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
 * Validate Instagram credentials and fetch user ID
 * Instagram Business Accounts use Facebook Graph API with Page Access Token
 */
export async function validateInstagramCredentials(
  accessToken: string,
  userId?: string
): Promise<ValidationResult & { userId?: string; username?: string }> {
  try {
    console.log('[Instagram] Starting validation');
    console.log('[Instagram] Has access token:', !!accessToken, 'Length:', accessToken?.length || 0);
    console.log('[Instagram] Has userId:', !!userId, 'Value:', userId);

    if (!accessToken) {
      return { valid: false, error: 'Missing Instagram access token' };
    }

    // Validate token format
    if (accessToken.length < 50) {
      return { valid: false, error: 'Access token too short - does not appear to be valid' };
    }

    console.log('[Instagram] Token format validated, fetching user info...');

    // If userId is provided, use it directly (Instagram Business Account ID)
    // Otherwise try to fetch from graph.instagram.com (for User Access Tokens)
    let instagramUserId = userId;
    let username: string | undefined;

    if (instagramUserId) {
      // Use Facebook Graph API with Instagram Business Account ID
      console.log('[Instagram] Using provided userId, fetching via Facebook Graph API');
      const userResponse = await fetch(
        `https://graph.facebook.com/v21.0/${instagramUserId}?fields=id,username,name&access_token=${accessToken}`
      );

      console.log('[Instagram] User info API response status:', userResponse.status);

      if (!userResponse.ok) {
        const errorText = await userResponse.text();
        console.error('[Instagram] User info API error:', errorText);
        
        try {
          const errorData = JSON.parse(errorText) as { error?: { message?: string; code?: number; type?: string } };
          const errorMsg = errorData.error?.message || errorText;
          
          return {
            valid: false,
            error: `Failed to validate Instagram account: ${errorMsg}`
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
      };

      console.log('[Instagram] User data received:', { 
        hasId: !!userData.id, 
        hasUsername: !!userData.username,
        username: userData.username,
        name: userData.name
      });

      username = userData.username;
    } else {
      // Try graph.instagram.com for User Access Tokens (fallback)
      console.log('[Instagram] No userId provided, trying graph.instagram.com endpoint');
      const userResponse = await fetch(
        `https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`
      );

      console.log('[Instagram] User info API response status:', userResponse.status);

      if (!userResponse.ok) {
        const errorText = await userResponse.text();
        console.error('[Instagram] User info API error:', errorText);
        
        try {
          const errorData = JSON.parse(errorText) as { error?: { message?: string; code?: number; type?: string } };
          const errorMsg = errorData.error?.message || errorText;
          
          return {
            valid: false,
            error: `Invalid or expired access token: ${errorMsg}. For Instagram Business Accounts, please provide the Instagram Business Account ID.`
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
      };

      console.log('[Instagram] User data received:', { 
        hasId: !!userData.id, 
        hasUsername: !!userData.username,
        username: userData.username
      });

      instagramUserId = userData.id;
      username = userData.username;
    }

    if (!instagramUserId) {
      return {
        valid: false,
        error: 'Could not retrieve user ID from Instagram API. The response is missing the "id" field.'
      };
    }

    console.log('[Instagram] ✅ Validation successful');
    console.log('[Instagram] User ID:', instagramUserId);
    console.log('[Instagram] Username:', username);

    return {
      valid: true,
      userId: instagramUserId,
      username: username,
      error: undefined
    };

  } catch (error) {
    console.error('[Instagram] Validation exception:', error);
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
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

/**
 * Validate Bluesky credentials
 * Tests authentication with username and app password
 */
export async function validateBlueskyCredentials(
  username: string,
  appPassword: string
): Promise<ValidationResult & { did?: string; handle?: string }> {
  try {
    console.log('[Bluesky] Validating credentials for:', username);

    if (!username || !appPassword) {
      return { valid: false, error: 'Missing required credentials' };
    }

    // Validate username format (should be handle like "user.bsky.social" or email)
    const isHandle = username.includes('.');
    const isEmail = username.includes('@');
    
    if (!isHandle && !isEmail) {
      return {
        valid: false,
        error: 'Username must be a Bluesky handle (e.g., "ainow.bsky.social") or email address'
      };
    }

    // Attempt to create session
    const response = await fetch('https://bsky.social/xrpc/com.atproto.server.createSession', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: username,
        password: appPassword,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Bluesky] Authentication failed:', response.status, errorText);

      // Parse error message
      let errorMsg = 'Authentication failed';
      try {
        const errorData = JSON.parse(errorText) as { error?: string; message?: string };
        errorMsg = errorData.message || errorData.error || errorMsg;
      } catch {
        // Use raw error text if not JSON
        errorMsg = errorText || `HTTP ${response.status}`;
      }

      // Provide helpful error messages
      if (response.status === 401) {
        return {
          valid: false,
          error: 'Invalid credentials. Make sure you are using an App Password (not your main account password). Generate one in Bluesky app → Settings → App Passwords.'
        };
      }

      return {
        valid: false,
        error: `Authentication failed: ${errorMsg}`
      };
    }

    const session = await response.json() as {
      accessJwt: string;
      refreshJwt: string;
      handle: string;
      did: string;
      email?: string;
    };

    console.log('[Bluesky] ✅ Validation successful');
    console.log('[Bluesky] Handle:', session.handle);
    console.log('[Bluesky] DID:', session.did);

    return {
      valid: true,
      did: session.did,
      handle: session.handle,
      error: undefined
    };

  } catch (error) {
    console.error('[Bluesky] Validation exception:', error);
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
