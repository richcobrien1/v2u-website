import { NextRequest, NextResponse } from 'next/server';

interface AnalyticsEvent {
  episodeId: string;
  source: string;
  platform: string;
  device?: string;
  timestamp: string;
  userAgent?: string;
  referer?: string;
}

// In production, this would go to your analytics database
// For now, we'll log it and could send to Cloudflare Analytics
export async function POST(request: NextRequest) {
  try {
    const body: AnalyticsEvent = await request.json();

    // Add server-side data
    const analyticsData = {
      ...body,
      userAgent: request.headers.get('user-agent') || undefined,
      referer: request.headers.get('referer') || undefined,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
    };

    // Log for now (in production, send to analytics service)
    console.log('📊 Analytics Event:', JSON.stringify(analyticsData, null, 2));

    // TODO: Send to Cloudflare Analytics, Google Analytics, or custom DB
    // Example with Cloudflare Analytics:
    // await fetch('https://api.cloudflare.com/client/v4/accounts/.../analytics', {
    //   method: 'POST',
    //   headers: { 'Authorization': `Bearer ${process.env.CF_ANALYTICS_TOKEN}` },
    //   body: JSON.stringify(analyticsData)
    // });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error tracking analytics:', error);
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    );
  }
}
