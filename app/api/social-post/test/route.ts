import { NextRequest, NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';

export const runtime = 'nodejs';

/**
 * GET /api/social-post/test
 * Test social platform connection
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get('platform');

  if (!platform) {
    return NextResponse.json(
      { error: 'Platform parameter required' },
      { status: 400 }
    );
  }

  try {
    let result;

    switch (platform.toLowerCase()) {
      case 'twitter':
      case 'x':
        result = await testTwitter();
        break;

      case 'facebook':
        result = await testFacebook();
        break;

      case 'linkedin':
        result = await testLinkedIn();
        break;

      case 'threads':
        result = await testThreads();
        break;

      case 'instagram':
        result = await testInstagram();
        break;

      default:
        return NextResponse.json(
          { error: `Platform ${platform} not supported` },
          { status: 400 }
        );
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error(`${platform} test error:`, error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      platform
    });
  }
}

async function testTwitter() {
  const apiKey = process.env.TWITTER_API_KEY;
  const apiSecret = process.env.TWITTER_API_SECRET;
  const accessToken = process.env.TWITTER_ACCESS_TOKEN;
  const accessSecret = process.env.TWITTER_ACCESS_SECRET;

  if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
    return {
      success: false,
      error: 'Twitter credentials not configured. Required: TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET'
    };
  }

  try {
    const client = new TwitterApi({
      appKey: apiKey,
      appSecret: apiSecret,
      accessToken,
      accessSecret,
    });

    const user = await client.v2.me();

    return {
      success: true,
      platform: 'twitter',
      user: {
        id: user.data.id,
        username: user.data.username,
        name: user.data.name
      }
    };
  } catch (error) {
    throw new Error(`Twitter API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function testFacebook() {
  const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  const pageId = process.env.FACEBOOK_PAGE_ID;

  if (!accessToken || !pageId) {
    return {
      success: false,
      error: 'Facebook credentials not configured. Required: FACEBOOK_PAGE_ACCESS_TOKEN, FACEBOOK_PAGE_ID'
    };
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}?fields=name,id,category,fan_count&access_token=${accessToken}`
    );

    if (!response.ok) {
      const error = await response.json() as { error?: { message?: string } };
      throw new Error(error.error?.message || 'Facebook API error');
    }

    const data = await response.json() as { id: string; name: string; category: string; fan_count: number };

    return {
      success: true,
      platform: 'facebook',
      page: {
        id: data.id,
        name: data.name,
        category: data.category,
        followers: data.fan_count
      }
    };
  } catch (error) {
    throw new Error(`Facebook API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function testLinkedIn() {
  const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
  const personUrn = process.env.LINKEDIN_PERSON_URN;

  if (!accessToken || !personUrn) {
    return {
      success: false,
      error: 'LinkedIn credentials not configured. Required: LINKEDIN_ACCESS_TOKEN, LINKEDIN_PERSON_URN'
    };
  }

  try {
    const response = await fetch(
      'https://api.linkedin.com/v2/me',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0'
        }
      }
    );

    if (!response.ok) {
      const error = await response.json() as { message?: string };
      throw new Error(error.message || 'LinkedIn API error');
    }

    const data = await response.json() as { id: string; localizedFirstName: string; localizedLastName: string };

    return {
      success: true,
      platform: 'linkedin',
      user: {
        id: data.id,
        firstName: data.localizedFirstName,
        lastName: data.localizedLastName
      }
    };
  } catch (error) {
    throw new Error(`LinkedIn API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function testThreads() {
  const accessToken = process.env.THREADS_ACCESS_TOKEN;
  const userId = process.env.THREADS_USER_ID;

  if (!accessToken || !userId) {
    return {
      success: false,
      error: 'Threads credentials not configured. Required: THREADS_ACCESS_TOKEN, THREADS_USER_ID'
    };
  }

  try {
    const response = await fetch(
      `https://graph.threads.net/v1.0/${userId}?fields=id,username,name&access_token=${accessToken}`
    );

    if (!response.ok) {
      const error = await response.json() as { error?: { message?: string } };
      throw new Error(error.error?.message || 'Threads API error');
    }

    const data = await response.json() as { id: string; username: string; name: string };

    return {
      success: true,
      platform: 'threads',
      user: {
        id: data.id,
        username: data.username,
        name: data.name
      }
    };
  } catch (error) {
    throw new Error(`Threads API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function testInstagram() {
  const businessAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!businessAccountId || !accessToken) {
    return {
      success: false,
      error: 'Instagram credentials not configured. Required: INSTAGRAM_BUSINESS_ACCOUNT_ID, INSTAGRAM_ACCESS_TOKEN'
    };
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${businessAccountId}?fields=id,username,name,followers_count&access_token=${accessToken}`
    );

    if (!response.ok) {
      const error = await response.json() as { error?: { message?: string } };
      throw new Error(error.error?.message || 'Instagram API error');
    }

    const data = await response.json() as { id: string; username: string; name: string; followers_count: number };

    return {
      success: true,
      platform: 'instagram',
      account: {
        id: data.id,
        username: data.username,
        name: data.name,
        followers: data.followers_count
      }
    };
  } catch (error) {
    throw new Error(`Instagram API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
