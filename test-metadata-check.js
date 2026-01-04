// Quick test to check if metadata is being stored
const { S3Client, HeadObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv/config');

const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY,
    secretAccessKey: process.env.R2_SECRET_KEY,
  },
});

async function checkMetadata() {
  const key = '2026/01/03/january-3-2026-ai-now-week-in-review-with-alex-and-jessica-a87ed008.mp4';
  const bucket = process.env.R2_BUCKET_PRIVATE || 'private';
  
  console.log(`Checking metadata for: ${key}`);
  console.log(`Bucket: ${bucket}`);
  
  try {
    const command = new HeadObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    
    const response = await r2Client.send(command);
    console.log('\n✅ File found!');
    console.log('Metadata:', response.Metadata);
    console.log('ContentType:', response.ContentType);
    console.log('ContentLength:', response.ContentLength);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkMetadata();
