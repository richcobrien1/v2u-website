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

function parseEpisodeFromKey(key: string, size?: number, lastModified?: Date): R2Episode | null {
  if (key.endsWith('/') || key.endsWith('.keep') || !key.match(/\.(mp4|mov|avi|mkv)$/i)) {
    return null
  }

  const pathParts = key.split('/')
  const filename = pathParts[pathParts.length - 1]
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '')

  const isPremium = key.startsWith('private/') || key.includes('/private/')

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
    const prefixes = ['', 'private/']
    const client = getR2Client()
    if (!client) {
      console.warn('R2 client not configured, returning fallback episodes')
      return [
        {
          id: 'fallback-1',
          title: 'AI-Now Daily: October 2nd - Practical AI & Advanced Robotics',
          description: 'Deep dive into practical AI applications and cutting-edge robotics with Alex and Jessica.',
          duration: '45:32',
          publishDate: '2025-10-02',
          thumbnail: '/Ai-Now-Educate-YouTube.jpg',
          category: 'ai-now',
          audioUrl: '/api/r2/public/daily/landscape/2025/10/02/october-2-2025-ai-now---practical-ai-advanced-robotics---deep-dive-with-alex-and-jessica-216b7799.mp4',
          isPremium: false,
          isNew: true,
          r2Key: '2025/10/02/october-2-2025-ai-now---practical-ai-advanced-robotics---deep-dive-with-alex-and-jessica-216b7799.mp4',
        },
      ]
    }

    for (const prefix of prefixes) {
      const command = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: prefix,
        MaxKeys: 1000,
      })

      const response = await client.send(command)

      if (response.Contents) {
        for (const object of response.Contents) {
          if (object.Key) {
            const episode = parseEpisodeFromKey(object.Key, object.Size, object.LastModified)
            if (episode) {
              episodes.push(episode)
            }
          }
        }
      }
    }

    const uniqueEpisodes = episodes.filter((episode, index, self) =>
      index === self.findIndex(e => e.title === episode.title || e.r2Key === episode.r2Key)
    )

    uniqueEpisodes.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())

    console.log(`📺 Loaded ${uniqueEpisodes.length} unique episodes from R2 bucket: ${BUCKET_NAME} (filtered from ${episodes.length} total)`)
    return uniqueEpisodes
  } catch (error) {
    console.error('❌ Failed to fetch R2 episodes:', error)
    return [
      {
        id: 'fallback-1',
        title: 'AI-Now Daily: October 2nd - Practical AI & Advanced Robotics',
        description: 'Deep dive into practical AI applications and cutting-edge robotics with Alex and Jessica.',
        duration: '45:32',
        publishDate: '2025-10-02',
        thumbnail: '/Ai-Now-Educate-YouTube.jpg',
        category: 'ai-now',
        audioUrl: '/api/r2/public/daily/landscape/2025/10/02/october-2-2025-ai-now---practical-ai-advanced-robotics---deep-dive-with-alex-and-jessica-216b7799.mp4',
        isPremium: false,
        isNew: true,
        r2Key: '2025/10/02/october-2-2025-ai-now---practical-ai-advanced-robotics---deep-dive-with-alex-and-jessica-216b7799.mp4',
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

    const headCommand = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })

    const response = await client.send(headCommand)

    return parseEpisodeFromKey(
      key,
      response.ContentLength,
      response.LastModified
    )
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

    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
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

