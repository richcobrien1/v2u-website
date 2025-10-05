import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';

// Configure R2 client
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY!,
    secretAccessKey: process.env.R2_SECRET_KEY!,
  },
});

const BUCKET_NAME = 'v2u-private'; // Your bucket name

// Sample files to create in each directory
const sampleFiles = {
  'public/daily/portrait/2025/10/': [
    'ai-now-2025-10-02-portrait.mp4',
    'ai-now-2025-10-02-portrait-thumbnail.jpg'
  ],
  'public/daily/landscape/2025/10/': [
    'ai-now-2025-10-02-landscape.mp4',
    'ai-now-2025-10-02-landscape-thumbnail.jpg'
  ],
  'private/educate/beginner/season-1/': [
    'episode-001-what-is-ai.mp4',
    'episode-002-first-prompts.mp4',
    'episode-003-choosing-tools.mp4'
  ],
  'private/reviews/weekly/2025/week-40/': [
    'ai-tools-weekly-review-2025-w40.mp4',
    'ai-tools-weekly-review-2025-w40.pdf'
  ],
  'private/projects/safeshipping/development-updates/': [
    'safeshipping-progress-oct-2025.mp4',
    'blockchain-integration-update.mp4'
  ]
};

async function createStructureWithSamples() {
  console.log('🚀 Creating R2 structure with sample files...');
  
  for (const [directory, files] of Object.entries(sampleFiles)) {
    console.log(`\n📁 Creating directory: ${directory}`);
    
    for (const filename of files) {
      try {
        const key = `${directory}${filename}`;
        const sampleContent = `# Sample file: ${filename}\n# Created: ${new Date().toISOString()}\n# Directory: ${directory}\n# This is a placeholder file for testing the R2 structure.`;
        
        await r2Client.send(new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
          Body: sampleContent,
          ContentType: filename.endsWith('.mp4') ? 'video/mp4' : 
                      filename.endsWith('.jpg') ? 'image/jpeg' :
                      filename.endsWith('.pdf') ? 'application/pdf' : 'text/plain',
        }));
        
        console.log(`  ✅ ${filename}`);
      } catch (error) {
        console.error(`  ❌ Failed to create ${filename}:`, error);
      }
    }
  }
  
  console.log('\n🎉 Sample structure creation complete!');
  console.log('🔗 Test your structure at: /r2-test');
}

// Run the script
createStructureWithSamples().catch(console.error);