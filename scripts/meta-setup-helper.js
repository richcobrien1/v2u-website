#!/usr/bin/env node

/**
 * Meta Platform Setup Helper
 * Run this script to get your Facebook Page ID, Instagram Business Account ID, and verify tokens
 */

// SECURITY: Credentials moved to environment variables
const APP_ID = process.env.FACEBOOK_APP_ID || '';
const APP_SECRET = process.env.FACEBOOK_APP_SECRET || '';

// USER ACCESS TOKEN - Get this from Graph API Explorer first!
// https://developers.facebook.com/tools/explorer/
// Generate token with permissions: pages_read_engagement, instagram_basic, instagram_content_publish
const USER_ACCESS_TOKEN = process.env.USER_ACCESS_TOKEN || 'PASTE_YOUR_TOKEN_HERE';

async function fetchGraphAPI(endpoint) {
  const url = `https://graph.facebook.com/v21.0/${endpoint}`;
  console.log(`\n🔍 Fetching: ${endpoint}`);
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
      console.error('❌ Error:', data.error.message);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('❌ Fetch failed:', error.message);
    return null;
  }
}

async function extendAccessToken() {
  console.log('\n📅 Extending Access Token (60 days)...');
  
  const url = `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${APP_ID}&client_secret=${APP_SECRET}&fb_exchange_token=${USER_ACCESS_TOKEN}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.access_token) {
      console.log('✅ Long-lived token generated!');
      console.log('📋 Token:', data.access_token);
      console.log('⏰ Expires in:', data.expires_in, 'seconds (≈', Math.round(data.expires_in / 86400), 'days)');
      return data.access_token;
    } else {
      console.error('❌ Failed to extend token:', data);
      return null;
    }
  } catch (error) {
    console.error('❌ Extension failed:', error.message);
    return null;
  }
}

async function main() {
  console.log('🚀 Meta Platform Setup Helper\n');
  console.log('═══════════════════════════════════════════════════════════');
  
  if (USER_ACCESS_TOKEN === 'PASTE_YOUR_TOKEN_HERE') {
    console.log('\n❌ ERROR: You need to provide a User Access Token!\n');
    console.log('📝 Steps:');
    console.log('1. Go to: https://developers.facebook.com/tools/explorer/');
    console.log('2. Select your "AI-Now" app');
    console.log('3. Click "Generate Access Token"');
    console.log('4. Select permissions:');
    console.log('   - pages_read_engagement');
    console.log('   - pages_manage_posts');
    console.log('   - instagram_basic');
    console.log('   - instagram_content_publish');
    console.log('   - threads_basic');
    console.log('   - threads_content_publish');
    console.log('5. Copy the token and run:');
    console.log('   USER_ACCESS_TOKEN="your_token_here" node scripts/meta-setup-helper.js\n');
    return;
  }
  
  // Extend token first
  const longLivedToken = await extendAccessToken();
  if (!longLivedToken) {
    console.log('\n⚠️  Continuing with short-lived token (will expire in 1 hour)...\n');
  }
  
  const token = longLivedToken || USER_ACCESS_TOKEN;
  
  // Get Facebook Pages
  console.log('\n\n📘 FACEBOOK PAGES');
  console.log('═══════════════════════════════════════════════════════════');
  const pages = await fetchGraphAPI(`me/accounts?access_token=${token}`);
  
  if (pages?.data) {
    pages.data.forEach((page, index) => {
      console.log(`\n📄 Page ${index + 1}:`);
      console.log(`   Name: ${page.name}`);
      console.log(`   ID: ${page.id}`);
      console.log(`   Access Token: ${page.access_token.substring(0, 50)}...`);
    });
    
    // Get Instagram accounts for each page
    console.log('\n\n📷 INSTAGRAM BUSINESS ACCOUNTS');
    console.log('═══════════════════════════════════════════════════════════');
    
    for (const page of pages.data) {
      const igAccount = await fetchGraphAPI(`${page.id}?fields=instagram_business_account&access_token=${page.access_token}`);
      
      if (igAccount?.instagram_business_account) {
        const igId = igAccount.instagram_business_account.id;
        const igDetails = await fetchGraphAPI(`${igId}?fields=username,profile_picture_url,followers_count&access_token=${page.access_token}`);
        
        console.log(`\n📸 Instagram Account (linked to ${page.name}):`);
        console.log(`   Username: @${igDetails.username}`);
        console.log(`   ID: ${igId}`);
        console.log(`   Followers: ${igDetails.followers_count}`);
        console.log(`   Access Token: ${page.access_token.substring(0, 50)}...`);
      } else {
        console.log(`\n⚠️  No Instagram account linked to ${page.name}`);
      }
    }
    
    // Get Threads accounts
    console.log('\n\n🧵 THREADS ACCOUNTS');
    console.log('═══════════════════════════════════════════════════════════');
    
    for (const page of pages.data) {
      const threadsAccount = await fetchGraphAPI(`${page.id}?fields=threads_profile&access_token=${page.access_token}`);
      
      if (threadsAccount?.threads_profile) {
        const threadsId = threadsAccount.threads_profile.id;
        const threadsDetails = await fetchGraphAPI(`${threadsId}?fields=username,threads_profile_picture_url&access_token=${page.access_token}`);
        
        console.log(`\n🧵 Threads Account (linked to ${page.name}):`);
        console.log(`   Username: @${threadsDetails.username}`);
        console.log(`   ID: ${threadsId}`);
        console.log(`   Access Token: ${page.access_token.substring(0, 50)}...`);
      } else {
        console.log(`\n⚠️  No Threads account linked to ${page.name}`);
      }
    }
  }
  
  // Summary
  console.log('\n\n📋 SUMMARY - UPDATE YOUR .env.local:');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('\n# Copy the IDs and tokens above into your .env.local file');
  console.log('# Use the Page Access Token (not the user token) for each platform');
  console.log('\n✅ Page Access Tokens are LONG-LIVED (60 days)');
  console.log('⚠️  Set a reminder to refresh tokens before they expire!\n');
}

main().catch(console.error);
