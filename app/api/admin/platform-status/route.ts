import { NextRequest, NextResponse } from 'next/server';
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
    const configData = await readFile(configPath, 'utf-8');
    const config: Config = JSON.parse(configData);

    // Map to status format
    const platforms = [
      ...config.level1.map(p => ({
        id: p.id,
        name: p.name,
        type: 'source' as const,
        enabled: p.enabled,
        lastResult: p.lastTestResult?.success ? 'success' as const : 
                    p.lastTestResult ? 'failed' as const : 'unknown' as const,
        lastActivity: p.lastTestResult?.timestamp || p.validatedAt || null,
        errorMessage: p.lastTestResult?.error
      })),
      ...config.level2.map(p => ({
        id: p.id,
        name: p.name,
        type: 'target' as const,
        enabled: p.enabled,
        lastResult: p.lastTestResult?.success ? 'success' as const : 
                    p.lastTestResult ? 'failed' as const : 'unknown' as const,
        lastActivity: p.lastTestResult?.timestamp || p.validatedAt || null,
        errorMessage: p.lastTestResult?.error
      }))
    ];

    return NextResponse.json({ platforms });
  } catch (error) {
    console.error('Failed to load platform statuses:', error);
    return NextResponse.json({ platforms: [] });
  }
}
