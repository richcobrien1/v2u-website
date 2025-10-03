import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { episodeId?: string; newFilePath?: string };
    const { episodeId, newFilePath } = body;
    
    if (!episodeId || !newFilePath) {
      return NextResponse.json(
        { error: 'Missing episodeId or newFilePath' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'File path update instructions',
      episodeId,
      newFilePath,
      instructions: [
        `1. Update app/podcast-dashboard/page.tsx`,
        `2. Find episode with id: "${episodeId}"`,
        `3. Change audioUrl to: "/api/r2/private/${newFilePath}"`,
        `4. Test the new path at /r2-test`,
        `5. Verify playback in /podcast-dashboard`
      ],
      testUrl: `/r2-test?path=${encodeURIComponent(newFilePath)}`,
      apiEndpoint: `/api/r2/private/${newFilePath}`
    });
  } catch (error) {
    console.error('Update episode path error:', error);
    return NextResponse.json(
      { error: 'Invalid request format' },
      { status: 400 }
    );
  }
}