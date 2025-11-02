import { S3Client, ListObjectsV2Command, HeadObjectCommand } from '@aws-sdk/client-s3'

export interface R2Episode {
  id: string
  title: string
  description: string
  duration: string
  publishDate: string
  thumbnail: string
  thumbnailFallbacks?: string[]
  category: 'ai-now' | 'ai-now-educate' | 'ai-now-commercial' | 'ai-now-conceptual' | 'ai-now-reviews'
  isPremium: boolean
  audioUrl: string
  isNew?: boolean
  r2Key: string
  fileSize?: number
  lastModified?: string
}

function getR2Client(): S3Client | null {
  const endpoint = process.env.R2_ENDPOINT
  const accessKeyId = process.env.R2_ACCESS_KEY
  const secretAccessKey = process.env.R2_SECRET_KEY

  if (process.env.NODE_ENV === 'production') {
    console.log('[R2 DEBUG] ENV', {
      R2_ENDPOINT: endpoint,
      R2_ACCESS_KEY: accessKeyId,
      R2_SECRET_KEY: secretAccessKey,
      R2_BUCKET: process.env.R2_BUCKET,
      R2_BUCKET_PRIVATE: process.env.R2_BUCKET_PRIVATE,
      R2_BUCKET_PUBLIC: process.env.R2_BUCKET_PUBLIC,
    })
  }

  const NO_MOCKS = process.env.NO_MOCKS === 'true'

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    const msg = 'R2 env not fully configured: endpoint or credentials missing'
    if (NO_MOCKS) throw new Error(msg)
    console.warn(msg)
    return null
  }

  return new S3Client({
    region: 'auto',
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: true,
  })
}

const BUCKET_NAME = process.env.R2_BUCKET || 'public'
const PRIVATE_BUCKET_NAME = process.env.R2_BUCKET_PRIVATE || 'private'
const PUBLIC_BUCKET_NAME = process.env.R2_BUCKET_PUBLIC || 'public'

function generateThumbnailUrl(key: string, isPremium: boolean): string {
  return isPremium ? '/v2u-premium.jpg' : '/v2u-standard.jpg'
}

function getThumbnailFallbacks(key: string, category: string): string[] {
  const basePath = key.replace(/\.(mp4|mov|avi|mkv)$/i, '')
  const apiPath = key.includes('/private/') ? 'private' : 'public'
  const safeCategory = (category || 'ai-now') as string

  const categoryFirstFallback = `/api/r2/${apiPath}/${basePath}-${safeCategory}.jpg`
  return [
    categoryFirstFallback,
    '/v2u-standard.jpg',
    '/v2u-premium.jpg',
    '/v2u.png',
    '/Ai-Now-Educate-YouTube.jpg',
    `/api/r2/${apiPath}/${basePath}.jpg`,
    `/api/r2/${apiPath}/${basePath}.jpeg`,
    `/api/r2/${apiPath}/${basePath}.png`,
  ]
}

function parseEpisodeFromKey(
  key: string, 
  size?: number, 
  lastModified?: Date, 
  forcePremium?: boolean,
  bucketName?: string
): R2Episode | null {
  if (key.endsWith('/') || key.endsWith('.keep') || !key.match(/\.(mp4|mov|avi|mkv)$/i)) {
    return null
  }

  const pathParts = key.split('/')
  const filename = pathParts[pathParts.length - 1]
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '')

  // Determine if premium based on explicit parameter, bucket name, or path
  const isPremium = forcePremium ?? (
    bucketName === PRIVATE_BUCKET_NAME || 
    bucketName === 'private' || 
    key.startsWith('private/') || 
    key.includes('/private/')
  )

  let category: R2Episode['category'] = 'ai-now'
  if (key.includes('educate')) category = 'ai-now-educate'
  else if (key.includes('commercial')) category = 'ai-now-commercial'
  else if (key.includes('conceptual')) category = 'ai-now-conceptual'
  else if (key.includes('reviews')) category = 'ai-now-reviews'

  let publishDate = new Date().toISOString().split('T')[0]
  const dateMatch = key.match(/(\d{4})\/(\d{2})\/(\d{2})/)
  if (dateMatch) {
    publishDate = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`
  }

  const title = nameWithoutExt
    .replace(/^\d{4}-\d{2}-\d{2}-/, '')
    .replace(/-+/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .replace(/\s+/g, ' ')
    .replace(/\s+[a-f0-9]{8,}$/i, '')
    .replace(/\s+\d+$/, '')
    .trim()

  const description = `${category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} episode: ${title}`

  let duration = '30:00'
  if (size) {
    const estimatedMinutes = Math.round(size / (1024 * 1024))
    const minutes = estimatedMinutes % 60
    const hours = Math.floor(estimatedMinutes / 60)
    duration = hours > 0 ? `${hours}:${minutes.toString().padStart(2, '0')}:00` : `${minutes}:00`
  }

  const isNew = lastModified ? Date.now() - lastModified.getTime() < 7 * 24 * 60 * 60 * 1000 : false

  const apiPath = isPremium ? 'private' : 'public'
  const cleanKey = isPremium ? key.replace(/^private\//, '') : key
  const audioUrl = `/api/r2/${apiPath}/${cleanKey}`

  const thumbnailUrl = generateThumbnailUrl(key, isPremium)
  const thumbnailFallbacks = getThumbnailFallbacks(key, category)

  return {
    id: btoa(key),
    title,
    description,
    duration,
    publishDate,
    thumbnail: thumbnailUrl,
    thumbnailFallbacks,
    category,
    isPremium,
    audioUrl,
    isNew,
    r2Key: key,
    fileSize: size,
    lastModified: lastModified?.toISOString(),
  }
}

export async function fetchR2Episodes(): Promise<R2Episode[]> {
  try {
    const episodes: R2Episode[] = []
    const client = getR2Client()
    if (!client) {
      console.warn('R2 client not configured, returning fallback episodes')
      return [
        {
          id: 'fallback-1',
          title: 'AI-Now Daily: November 2nd - Latest AI Developments',
          description: 'Deep dive into practical AI applications and cutting-edge robotics with Alex and Jessica.',
          duration: '45:32',
          publishDate: '2025-11-02',
          thumbnail: '/Ai-Now-Educate-YouTube.jpg',
          category: 'ai-now',
          audioUrl: '/api/r2/public/daily/landscape/2025/11/02/november-2-2025-ai-now---latest-ai-developments.mp4',
          isPremium: false,
          isNew: true,
          r2Key: '2025/11/02/november-2-2025-ai-now---latest-ai-developments.mp4',
          lastModified: new Date().toISOString(),
        },
      ]
    }

    // Fetch from both public and private buckets
    const bucketConfigs = [
      { bucket: PUBLIC_BUCKET_NAME, isPremium: false },
      { bucket: PRIVATE_BUCKET_NAME, isPremium: true },
    ]

    for (const { bucket, isPremium } of bucketConfigs) {
      try {
        const command = new ListObjectsV2Command({
          Bucket: bucket,
          MaxKeys: 1000,
        })

        const response = await client.send(command)

        if (response.Contents) {
          console.log(`📺 Fetching from bucket '${bucket}' (isPremium: ${isPremium}), found ${response.Contents.length} objects`)
          
          // Filter valid objects and process them (sorting will be done later for all episodes combined)
          const validContents = response.Contents.filter(obj => obj.Key && obj.LastModified)
          
          for (const object of validContents) {
            if (object.Key) {
              // Pass the bucket name to parseEpisodeFromKey so it can build correct URLs
              const episode = parseEpisodeFromKey(object.Key, object.Size, object.LastModified, isPremium, bucket)
              if (episode) {
                episodes.push(episode)
                if (episodes.length <= 3) {
                  console.log(`  Sample episode: ${episode.title} | isPremium: ${episode.isPremium} | URL: ${episode.audioUrl} | Last Modified: ${episode.lastModified}`)
                }
              }
            }
          }
        }
        console.log(`📺 Loaded ${response.Contents?.length || 0} files from ${bucket} bucket (isPremium: ${isPremium})`)
      } catch (bucketError) {
        console.warn(`⚠️ Could not access bucket ${bucket}:`, bucketError)
        // Continue with other buckets even if one fails
      }
    }

    // Remove duplicates based on title or r2Key
    const uniqueEpisodes = episodes.filter((episode, index, self) =>
      index === self.findIndex(e => e.title === episode.title || e.r2Key === episode.r2Key)
    )

    // Sort ALL episodes (both public and private) by LastModified date first, then by publishDate as fallback
    uniqueEpisodes.sort((a, b) => {
      // Primary sort: use actual LastModified date from R2 if available
      if (a.lastModified && b.lastModified) {
        return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
      }
      
      // Fallback sort: use publishDate (parsed from path)
      return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    })

    // Debug: Show first few episodes with their dates and type (public/private)
    if (uniqueEpisodes.length > 0) {
      console.log(`📅 First 5 episodes after sorting (latest first, mixed public/private):`)
      uniqueEpisodes.slice(0, 5).forEach((ep, idx) => {
        const type = ep.isPremium ? 'PRIVATE' : 'PUBLIC'
        console.log(`  ${idx + 1}. [${type}] ${ep.title.substring(0, 40)}... | Last Modified: ${ep.lastModified || 'N/A'} | Publish Date: ${ep.publishDate}`)
      })
    }

    console.log(`📺 Loaded ${uniqueEpisodes.length} unique episodes from R2 bucket: ${BUCKET_NAME} (filtered from ${episodes.length} total)`)
    return uniqueEpisodes
  } catch (error) {
    console.error('❌ Failed to fetch R2 episodes:', error)
    return [
      {
        id: 'fallback-1',
        title: 'AI-Now Daily: November 2nd - Latest AI Developments',
        description: 'Deep dive into practical AI applications and cutting-edge robotics with Alex and Jessica.',
        duration: '45:32',
        publishDate: '2025-11-02',
        thumbnail: '/Ai-Now-Educate-YouTube.jpg',
        category: 'ai-now',
        audioUrl: '/api/r2/public/daily/landscape/2025/11/02/november-2-2025-ai-now---latest-ai-developments.mp4',
        isPremium: false,
        isNew: true,
        r2Key: '2025/11/02/november-2-2025-ai-now---latest-ai-developments.mp4',
        lastModified: new Date().toISOString(),
      },
    ]
  }
}

// Get episode by ID
export async function getR2Episode(id: string): Promise<R2Episode | null> {
  try {
    const key = atob(id)
    const client = getR2Client()
    if (!client) return null

    // Try both buckets to find the episode
    const bucketsToTry = [
      { name: PUBLIC_BUCKET_NAME, isPremium: false },
      { name: PRIVATE_BUCKET_NAME, isPremium: true }
    ]

    for (const { name: bucketName, isPremium } of bucketsToTry) {
      try {
        const headCommand = new HeadObjectCommand({
          Bucket: bucketName,
          Key: key,
        })

        const response = await client.send(headCommand)

        return parseEpisodeFromKey(
          key,
          response.ContentLength,
          response.LastModified,
          isPremium,
          bucketName
        )
      } catch {
        // Try next bucket
        continue
      }
    }

    return null
  } catch (error) {
    console.error('❌ Failed to get R2 episode:', error)
    return null
  }
}

// Check if R2 is properly configured
export async function checkR2Configuration(): Promise<boolean> {
  try {
    const client = getR2Client()
    if (!client) return false

    // Try to access the public bucket as a basic check
    const command = new ListObjectsV2Command({
      Bucket: PUBLIC_BUCKET_NAME,
      MaxKeys: 1,
    })

    await client.send(command)
    return true
  } catch (error) {
    console.error('❌ R2 configuration check failed:', error)
    return false
  }
}

// Get episodes visible to a user based on subscription
export async function getVisibleEpisodes(userSubscription: 'free' | 'premium'): Promise<R2Episode[]> {
  const allEpisodes = await fetchR2Episodes()

  return allEpisodes.filter(ep => {
    return !ep.isPremium || userSubscription === 'premium'
  })
}

