import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';

interface PlatformConfig {
  id: string;
  name: string;
  enabled: boolean;
  credentials: Record<string, unknown>;
  validated?: boolean;
  validatedAt?: string;
  lastTestResult?: {
    success: boolean;
    error?: string;
    timestamp: string;
  };
}

interface Config {
  level1: PlatformConfig[];
  level2: PlatformConfig[];
}

export async function GET() {
  try {
    // Load platform configurations
    const configPath = path.join(process.cwd(), 'data', 'social-posting-config.json');
    
    // Check if file exists first
    let config: Config;
    try {
      const configData = await readFile(configPath, 'utf-8');
      config = JSON.parse(configData);
    } catch (fileError) {
      console.warn('Config file not found, returning default platforms:', fileError);
      // Return default platform structure
      config = {
        level1: [],
        level2: []
      };
    }

    // Map to status format
    const platforms = [
      ...(config.level1 || []).map(p => ({
        id: p.id,
        name: p.name,
        type: 'source' as const,
        enabled: p.enabled ?? false,
        lastResult: p.lastTestResult?.success ? 'success' as const : 
                    p.lastTestResult ? 'failed' as const : 'unknown' as const,
        lastActivity: p.lastTestResult?.timestamp || p.validatedAt || null,
        errorMessage: p.lastTestResult?.error
      })),
      ...(config.level2 || []).map(p => ({
        id: p.id,
        name: p.name,
        type: 'target' as const,
        enabled: p.enabled ?? false,
        lastResult: p.lastTestResult?.success ? 'success' as const : 
                    p.lastTestResult ? 'failed' as const : 'unknown' as const,
        lastActivity: p.lastTestResult?.timestamp || p.validatedAt || null,
        errorMessage: p.lastTestResult?.error
      }))
    ];

    return NextResponse.json({ 
      platforms,
      _debug: {
        configPath,
        level1Count: config.level1?.length || 0,
        level2Count: config.level2?.length || 0
      }
    });
  } catch (error) {
    console.error('Failed to load platform statuses:', error);
    return NextResponse.json({ 
      platforms: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
