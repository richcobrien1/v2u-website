// Quick test script to verify R2 bucket access
const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');

async function testBuckets() {
  const client = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY,
      secretAccessKey: process.env.R2_SECRET_KEY,
    },
  });

  const publicBucket = process.env.R2_BUCKET_PUBLIC || 'public';
  const privateBucket = process.env.R2_BUCKET_PRIVATE || 'private';

  console.log('\n=== R2 Configuration ===');
  console.log('R2_ENDPOINT:', process.env.R2_ENDPOINT);
  console.log('R2_ACCESS_KEY:', process.env.R2_ACCESS_KEY ? 'Set' : 'Not set');
  console.log('R2_SECRET_KEY:', process.env.R2_SECRET_KEY ? 'Set' : 'Not set');
  console.log('R2_BUCKET_PUBLIC:', publicBucket);
  console.log('R2_BUCKET_PRIVATE:', privateBucket);

  // Test public bucket
  console.log('\n=== Testing Public Bucket ===');
  try {
    const command = new ListObjectsV2Command({
      Bucket: publicBucket,
      MaxKeys: 10,
    });
    const response = await client.send(command);
    console.log(`✅ Public bucket accessible: ${response.Contents?.length || 0} files found`);
    if (response.Contents && response.Contents.length > 0) {
      console.log('Sample files:');
      response.Contents.slice(0, 3).forEach(obj => {
        console.log(`  - ${obj.Key} (${Math.round((obj.Size || 0) / 1024 / 1024)}MB)`);
      });
    }
  } catch (error) {
    console.error('❌ Public bucket error:', error.message);
  }

  // Test private bucket
  console.log('\n=== Testing Private Bucket ===');
  try {
    const command = new ListObjectsV2Command({
      Bucket: privateBucket,
      MaxKeys: 10,
    });
    const response = await client.send(command);
    console.log(`✅ Private bucket accessible: ${response.Contents?.length || 0} files found`);
    if (response.Contents && response.Contents.length > 0) {
      console.log('Sample files:');
      response.Contents.slice(0, 3).forEach(obj => {
        console.log(`  - ${obj.Key} (${Math.round((obj.Size || 0) / 1024 / 1024)}MB)`);
      });
    }
  } catch (error) {
    console.error('❌ Private bucket error:', error.message);
  }
}

testBuckets().catch(console.error);
