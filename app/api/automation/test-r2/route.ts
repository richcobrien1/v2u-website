/**
 * Test R2 Image Upload
 * GET /api/automation/test-r2
 * 
 * Verifies R2 configuration by uploading a test image
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  console.log('[Test R2] Starting R2 configuration test');

  try {
    // Import R2 upload functions
    const { uploadImageToR2 } = await import('@/lib/r2-image-upload');

    // Create a minimal test image (1x1 red pixel PNG)
    const testImageDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

    // Generate filename
    const filename = `test-${Date.now()}.png`;

    console.log('[Test R2] Uploading test image:', filename);

    // Upload to R2
    const publicUrl = await uploadImageToR2(testImageDataUrl, filename);

    console.log('[Test R2] ✅ Upload successful:', publicUrl);

    // Verify environment configuration
    const config = {
      hasAccessKey: !!process.env.R2_ACCESS_KEY,
      hasSecretKey: !!process.env.R2_SECRET_KEY,
      hasEndpoint: !!process.env.R2_ENDPOINT,
      hasBucketPromos: !!process.env.R2_BUCKET_PROMOS,
      hasPublicDomain: !!process.env.R2_PUBLIC_DOMAIN,
      endpoint: process.env.R2_ENDPOINT || 'NOT_SET',
      bucket: process.env.R2_BUCKET_PROMOS || 'promos',
      publicDomain: process.env.R2_PUBLIC_DOMAIN || 'NOT_SET (using direct R2 URL)',
    };

    return NextResponse.json({
      success: true,
      testImageUrl: publicUrl,
      message: '✅ R2 configuration verified. Test image uploaded successfully.',
      config,
      instructions: [
        '1. Open the testImageUrl in your browser to verify public access',
        '2. If you see "Access Denied", enable public access in Cloudflare Dashboard',
        '3. For production, consider setting up a custom domain (R2_PUBLIC_DOMAIN)',
      ],
    });

  } catch (error) {
    console.error('[Test R2] ❌ Test failed:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: '❌ R2 configuration test failed',
      troubleshooting: [
        'Check that R2_ACCESS_KEY, R2_SECRET_KEY, and R2_ENDPOINT are set in environment variables',
        'Verify that the "promos" bucket exists in Cloudflare R2 Dashboard',
        'Ensure R2 credentials have read/write permissions',
        'Check Vercel logs for detailed error messages',
      ],
      docs: 'See docs/instagram-r2-setup.md for setup instructions',
    }, { status: 500 });
  }
}

/**
 * Test Instagram posting with image
 * POST /api/automation/test-r2
 * 
 * Body: { "episodeTitle": "Test Episode" }
 */
export async function POST(request: NextRequest) {
  console.log('[Test R2] Testing Instagram image generation and upload');

  try {
    const body = await request.json() as { episodeTitle?: string };
    const episodeTitle = body.episodeTitle || 'Test Episode - AI Now';

    // Import image generator
    const { generateEpisodeImage } = await import('@/lib/image-generator');
    const { uploadImageToR2, generateInstagramFilename } = await import('@/lib/r2-image-upload');

    // Generate episode image
    console.log('[Test R2] Generating episode image');
    const imageDataUrl = await generateEpisodeImage({
      title: episodeTitle,
      subtitle: '🎙️ Test Episode',
      backgroundColor: '#1a1a2e',
      textColor: '#ffffff',
    });

    console.log('[Test R2] Image generated (SVG data URL)');

    // Upload to R2
    const filename = generateInstagramFilename();
    console.log('[Test R2] Uploading to R2:', filename);
    
    const publicUrl = await uploadImageToR2(imageDataUrl, filename);

    console.log('[Test R2] ✅ Upload successful:', publicUrl);

    return NextResponse.json({
      success: true,
      imageUrl: publicUrl,
      episodeTitle,
      message: '✅ Image generated and uploaded successfully',
      nextSteps: [
        '1. Open the imageUrl in your browser to view the generated image',
        '2. This image can now be used with Instagram Graph API',
        '3. Test actual Instagram posting in the Admin Panel',
      ],
    });

  } catch (error) {
    console.error('[Test R2] ❌ Test failed:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: '❌ Image generation/upload test failed',
    }, { status: 500 });
  }
}
