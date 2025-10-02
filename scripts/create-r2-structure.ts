import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

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

// Directory structure to create
const directories = [
  // Public content
  'public/daily/portrait/2025/10/',
  'public/daily/landscape/2025/10/',
  'public/promos/platform-promos/',
  'public/promos/premium-teasers/',
  
  // Private reviews
  'private/reviews/weekly/2025/week-40/',
  'private/reviews/monthly/2025/october/',
  'private/reviews/yearly/2025/',
  
  // Private formats
  'private/formats/briefs/',
  'private/formats/reports/',
  'private/formats/deep-dives/',
  
  // Private educate series
  'private/educate/beginner/season-1/',
  'private/educate/beginner/season-2/',
  'private/educate/intermediate/season-1/',
  'private/educate/advanced/season-1/',
  
  // Private categories
  'private/categories/commercial/case-studies/',
  'private/categories/commercial/strategies/',
  'private/categories/commercial/tools/',
  'private/categories/conceptual/ethics/',
  'private/categories/conceptual/philosophy/',
  'private/categories/conceptual/society/',
  
  // Private projects
  'private/projects/safeshipping/development-updates/',
  'private/projects/safeshipping/tutorials/',
  'private/projects/trafficjamz/feature-demos/',
  'private/projects/trafficjamz/case-studies/',
  'private/projects/mealsondemand/business-model/',
  'private/projects/mealsondemand/technology/',
];

async function createDirectoryStructure() {
  console.log('🚀 Creating R2 directory structure...');
  
  for (const dir of directories) {
    try {
      // Create a placeholder file to establish the directory
      const key = `${dir}.keep`;
      
      await r2Client.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: '# Directory placeholder - safe to delete after adding content',
        ContentType: 'text/plain',
      }));
      
      console.log(`✅ Created: ${dir}`);
    } catch (error) {
      console.error(`❌ Failed to create ${dir}:`, error);
    }
  }
  
  console.log('🎉 Directory structure creation complete!');
  console.log(`📁 Created ${directories.length} directories in R2 bucket: ${BUCKET_NAME}`);
}

// Run the script
createDirectoryStructure().catch(console.error);