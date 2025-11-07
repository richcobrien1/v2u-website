import { NextResponse } from 'next/server';
import { kvStorage } from '@/lib/kv-storage';

export const runtime = 'nodejs';

/**
 * GET /api/automation/debug
 * Debug endpoint to check KV storage configuration
 */
export async function GET() {
  try {
    const hasCloudflareEnv = !!(
      process.env.CLOUDFLARE_ACCOUNT_ID &&
      process.env.CLOUDFLARE_API_TOKEN &&
      process.env.CLOUDFLARE_KV_NAMESPACE_ID
    );

    // Try to get status
    const status = await kvStorage.getStatus();

    // Try to save a test status
    const testStatus = {
      running: true,
      lastCheck: new Date().toISOString(),
      nextCheck: new Date(Date.now() + 3600000).toISOString(),
      checksToday: 1
    };
    
    await kvStorage.saveStatus(testStatus);
    
    // Try to read it back
    const savedStatus = await kvStorage.getStatus();

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: {
        hasCloudflareEnv,
        accountId: process.env.CLOUDFLARE_ACCOUNT_ID ? 'SET' : 'NOT SET',
        apiToken: process.env.CLOUDFLARE_API_TOKEN ? 'SET' : 'NOT SET',
        namespaceId: process.env.CLOUDFLARE_KV_NAMESPACE_ID ? 'SET' : 'NOT SET',
      },
      storage: {
        currentStatus: status,
        testStatusWritten: testStatus,
        testStatusRead: savedStatus,
        writeSucceeded: JSON.stringify(savedStatus) === JSON.stringify(testStatus)
      }
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Debug failed',
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
