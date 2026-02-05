import { NextRequest, NextResponse } from 'next/server';
import { kvStorage } from '@/lib/kv-storage';
import { postTweet } from '@/lib/twitter-oauth';

export const runtime = 'nodejs';

/**
 * POST /api/automation/test-post
 * Test posting to a specific level 2 platform
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { platformId?: string; level?: number };
    const { platformId, level } = body;

    if (!platformId || !level) {
      return NextResponse.json(
        { error: 'Missing platformId or level' },
        { status: 400 }
      );
    }

    if (level !== 2) {
      return NextResponse.json(
        { error: 'Only level 2 platforms supported for test posting' },
        { status: 400 }
      );
    }

    // Get credentials from KV
    const config = await kvStorage.getLevel2Config();
    const platformConfig = config[platformId];

    if (!platformConfig?.credentials) {
      return NextResponse.json(
        { error: 'Platform not configured' },
        { status: 400 }
      );
    }

    if (!platformConfig.validated) {
      return NextResponse.json(
        { error: 'Platform credentials not validated' },
        { status: 400 }
      );
    }

    if (!platformConfig.enabled) {
      return NextResponse.json(
        { error: 'Platform is disabled' },
        { status: 400 }
      );
    }

    // Test post content
    const testContent = {
      message: `🧪 Test post from V2U automation system\n\nTimestamp: ${new Date().toISOString()}\n\n#TestPost #V2U`,
      timestamp: new Date().toISOString()
    };

    let result;

    // Route to appropriate platform handler
    switch (platformId) {
      case 'linkedin':
        result = await testLinkedInPost(platformConfig.credentials, testContent);
        break;
      
      case 'facebook':
      case 'facebook-ainow':
        result = await testFacebookPost(platformConfig.credentials, testContent);
        break;
      
      case 'twitter':
      case 'twitter-ainow':
        result = await testTwitterPost(platformConfig.credentials, testContent);
        break;
      
      case 'instagram':
        return NextResponse.json(
          { error: 'Instagram requires media content (images/videos) and cannot be tested with text-only posts' },
          { status: 400 }
        );
      
      case 'threads':
        result = await testThreadsPost(platformConfig.credentials, testContent);
        break;
      
      case 'tiktok':
        result = await testTikTokPost(platformConfig.credentials, testContent);
        break;
      
      case 'odysee':
        result = await testOdyseePost(platformConfig.credentials, testContent);
        break;
      
      case 'vimeo':
        result = await testVimeoPost(platformConfig.credentials, testContent);
        break;
      
      default:
        return NextResponse.json(
          { error: `Platform ${platformId} not supported` },
          { status: 400 }
        );
    }

    // Store test result in KV (optional - remove if method doesn't exist)
    // await kvStorage.saveTestResult(platformId, result);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Successfully posted to ${platformId}`,
        postId: 'postId' in result ? result.postId : undefined,
        postUrl: 'postUrl' in result ? result.postUrl : undefined
      });
    } else {
      return NextResponse.json(
        { 
          success: false,
          error: 'error' in result ? result.error : 'Failed to post',
          details: 'details' in result ? result.details : undefined
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Test post error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to test post',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Test LinkedIn posting
 */
async function testLinkedInPost(credentials: Record<string, unknown>, content: { message: string }) {
  try {
    const { accessToken, personUrn, organizationUrn } = credentials;

    if (!accessToken) {
      return { success: false, error: 'Missing access token' };
    }

    // Use organizationUrn if present, otherwise personUrn
    let authorUrn = (organizationUrn as string) || (personUrn as string);
    
    if (!authorUrn) {
      return { success: false, error: 'Missing personUrn or organizationUrn' };
    }
    
    // Ensure authorUrn has correct format - but DON'T modify if already has urn:li: prefix
    if (!authorUrn.startsWith('urn:li:')) {
      // Only add person prefix if this is a person URN (not organization)
      if (!organizationUrn) {
        authorUrn = `urn:li:person:${authorUrn}`;
      }
    }

    // LinkedIn API v2 - Create a share
    const shareData = {
      author: authorUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: content.message
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };

    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify(shareData)
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      let errorDetails = responseText;
      let helpMessage = '';
      
      try {
        const errorData = JSON.parse(responseText);
        errorDetails = errorData.message || JSON.stringify(errorData);
        
        // Add helpful messages for common errors
        if (response.status === 401 || response.status === 403) {
          if (errorData.serviceErrorCode === 65 || errorData.serviceErrorCode === 100) {
            helpMessage = ' → LinkedIn token expired or lacks permissions. Re-authorize at /api/linkedin/auth';
          } else {
            helpMessage = ' → LinkedIn authorization issue. Check token validity and scopes.';
          }
        }
      } catch {
        // Keep original text
      }

      return {
        success: false,
        error: `LinkedIn API error: ${response.status} ${response.statusText}${helpMessage}`,
        details: errorDetails
      };
    }

    const result = JSON.parse(responseText);
    const postId = result.id || 'unknown';

    return {
      success: true,
      postId,
      postUrl: `https://www.linkedin.com/feed/update/${postId}`,
      platform: 'linkedin'
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined
    };
  }
}

/**
 * Test Facebook posting
 */
async function testFacebookPost(credentials: Record<string, unknown>, content: { message: string }) {
  try {
    const { pageAccessToken, pageId } = credentials;

    if (!pageAccessToken || !pageId) {
      return { success: false, error: 'Missing page access token or page ID' };
    }

    // Facebook Graph API - Post to page
    const response = await fetch(`https://graph.facebook.com/v18.0/${pageId}/feed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: content.message,
        access_token: pageAccessToken
      })
    });

    const result = await response.json() as { 
      id?: string; 
      error?: { message?: string } 
    };

    if (!response.ok || result.error) {
      return {
        success: false,
        error: result.error?.message || 'Facebook API error',
        details: JSON.stringify(result.error || result)
      };
    }

    return {
      success: true,
      postId: result.id,
      postUrl: `https://www.facebook.com/${result.id}`,
      platform: 'facebook'
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined
    };
  }
}

/**
 * Test Twitter posting
 */
async function testTwitterPost(credentials: Record<string, unknown>, content: { message: string }) {
  try {
    const { appKey, appSecret, accessToken, accessSecret } = credentials as {
      appKey?: string;
      appSecret?: string;
      accessToken?: string;
      accessSecret?: string;
    };

    if (!appKey || !appSecret || !accessToken || !accessSecret) {
      return { success: false, error: 'Missing Twitter credentials' };
    }

    // Truncate to 280 characters
    const tweetText = content.message.length > 280 
      ? content.message.substring(0, 277) + '...' 
      : content.message;

    const result = await postTweet(
      tweetText,
      appKey,
      appSecret,
      accessToken,
      accessSecret
    );

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Failed to post tweet'
      };
    }

    return {
      success: true,
      postId: result.tweetId,
      postUrl: result.tweetId ? `https://twitter.com/i/web/status/${result.tweetId}` : undefined,
      platform: 'twitter'
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined
    };
  }
}

/**
 * Test Threads posting
 */
async function testThreadsPost(credentials: Record<string, unknown>, content: { message: string }) {
  try {
    const { accessToken } = credentials;

    if (!accessToken) {
      return { success: false, error: 'Missing Threads access token' };
    }

    // Get user ID
    const userResponse = await fetch(`https://graph.threads.net/v1.0/me?fields=id&access_token=${accessToken}`);
    
    if (!userResponse.ok) {
      return { success: false, error: 'Failed to get Threads user ID' };
    }

    const userData = await userResponse.json() as { id?: string };
    const userId = userData.id;

    // Create thread
    const response = await fetch(`https://graph.threads.net/v1.0/${userId}/threads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        media_type: 'TEXT',
        text: content.message,
        access_token: accessToken
      })
    });

    const result = await response.json() as { id?: string; error?: { message?: string } };

    if (!response.ok || result.error) {
      return {
        success: false,
        error: result.error?.message || 'Threads API error',
        details: JSON.stringify(result.error || result)
      };
    }

    const mediaId = result.id;

    // Publish thread
    const publishResponse = await fetch(`https://graph.threads.net/v1.0/${userId}/threads_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: mediaId,
        access_token: accessToken
      })
    });

    const publishResult = await publishResponse.json() as { id?: string; error?: { message?: string } };

    if (!publishResponse.ok || publishResult.error) {
      return {
        success: false,
        error: publishResult.error?.message || 'Failed to publish thread'
      };
    }

    return {
      success: true,
      postId: publishResult.id,
      postUrl: `https://www.threads.net/@username/post/${publishResult.id}`,
      platform: 'threads'
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined
    };
  }
}

/**
 * Test TikTok posting
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function testTikTokPost(credentials: Record<string, unknown>, _content: { message: string }) {
  return {
    success: false,
    error: '⚠️ Manual posting required - TikTok does not support automated text posts.',
    platform: 'tiktok'
  };
}

/**
 * Test Odysee posting
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function testOdyseePost(credentials: Record<string, unknown>, _content: { message: string }) {
  return {
    success: false,
    error: '⚠️ Manual posting required - Odysee requires LBRY SDK or manual posting.',
    platform: 'odysee'
  };
}

/**
 * Test Vimeo posting
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function testVimeoPost(credentials: Record<string, unknown>, _content: { message: string }) {
  return {
    success: false,
    error: '⚠️ Manual posting required - Vimeo requires video content, not text posts.',
    platform: 'vimeo'
  };
}
