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
 * Validate Facebook credentials
 */
export async function validateFacebookCredentials(
  pageId: string,
  pageAccessToken: string
): Promise<ValidationResult> {
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

    // Make a lightweight API call to verify credentials
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}?fields=id,name&access_token=${pageAccessToken}`
    );

    if (!response.ok) {
      const error = await response.json() as { error?: { message?: string; code?: number } };
      const message = error.error?.message || 'Invalid credentials';
      
      // Provide helpful context for common errors
      if (message.includes('decrypt')) {
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

    return { valid: true };
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Validate LinkedIn credentials
 */
export async function validateLinkedInCredentials(
  clientId: string,
  clientSecret: string,
  accessToken: string
): Promise<ValidationResult> {
  try {
    if (!accessToken) {
      return { valid: false, error: 'Missing access token' };
    }

    // Make a lightweight API call to verify token
    const response = await fetch('https://api.linkedin.com/v2/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });

    if (!response.ok) {
      return { valid: false, error: 'Invalid or expired access token' };
    }

    return { valid: true };
  } catch (error) {
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
