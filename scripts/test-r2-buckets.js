#!/usr/bin/env node
/**
 * Test R2 Bucket Access
 * Verifies we can connect to R2 and lists available buckets and their contents
 */

import { S3Client, ListObjectsV2Command, ListBucketsCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY,
    secretAccessKey: process.env.R2_SECRET_KEY,
  },
});

async function testR2Access() {
  console.log('🔍 Testing R2 Bucket Access\n');
  console.log('Configuration:');
  console.log('  Endpoint:', process.env.R2_ENDPOINT);
  console.log('  Access Key:', process.env.R2_ACCESS_KEY ? '✓ Set' : '✗ Missing');
  console.log('  Secret Key:', process.env.R2_SECRET_KEY ? '✓ Set' : '✗ Missing');
  console.log('  Public Bucket:', process.env.R2_BUCKET_PUBLIC);
  console.log('  Private Bucket:', process.env.R2_BUCKET_PRIVATE);
  console.log('');

  // Try to list buckets (may not have permission)
  console.log('📦 Attempting to list buckets...');
  try {
    const bucketsCommand = new ListBucketsCommand({});
    const bucketsResponse = await r2Client.send(bucketsCommand);
    console.log('✅ Available buckets:');
    bucketsResponse.Buckets?.forEach(bucket => {
      console.log(`   - ${bucket.Name} (created: ${bucket.CreationDate})`);
    });
    console.log('');
  } catch (error) {
    console.log('⚠️  Cannot list buckets (might not have permission)');
    console.log('   Error:', error.message);
    console.log('');
  }

  // Test public bucket
  const publicBucket = process.env.R2_BUCKET_PUBLIC || 'public';
  console.log(`📁 Testing PUBLIC bucket: "${publicBucket}"`);
  try {
    const command = new ListObjectsV2Command({
      Bucket: publicBucket,
      MaxKeys: 10,
    });
    const response = await r2Client.send(command);
    const count = response.Contents?.length || 0;
    const totalSize = response.Contents?.reduce((sum, obj) => sum + (obj.Size || 0), 0) || 0;
    
    console.log(`✅ SUCCESS - Found ${count} objects (${formatBytes(totalSize)})`);
    if (response.Contents && response.Contents.length > 0) {
      console.log('   First 5 files:');
      response.Contents.slice(0, 5).forEach(obj => {
        console.log(`   - ${obj.Key} (${formatBytes(obj.Size || 0)})`);
      });
    }
    console.log('');
  } catch (error) {
    console.log('❌ FAILED');
    console.log('   Error:', error.name);
    console.log('   Message:', error.message);
    if (error.$metadata) {
      console.log('   Status Code:', error.$metadata.httpStatusCode);
    }
    console.log('');
  }

  // Test private bucket
  const privateBucket = process.env.R2_BUCKET_PRIVATE || 'private';
  console.log(`📁 Testing PRIVATE bucket: "${privateBucket}"`);
  try {
    const command = new ListObjectsV2Command({
      Bucket: privateBucket,
      MaxKeys: 10,
    });
    const response = await r2Client.send(command);
    const count = response.Contents?.length || 0;
    const totalSize = response.Contents?.reduce((sum, obj) => sum + (obj.Size || 0), 0) || 0;
    
    console.log(`✅ SUCCESS - Found ${count} objects (${formatBytes(totalSize)})`);
    if (response.Contents && response.Contents.length > 0) {
      console.log('   First 5 files:');
      response.Contents.slice(0, 5).forEach(obj => {
        console.log(`   - ${obj.Key} (${formatBytes(obj.Size || 0)})`);
      });
    }
    console.log('');
  } catch (error) {
    console.log('❌ FAILED');
    console.log('   Error:', error.name);
    console.log('   Message:', error.message);
    if (error.$metadata) {
      console.log('   Status Code:', error.$metadata.httpStatusCode);
    }
    console.log('');
  }

  // Summary
  console.log('📊 Summary:');
  console.log('If you see errors above, check:');
  console.log('1. Bucket names in .env.local match actual R2 bucket names');
  console.log('2. R2 API credentials have correct permissions');
  console.log('3. Endpoint URL is correct for your Cloudflare account');
  console.log('');
  console.log('To fix bucket name mismatch:');
  console.log('1. Login to Cloudflare Dashboard → R2');
  console.log('2. Note the exact bucket names');
  console.log('3. Update R2_BUCKET_PUBLIC and R2_BUCKET_PRIVATE in .env.local');
  console.log('4. Restart development server');
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

testR2Access().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
