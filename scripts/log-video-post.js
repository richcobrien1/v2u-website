#!/usr/bin/env node

/**
 * Log Video Posting to Cloudflare KV
 * 
 * Usage:
 *   node scripts/log-video-post.js --platform youtube --status success --title "AI News Daily" --url "https://..."
 *   node scripts/log-video-post.js --platform youtube --status failed --title "AI News Daily" --error "Upload failed"
 */

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || "d54e57481e824e8752d0f6caa9b37ba7"
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || "4brdJznMqITcyxQ1gBArpwpfNJMrb-p2Ps5jzR3k"
const NAMESPACE_ID = process.env.CLOUDFLARE_KV_NAMESPACE_ID || "3c40aed9e67b479eb28a271c547e43d4"

// Parse command line arguments
function parseArgs() {
  const args = {}
  for (let i = 2; i < process.argv.length; i += 2) {
    const key = process.argv[i].replace(/^--/, '')
    const value = process.argv[i + 1]
    args[key] = value
  }
  return args
}

async function logToKV(entry) {
  const today = new Date().toISOString().split('T')[0]
  const key = `automation:log:${today}`
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${NAMESPACE_ID}/values/${key}`
  
  console.log(`📝 Logging to KV for date: ${today}`)
  
  try {
    // First, get existing log
    const getResponse = await fetch(url, {
      headers: { 'Authorization': `Bearer ${API_TOKEN}` }
    })
    
    let existingLog = {
      entries: [],
      summary: { total: 0, success: 0, failed: 0, active: 0 }
    }
    
    if (getResponse.ok) {
      existingLog = await getResponse.json()
      console.log(`✓ Found existing log with ${existingLog.entries.length} entries`)
    } else {
      console.log(`ℹ Creating new log for today`)
    }
    
    // Add new entry
    const newEntry = {
      timestamp: new Date().toISOString(),
      ...entry
    }
    
    existingLog.entries.push(newEntry)
    
    // Update summary
    existingLog.summary.total++
    if (entry.status === 'success') existingLog.summary.success++
    else if (entry.status === 'failed') existingLog.summary.failed++
    else if (entry.status === 'active') existingLog.summary.active++
    
    // Save back to KV
    const putResponse = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(existingLog)
    })
    
    if (putResponse.ok) {
      console.log(`✓ Successfully logged to KV`)
      console.log(`  Total entries: ${existingLog.entries.length}`)
      console.log(`  Summary:`, existingLog.summary)
      return true
    } else {
      const errorText = await putResponse.text()
      console.error(`✗ Failed to save to KV:`, errorText)
      return false
    }
  } catch (error) {
    console.error(`✗ Error:`, error.message)
    return false
  }
}

async function main() {
  const args = parseArgs()
  
  if (!args.platform || !args.status || !args.title) {
    console.error(`
Usage:
  node scripts/log-video-post.js --platform PLATFORM --status STATUS --title TITLE [OPTIONS]

Required:
  --platform   Platform name (youtube, facebook, twitter, etc.)
  --status     Status: success, failed, or active
  --title      Video title

Optional:
  --url        Video URL (required for success)
  --videoId    Video ID
  --error      Error message (for failed status)
  --details    Additional JSON details

Examples:
  node scripts/log-video-post.js --platform youtube --status success --title "AI News Daily Jan 14" --url "https://youtube.com/watch?v=..."
  node scripts/log-video-post.js --platform facebook --status failed --title "AI News Daily Jan 14" --error "API quota exceeded"
  node scripts/log-video-post.js --platform twitter --status active --title "AI News Daily Jan 14"
    `)
    process.exit(1)
  }

  console.log(`\n🎥 Video Posting Log`)
  console.log(`Platform: ${args.platform}`)
  console.log(`Status: ${args.status}`)
  console.log(`Title: ${args.title}`)
  
  const entry = {
    platform: args.platform,
    status: args.status,
    videoTitle: args.title,
    videoUrl: args.url,
    videoId: args.videoId,
    error: args.error,
    details: args.details ? JSON.parse(args.details) : { loggedBy: 'manual-script' }
  }

  const success = await logToKV(entry)
  process.exit(success ? 0 : 1)
}

main()
