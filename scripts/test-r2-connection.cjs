#!/usr/bin/env node
/**
 * Test R2 Connection and List Buckets
 * 
 * This script tests the R2 connection and lists files from public/private buckets
 */

require('dotenv').config({ path: '.env.local' });
const { S3Client, ListObjectsV2Command, ListBucketsCommand } = require('@aws-sdk/client-s3');

const endpoint = process.env.R2_ENDPOINT;
const accessKeyId = process.env.R2_ACCESS_KEY;
const secretAccessKey = process.env.R2_SECRET_KEY;

console.log('🔧 R2 Configuration Check:');
console.log('  R2_ENDPOINT:', endpoint ? '✅ SET' : '❌ NOT SET');
console.log('  R2_ACCESS_KEY:', accessKeyId ? '✅ SET' : '❌ NOT SET');
console.log('  R2_SECRET_KEY:', secretAccessKey ? '✅ SET' : '❌ NOT SET');
console.log('  R2_BUCKET_PUBLIC:', process.env.R2_BUCKET_PUBLIC || 'public');
console.log('  R2_BUCKET_PRIVATE:', process.env.R2_BUCKET_PRIVATE || 'private');
console.log('');

if (!endpoint || !accessKeyId || !secretAccessKey) {
  console.error('❌ Missing R2 credentials!');
  process.exit(1);
}

const client = new S3Client({
  region: 'auto',
  endpoint,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  forcePathStyle: true,
});

async function testR2() {
  // Try to list buckets first
  console.log('📋 Attempting to list buckets...');
  try {
    const bucketsCmd = new ListBucketsCommand({});
    const bucketsRes = await client.send(bucketsCmd);
    console.log('✅ Buckets:', bucketsRes.Buckets?.map(b => b.Name).join(', ') || 'None');
  } catch (err) {
    console.error('❌ List buckets error:', err.message);
    console.log('ℹ️  This is expected - R2 API tokens don\'t support ListBuckets');
  }
  console.log('');

  // Test PUBLIC bucket
  const publicBucket = process.env.R2_BUCKET_PUBLIC || 'public';
  console.log(`📂 Testing PUBLIC bucket (${publicBucket})...`);
  try {
    const publicCmd = new ListObjectsV2Command({ 
      Bucket: publicBucket, 
      MaxKeys: 10,
      Delimiter: '/'
    });
    const publicRes = await client.send(publicCmd);
    const fileCount = publicRes.Contents?.length || 0;
    const folderCount = publicRes.CommonPrefixes?.length || 0;
    
    console.log(`✅ PUBLIC bucket: ${fileCount} files, ${folderCount} folders`);
    if (fileCount > 0) {
      console.log('   Sample files:');
      publicRes.Contents?.slice(0, 5).forEach(f => {
        const size = Math.round((f.Size || 0) / (1024 * 1024));
        console.log(`     - ${f.Key} (${size}MB)`);
      });
    }
    if (folderCount > 0) {
      console.log('   Folders:');
      publicRes.CommonPrefixes?.slice(0, 5).forEach(p => {
        console.log(`     - ${p.Prefix}`);
      });
    }
  } catch (err) {
    console.error(`❌ PUBLIC bucket error: ${err.message}`);
    console.error('   Full error:', err.Code, '-', err.$metadata?.httpStatusCode);
  }
  console.log('');

  // Test PRIVATE bucket
  const privateBucket = process.env.R2_BUCKET_PRIVATE || 'private';
  console.log(`📂 Testing PRIVATE bucket (${privateBucket})...`);
  try {
    const privateCmd = new ListObjectsV2Command({ 
      Bucket: privateBucket, 
      MaxKeys: 10,
      Delimiter: '/'
    });
    const privateRes = await client.send(privateCmd);
    const fileCount = privateRes.Contents?.length || 0;
    const folderCount = privateRes.CommonPrefixes?.length || 0;
    
    console.log(`✅ PRIVATE bucket: ${fileCount} files, ${folderCount} folders`);
    if (fileCount > 0) {
      console.log('   Sample files:');
      privateRes.Contents?.slice(0, 5).forEach(f => {
        const size = Math.round((f.Size || 0) / (1024 * 1024));
        console.log(`     - ${f.Key} (${size}MB)`);
      });
    }
    if (folderCount > 0) {
      console.log('   Folders:');
      privateRes.CommonPrefixes?.slice(0, 5).forEach(p => {
        console.log(`     - ${p.Prefix}`);
      });
    }
  } catch (err) {
    console.error(`❌ PRIVATE bucket error: ${err.message}`);
    console.error('   Full error:', err.Code, '-', err.$metadata?.httpStatusCode);
  }
  console.log('');

  console.log('✨ Test complete!');
  console.log('');
  console.log('📝 Next steps:');
  console.log('  1. If you see "Please enable R2" error, check Cloudflare R2 is enabled');
  console.log('  2. Verify API token has R2 read permissions in Cloudflare dashboard');
  console.log('  3. Ensure buckets "public" and "private" exist in Cloudflare R2');
}

testR2().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
