import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';

// Configure R2
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY!,
    secretAccessKey: process.env.R2_SECRET_KEY!,
  },
});

async function uploadSpecificFile() {
  const localPath = "C:\\Users\\richc\\OneDrive\\Work\\V2U\\Assets\\Education\\Standard\\AI-Now\\Desktop\\October 2, 2025, AI-Now - Practical AI, Advanced Robotics - Deep Dive with Alex and Jessica.mp4";
  
  // Clean filename for R2 (remove problematic characters)
  const cleanFilename = "ai-now-2025-10-02-practical-ai-advanced-robotics-landscape.mp4";
  const r2Key = `public/daily/landscape/2025/10/${cleanFilename}`;
  
  console.log('🚀 Starting upload...');
  console.log('📁 Local:', localPath);
  console.log('☁️  R2 Key:', r2Key);
  
  try {
    // Check if file exists
    if (!fs.existsSync(localPath)) {
      console.error('❌ File not found:', localPath);
      return;
    }
    
    const fileStream = fs.createReadStream(localPath);
    const stats = fs.statSync(localPath);
    console.log(`📊 File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET || 'v2u-private',
      Key: r2Key,
      Body: fileStream,
      ContentType: 'video/mp4',
    });
    
    await r2Client.send(command);
    
    console.log('✅ Upload successful!');
    console.log('🔗 R2 Path:', r2Key);
    console.log('🧪 Test URL: http://localhost:3000/r2-test');
    console.log('📝 Update podcast-dashboard with:', `/api/r2/private/${r2Key}`);
    
    return r2Key;
    
  } catch (error) {
    console.error('❌ Upload failed:', error);
  }
}

// Run the upload
uploadSpecificFile().catch(console.error);