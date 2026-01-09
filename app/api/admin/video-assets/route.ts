import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

interface VideoAsset {
  id: string;
  name: string;
  type: 'background' | 'promo-audio' | 'promo-visual' | 'outro';
  url: string;
  duration?: number;
  enabled: boolean;
  insertAt?: number; // seconds
}

interface VideoConfig {
  assets: VideoAsset[];
  defaultBackground: string;
  defaultOutro: string;
  promoSlots: Array<{
    time: number;
    audioAssetId?: string;
    visualAssetId?: string;
    enabled: boolean;
  }>;
  outputType: 'public' | 'private';
}

const CONFIG_PATH = path.join(process.cwd(), 'data', 'video-config.json');

export async function GET() {
  try {
    const data = await readFile(CONFIG_PATH, 'utf-8');
    const config = JSON.parse(data);
    return NextResponse.json(config);
  } catch {
    // Return default config if file doesn't exist
    const defaultConfig: VideoConfig = {
      assets: [],
      defaultBackground: '',
      defaultOutro: '',
      promoSlots: [
        { time: 240, enabled: true }, // 4:00
        { time: -5, enabled: true }   // 5s before end
      ],
      outputType: 'public'
    };
    return NextResponse.json(defaultConfig);
  }
}

export async function POST(request: NextRequest) {
  try {
    const config: VideoConfig = await request.json();
    await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
  }
}
