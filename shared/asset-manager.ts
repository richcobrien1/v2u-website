// Cross-repo Development Utilities
// Works with both website and cloudflare-r2 repositories

import { S3Client } from '@aws-sdk/client-s3';
import { getR2Config, AssetManifest } from './r2-config.js';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export class V2UAssetManager {
  private r2Client: S3Client;
  private config: ReturnType<typeof getR2Config>;
  private manifestPath = './public/asset-manifest.json';

  constructor() {
    this.config = getR2Config();
    this.r2Client = new S3Client({
      region: 'auto',
      endpoint: this.config.endpoint,
      credentials: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
      },
    });
  }

  // Generate file hash for cache busting
  async generateFileHash(filePath: string): Promise<string> {
    const fileBuffer = await fs.readFile(filePath);
    return crypto.createHash('md5').update(fileBuffer).digest('hex').slice(0, 8);
  }

  // Load existing asset manifest
  async loadManifest(): Promise<AssetManifest> {
    try {
      const manifestData = await fs.readFile(this.manifestPath, 'utf-8');
      return JSON.parse(manifestData);
    } catch {
      return {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        assets: {},
      };
    }
  }

  // Save asset manifest
  async saveManifest(manifest: AssetManifest): Promise<void> {
    await fs.writeFile(this.manifestPath, JSON.stringify(manifest, null, 2));
  }

  // Update manifest with new asset
  async updateManifest(
    assetKey: string,
    r2Path: string,
    localPath: string
  ): Promise<void> {
    const manifest = await this.loadManifest();
    const stats = await fs.stat(localPath);
    const hash = await this.generateFileHash(localPath);
    
    manifest.assets[assetKey] = {
      r2Path,
      publicUrl: `${this.config.publicUrl}/${r2Path}`,
      hash,
      size: stats.size,
      contentType: this.getContentType(localPath),
      uploadDate: new Date().toISOString(),
    };
    
    manifest.timestamp = new Date().toISOString();
    await this.saveManifest(manifest);
  }

  // Get content type from file extension
  private getContentType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const types: Record<string, string> = {
      '.mp4': 'video/mp4',
      '.mov': 'video/quicktime',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.pdf': 'application/pdf',
    };
    return types[ext] || 'application/octet-stream';
  }

  // Get asset URL from manifest
  async getAssetUrl(assetKey: string): Promise<string | null> {
    const manifest = await this.loadManifest();
    const asset = manifest.assets[assetKey];
    return asset ? `${asset.publicUrl}?v=${asset.hash}` : null;
  }
}

// Development workflow helpers
export const DevWorkflow = {
  // Check if R2 credentials are configured
  checkR2Setup(): boolean {
    try {
      getR2Config();
      return true;
    } catch {
      return false;
    }
  },

  // Print setup instructions
  printSetupInstructions(): void {
    console.log('🔧 R2 Setup Required:');
    console.log('Add to your .env.local file:');
    console.log('');
    console.log('R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com');
    console.log('R2_ACCESS_KEY=your-access-key');
    console.log('R2_SECRET_KEY=your-secret-key');
    console.log('R2_BUCKET=v2u-private');
    console.log('R2_PUBLIC_URL=https://your-custom-domain.com');
    console.log('');
  },

  // Test R2 connection
  async testR2Connection(): Promise<boolean> {
    try {
      const config = getR2Config();
      const testClient = new S3Client({
        region: 'auto',
        endpoint: config.endpoint,
        credentials: {
          accessKeyId: config.accessKeyId,
          secretAccessKey: config.secretAccessKey,
        },
      });
      
      // Try to list objects (minimal operation)
      const { ListObjectsV2Command } = await import('@aws-sdk/client-s3');
      await testClient.send(new ListObjectsV2Command({
        Bucket: config.bucket,
        MaxKeys: 1,
      }));
      console.log('✅ R2 connection successful');
      return true;
    } catch (error) {
      console.log('❌ R2 connection failed:', error);
      return false;
    }
  },
};

export default V2UAssetManager;