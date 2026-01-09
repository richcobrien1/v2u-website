/**
 * Cloudflare KV Storage Utility
 * Provides encrypted credential storage and retrieval
 * Uses Cloudflare KV REST API (works on Vercel and locally)
 */

import fs from 'fs'
import path from 'path'

interface KVNamespace {
  get(key: string): Promise<string | null>
  put(key: string, value: string): Promise<void>
  delete(key: string): Promise<void>
  list(options?: { prefix?: string }): Promise<{ keys: Array<{ name: string }> }>
}

// Local fallback storage for development
const LOCAL_STORAGE_PATH = path.join(process.cwd(), '.v2u-mock-kv.json')

function readLocalStorage(): Record<string, string> {
  try {
    if (fs.existsSync(LOCAL_STORAGE_PATH)) {
      return JSON.parse(fs.readFileSync(LOCAL_STORAGE_PATH, 'utf-8'))
    }
  } catch (err) {
    console.error('Error reading local storage:', err)
  }
  return {}
}

function writeLocalStorage(data: Record<string, string>): void {
  try {
    fs.writeFileSync(LOCAL_STORAGE_PATH, JSON.stringify(data, null, 2), 'utf-8')
  } catch (err) {
    console.error('Error writing local storage:', err)
  }
}

// Encryption utilities
async function encrypt(text: string, key: string): Promise<string> {
  // Simple base64 encoding for now - TODO: implement proper encryption
  const combined = `${key}:${text}`
  return Buffer.from(combined).toString('base64')
}

async function decrypt(encrypted: string, key: string): Promise<string> {
  // Simple base64 decoding for now - TODO: implement proper decryption
  const decoded = Buffer.from(encrypted, 'base64').toString('utf-8')
  const parts = decoded.split(':')
  if (parts[0] !== key) {
    throw new Error('Decryption failed: invalid key')
  }
  return parts.slice(1).join(':')
}

export class KVStorage {
  private kv: KVNamespace | null = null
  private encryptionKey: string
  private useCloudflareAPI: boolean
  private cfAccountId: string
  private cfApiToken: string
  private cfNamespaceId: string

  constructor() {
    // Check for Cloudflare KV REST API credentials
    this.cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID || ''
    this.cfApiToken = process.env.CLOUDFLARE_API_TOKEN || ''
    this.cfNamespaceId = process.env.CLOUDFLARE_KV_NAMESPACE_ID || ''
    this.useCloudflareAPI = !!(this.cfAccountId && this.cfApiToken && this.cfNamespaceId)
    
    // Fallback to Cloudflare Workers KV binding if available
    this.kv = (process.env as { V2U_KV?: KVNamespace }).V2U_KV || null
    this.encryptionKey = process.env.KV_ENCRYPTION_KEY || 'default-key-change-me'
    
    if (this.useCloudflareAPI) {
      console.log('Using Cloudflare KV REST API for storage')
    } else if (this.kv) {
      console.log('Using Cloudflare KV binding for storage')
    } else {
      console.log('Using local file storage for development')
    }
  }

  /**
   * Get value from Cloudflare KV via REST API
   */
  private async cfGet(key: string): Promise<string | null> {
    try {
      const safeKey = encodeURIComponent(key)
      const url = `https://api.cloudflare.com/client/v4/accounts/${this.cfAccountId}/storage/kv/namespaces/${this.cfNamespaceId}/values/${safeKey}`
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.cfApiToken}`
        }
      })
      
      if (response.status === 404) return null
      if (!response.ok) {
        console.error('Cloudflare KV GET failed:', response.statusText)
        return null
      }
      
      return await response.text()
    } catch (err) {
      console.error('Error reading from Cloudflare KV:', err)
      return null
    }
  }

  /**
   * Put value to Cloudflare KV via REST API
   */
  private async cfPut(key: string, value: string): Promise<void> {
    try {
      const safeKey = encodeURIComponent(key)
      const url = `https://api.cloudflare.com/client/v4/accounts/${this.cfAccountId}/storage/kv/namespaces/${this.cfNamespaceId}/values/${safeKey}`
      console.log('Cloudflare KV PUT:', { key, safeKey, url: url.substring(0, 120) + '...' , valueLength: value.length })

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.cfApiToken}`,
          'Content-Type': 'text/plain'
        },
        body: value
      })

      const respText = await response.text()
      if (!response.ok) {
        console.error('Cloudflare KV PUT failed:', {
          status: response.status,
          statusText: response.statusText,
          body: respText.slice(0, 2000)
        })
        throw new Error(`Cloudflare KV PUT failed: ${response.status} ${response.statusText} - ${respText.slice(0,200)}`)
      }

      console.log('Cloudflare KV PUT success:', { key, status: response.status, bodySnippet: respText.slice(0,200) })
    } catch (err) {
      console.error('Error writing to Cloudflare KV:', err)
      throw err
    }
  }

  /**
   * Delete value from Cloudflare KV via REST API
   */
  private async cfDelete(key: string): Promise<void> {
    try {
      const safeKey = encodeURIComponent(key)
      const url = `https://api.cloudflare.com/client/v4/accounts/${this.cfAccountId}/storage/kv/namespaces/${this.cfNamespaceId}/values/${safeKey}`
      console.log('Cloudflare KV DELETE:', { key, safeKey })

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.cfApiToken}`
        }
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Cloudflare KV DELETE failed:', { status: response.status, statusText: response.statusText, body: errorText.slice(0,200) })
        // Don't throw on 404 - it's already deleted
        if (response.status !== 404) {
          throw new Error(`Cloudflare KV DELETE failed: ${response.status} ${errorText}`)
        }
      }
      
      console.log('Cloudflare KV DELETE success:', key)
    } catch (err) {
      console.error('Error deleting from Cloudflare KV:', err)
      throw err
    }
  }

  /**
   * Save credentials for a platform
   */
  async saveCredentials(
    level: 1 | 2,
    platformId: string,
    credentials: Record<string, string>,
    enabled = true,
    validated = false
  ): Promise<void> {
    const key = `automation:level${level}:${platformId}`
    
    // Get existing credentials first to merge
    const existing = await this.getCredentials(level, platformId)
    
    // Merge new credentials with existing ones (new values override)
    // But skip masked/configured values from frontend - keep existing values for those
    const mergedCredentials: Record<string, string> = { ...(existing?.credentials || {}) }
    
    for (const [key, value] of Object.entries(credentials)) {
      // Skip masked/configured values - keep the existing value
      if (value === '(configured)' || value === '***' || value.startsWith('••••••••')) {
        console.log(`Skipping masked value for ${key}, keeping existing`)
        continue
      }
      // Update with new value (or empty string to clear)
      mergedCredentials[key] = value
    }
    
    const data = {
      credentials: mergedCredentials,
      enabled,
      configured: Object.keys(mergedCredentials).length > 0,
      validated,
      validatedAt: validated ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString()
    }
    const jsonData = JSON.stringify(data)

    console.log(`Saving credentials for ${platformId}:`, {
      level,
      useCloudflareAPI: this.useCloudflareAPI,
      hasKVBinding: !!this.kv,
      existingCredentialKeys: Object.keys(existing?.credentials || {}),
      newCredentialKeys: Object.keys(credentials),
      mergedCredentialKeys: Object.keys(mergedCredentials)
    })

    // Use Cloudflare KV REST API
    if (this.useCloudflareAPI) {
      try {
        await this.cfPut(key, jsonData)
        console.log(`✅ Saved to Cloudflare KV: ${key}`)
        return
      } catch (err) {
        console.error('Failed to save to Cloudflare KV, falling back to local storage', err)
        // Fall through to local storage
      }
    }

    // Use Cloudflare KV binding if available
    if (this.kv) {
      const encrypted = await encrypt(jsonData, this.encryptionKey)
      await this.kv.put(key, encrypted)
      console.log(`✅ Saved to KV binding: ${key}`)
      return
    }

    // Fallback to local storage in development
    console.warn('Using local file storage')
    const storage = readLocalStorage()
    storage[key] = jsonData
    writeLocalStorage(storage)
    console.log(`✅ Saved to local file: ${key}`)
  }

  /**
   * Get credentials for a platform
   */
  async getCredentials(
    level: 1 | 2,
    platformId: string
  ): Promise<{ credentials: Record<string, string>; enabled: boolean; configured: boolean; validated?: boolean; validatedAt?: string } | null> {
    const key = `automation:level${level}:${platformId}`
    
    // Use Cloudflare KV REST API
    if (this.useCloudflareAPI) {
      const data = await this.cfGet(key)
      return data ? JSON.parse(data) : null
    }

    // Use Cloudflare KV binding if available
    if (this.kv) {
      const encrypted = await this.kv.get(key)
      if (!encrypted) return null
      const decrypted = await decrypt(encrypted, this.encryptionKey)
      return JSON.parse(decrypted)
    }

    // Fallback to local storage in development
    console.warn('Using local file storage')
    const storage = readLocalStorage()
    const data = storage[key]
    return data ? JSON.parse(data) : null
  }

  /**
   * Get all Level 1 platform configurations
   */
  async getLevel1Config(): Promise<Record<string, { 
    credentials: Record<string, string>; 
    enabled: boolean; 
    configured: boolean;
    validated?: boolean;
    validatedAt?: string;
  }>> {
    const platforms = ['youtube', 'rumble', 'spotify']
    const config: Record<string, { credentials: Record<string, string>; enabled: boolean; configured: boolean; validated?: boolean; validatedAt?: string }> = {}

    for (const platform of platforms) {
      const kvData = await this.getCredentials(1, platform)

      // Merge KV data with environment variables as a fallback so Level1
      // platforms can be enabled via env vars (useful for Vercel deployments)
      let credentials: Record<string, string> = kvData?.credentials || {}
      const enabled = kvData?.enabled ?? true
      const validated = kvData?.validated ?? false
      const validatedAt = kvData?.validatedAt

      switch (platform) {
        case 'youtube':
          credentials = {
            apiKey: credentials.apiKey || process.env.YOUTUBE_API_KEY || '',
            channelId: credentials.channelId || process.env.YOUTUBE_CHANNEL_ID || ''
          }
          break
        case 'rumble':
          credentials = {
            channelUrl: credentials.channelUrl || process.env.RUMBLE_CHANNEL_URL || ''
          }
          break
        case 'spotify':
          credentials = {
            showId: credentials.showId || process.env.SPOTIFY_SHOW_ID || '',
            accessToken: credentials.accessToken || process.env.SPOTIFY_ACCESS_TOKEN || ''
          }
          break
      }

      // Only include platforms with credentials (either in KV or env)
      if (Object.values(credentials).some(v => v && v !== '')) {
        config[platform] = {
          credentials,
          enabled,
          configured: true,
          validated,
          validatedAt
        }
      }
    }

    return config
  }

  /**
   * Get all Level 2 platform configurations
   * Merges KV storage with environment variables
   */
  async getLevel2Config(): Promise<Record<string, { 
    credentials: Record<string, string>; 
    enabled: boolean; 
    configured: boolean;
    validated?: boolean;
    validatedAt?: string;
  }>> {
    const platforms = ['twitter', 'twitter-ainow', 'facebook', 'facebook-ainow', 'linkedin', 'instagram', 'threads', 'tiktok', 'odysee', 'vimeo', 'bluesky']
    const config: Record<string, { credentials: Record<string, string>; enabled: boolean; configured: boolean; validated?: boolean; validatedAt?: string }> = {}

    for (const platform of platforms) {
      const kvData = await this.getCredentials(2, platform)
      
      // Merge KV data with environment variables
      let credentials: Record<string, string> = kvData?.credentials || {}
      const enabled = kvData?.enabled ?? true
      const validated = kvData?.validated ?? false
      const validatedAt = kvData?.validatedAt
      
      // Override with environment variables if available
      switch (platform) {
        case 'twitter':
          credentials = {
            appKey: credentials.appKey || process.env.TWITTER_API_KEY_V2U || '',
            appSecret: credentials.appSecret || process.env.TWITTER_API_SECRET_V2U || '',
            accessToken: credentials.accessToken || process.env.TWITTER_ACCESS_TOKEN_V2U || '',
            accessSecret: credentials.accessSecret || process.env.TWITTER_ACCESS_SECRET_V2U || ''
          }
          break
        case 'twitter-ainow':
          credentials = {
            appKey: credentials.appKey || process.env.TWITTER_API_KEY_AI || '',
            appSecret: credentials.appSecret || process.env.TWITTER_API_SECRET_AI || '',
            accessToken: credentials.accessToken || process.env.TWITTER_ACCESS_TOKEN_AI || '',
            accessSecret: credentials.accessSecret || process.env.TWITTER_ACCESS_SECRET_AI || ''
          }
          break
        case 'facebook':
          credentials = {
            pageId: credentials.pageId || process.env.FACEBOOK_PAGE_ID_V2U || '',
            pageAccessToken: credentials.pageAccessToken || process.env.FACEBOOK_ACCESS_TOKEN_V2U || ''
          }
          break
        case 'facebook-ainow':
          credentials = {
            pageId: credentials.pageId || process.env.FACEBOOK_PAGE_ID_AI || '',
            pageAccessToken: credentials.pageAccessToken || process.env.FACEBOOK_ACCESS_TOKEN_AI || ''
          }
          break
        case 'linkedin':
          credentials = {
            clientId: credentials.clientId || process.env.LINKEDIN_CLIENT_ID || '',
            clientSecret: credentials.clientSecret || process.env.LINKEDIN_CLIENT_SECRET || '',
            accessToken: credentials.accessToken || process.env.LINKEDIN_ACCESS_TOKEN || '',
            personUrn: credentials.personUrn || process.env.LINKEDIN_PERSON_URN || '',
            organizationUrn: credentials.organizationUrn || ''
          }
          break
        case 'instagram':
        case 'instagram-ainow':
          credentials = {
            accessToken: credentials.accessToken || process.env.INSTAGRAM_ACCESS_TOKEN || '',
            userId: credentials.userId || '',
            username: credentials.username || ''
          }
          break
        case 'threads':
          credentials = {
            accessToken: credentials.accessToken || process.env.THREADS_ACCESS_TOKEN || '',
            userId: credentials.userId || process.env.THREADS_USER_ID || ''
          }
          break
        case 'tiktok':
          credentials = {
            url: credentials.url || process.env.TIKTOK_URL || ''
          }
          break
        case 'odysee':
          credentials = {
            url: credentials.url || process.env.ODYSEE_URL || ''
          }
          break
        case 'vimeo':
          credentials = {
            url: credentials.url || process.env.VIMEO_URL || ''
          }
          break
        case 'bluesky':
          credentials = {
            username: credentials.username || process.env.BLUESKY_USERNAME || '',
            appPassword: credentials.appPassword || process.env.BLUESKY_APP_PASSWORD || '',
            did: credentials.did || '',
            handle: credentials.handle || ''
          }
          break
      }
      
      // Only include platforms with credentials
      if (Object.values(credentials).some(v => v && v !== '')) {
        config[platform] = {
          credentials,
          enabled,
          configured: true,
          validated,
          validatedAt
        }
      }
    }

    return config
  }

  /**
   * Save automation status
   */
  async saveStatus(status: {
    running: boolean
    lastCheck: string | null
    nextCheck: string | null
    checksToday: number
  }): Promise<void> {
    const key = 'automation:status'
    const data = JSON.stringify(status)

    if (this.useCloudflareAPI) {
      await this.cfPut(key, data)
      return
    }

    if (this.kv) {
      await this.kv.put(key, data)
      return
    }

    const storage = readLocalStorage()
    storage[key] = data
    writeLocalStorage(storage)
  }

  /**
   * Get automation status
   */
  async getStatus(): Promise<{
    running: boolean
    lastCheck: string | null
    nextCheck: string | null
    checksToday: number
  } | null> {
    const key = 'automation:status'

    if (this.useCloudflareAPI) {
      const data = await this.cfGet(key)
      return data ? JSON.parse(data) : null
    }

    if (this.kv) {
      const data = await this.kv.get(key)
      return data ? JSON.parse(data) : null
    }

    const storage = readLocalStorage()
    return storage[key] ? JSON.parse(storage[key]) : null
  }

  /**
   * Save schedule configuration
   */
  async saveSchedule(schedule: {
    hour: number
    minute: number
    timezone: string
  }): Promise<void> {
    if (!this.kv) {
      console.warn('KV not available')
      return
    }

    await this.kv.put('automation:schedule', JSON.stringify(schedule))
  }

  /**
   * Get schedule configuration
   */
  async getSchedule(): Promise<{
    hour: number
    minute: number
    timezone: string
  } | null> {
    if (!this.kv) {
      return null
    }

    const data = await this.kv.get('automation:schedule')
    return data ? JSON.parse(data) : null
  }

  /**
   * Check if a video has been posted
   */
  async hasPostedVideo(videoId: string): Promise<boolean> {
    const key = `posted:youtube:${videoId}`
    
    if (this.useCloudflareAPI) {
      const data = await this.cfGet(key)
      return !!data
    }
    
    if (this.kv) {
      const data = await this.kv.get(key)
      return !!data
    }
    
    const storage = readLocalStorage()
    return !!storage[key]
  }

  /**
   * Get posted video information with timestamp
   */
  async getPostedVideoInfo(videoId: string): Promise<{ videoId: string; postedAt: string } | null> {
    const key = `posted:youtube:${videoId}`
    
    if (this.useCloudflareAPI) {
      const data = await this.cfGet(key)
      return data ? JSON.parse(data) : null
    }
    
    if (this.kv) {
      const data = await this.kv.get(key)
      return data ? JSON.parse(data) : null
    }
    
    const storage = readLocalStorage()
    return storage[key] ? JSON.parse(storage[key]) : null
  }

  /**
   * Mark a video as posted
   */
  async markVideoAsPosted(videoId: string): Promise<void> {
    const key = `posted:youtube:${videoId}`
    const data = JSON.stringify({
      videoId,
      postedAt: new Date().toISOString()
    })

    if (this.useCloudflareAPI) {
      await this.cfPut(key, data)
      return
    }

    if (this.kv) {
      await this.kv.put(key, data)
      return
    }

    const storage = readLocalStorage()
    storage[key] = data
    writeLocalStorage(storage)
  }

  /**
   * Save post result for display in admin panel
   */
  async savePostResult(platformId: string, result: {
    success: boolean;
    error?: string;
    postUrl?: string;
    timestamp: string;
  }): Promise<void> {
    const key = `post-result:${platformId}`
    const data = JSON.stringify(result)

    // Try Cloudflare REST API first (best-effort). If it fails, fall back
    // to KV binding or local file storage and DO NOT throw so callers
    // (e.g. manual-post) don't return 500 just because persistence failed.
    if (this.useCloudflareAPI) {
      try {
        await this.cfPut(key, data)
        return
      } catch (err) {
        // cfPut already logs details; ensure we record the fallback path
        console.error('cfPut failed for savePostResult, falling back to binding/local:', { key, err })
        // Fall through to other storage options
      }
    }

    // Use Cloudflare KV binding if available
    if (this.kv) {
      try {
        await this.kv.put(key, data)
        console.log(`✅ Saved to KV binding (fallback): ${key}`)
        return
      } catch (err) {
        console.error('KV binding put failed for savePostResult, falling back to local file:', { key, err })
        // Fall through to local storage
      }
    }

    // Fallback to local storage in development or if all else fails
    try {
      const storage = readLocalStorage()
      storage[key] = data
      writeLocalStorage(storage)
      console.log(`✅ Saved post result to local file (fallback): ${key}`)
    } catch (err) {
      console.error('Failed to persist post result to any storage:', { key, err })
    }
  }

  /**
   * Get post result for a platform
   */
  async getPostResult(platformId: string): Promise<{
    success: boolean;
    error?: string;
    postUrl?: string;
    timestamp: string;
  } | null> {
    const key = `post-result:${platformId}`
    let data: string | null = null

    if (this.useCloudflareAPI) {
      data = await this.cfGet(key)
    } else if (this.kv) {
      data = await this.kv.get(key)
    } else {
      const storage = readLocalStorage()
      data = storage[key] || null
    }

    if (!data) return null

    try {
      return JSON.parse(data)
    } catch (err) {
      console.error('Error parsing post result:', err)
      return null
    }
  }

  /**
   * Clear post result for a platform (used when re-validating credentials)
   */
  async clearPostResult(platformId: string): Promise<void> {
    const key = `post-result:${platformId}`

    if (this.useCloudflareAPI) {
      await this.cfDelete(key)
      return
    }

    if (this.kv) {
      await this.kv.delete(key)
      return
    }

    const storage = readLocalStorage()
    delete storage[key]
    writeLocalStorage(storage)
  }

  /**
   * Get latest episode metadata
   */
  async getLatestEpisode(): Promise<Record<string, unknown> | null> {
    const key = 'latest-episode'
    let data: string | null = null

    if (this.useCloudflareAPI) {
      data = await this.cfGet(key)
    } else if (this.kv) {
      data = await this.kv.get(key)
    } else {
      const storage = readLocalStorage()
      data = storage[key] || null
    }

    if (!data) return null

    try {
      return JSON.parse(data)
    } catch (err) {
      console.error('Error parsing episode metadata:', err)
      return null
    }
  }

  /**
   * Save latest episode metadata
   */
  async saveLatestEpisode(episode: Record<string, unknown>): Promise<void> {
    const key = 'latest-episode'
    const data = JSON.stringify(episode)

    if (this.useCloudflareAPI) {
      await this.cfPut(key, data)
      return
    }

    if (this.kv) {
      await this.kv.put(key, data)
      return
    }

    const storage = readLocalStorage()
    storage[key] = data
    writeLocalStorage(storage)
  }

  /**
   * Generic get method for arbitrary data
   */
  async get<T>(key: string): Promise<T | null> {
    let data: string | null = null

    if (this.useCloudflareAPI) {
      data = await this.cfGet(key)
    } else if (this.kv) {
      data = await this.kv.get(key)
    } else {
      const storage = readLocalStorage()
      data = storage[key] || null
    }

    if (!data) return null

    try {
      return JSON.parse(data) as T
    } catch (err) {
      console.error(`Error parsing data for key ${key}:`, err)
      return null
    }
  }

  /**
   * Generic set method for arbitrary data
   */
  async set<T>(key: string, value: T): Promise<void> {
    const data = JSON.stringify(value)
    // Try Cloudflare KV REST API first (best-effort). If it fails, fall
    // back to KV binding or local file storage and DO NOT throw so callers
    // (e.g. addLogEntry) don't lose execution due to persistence problems.
    if (this.useCloudflareAPI) {
      try {
        await this.cfPut(key, data)
        return
      } catch (err) {
        console.error('cfPut failed for set(), falling back to binding/local:', { key, err })
        // Fall through to other storage options
      }
    }

    if (this.kv) {
      try {
        await this.kv.put(key, data)
        console.log(`✅ Saved to KV binding (fallback): ${key}`)
        return
      } catch (err) {
        console.error('KV binding put failed for set(), falling back to local file:', { key, err })
        // Fall through to local storage
      }
    }

    try {
      const storage = readLocalStorage()
      storage[key] = data
      writeLocalStorage(storage)
      console.log(`✅ Saved to local file (fallback): ${key}`)
    } catch (err) {
      console.error('Failed to persist data to any storage for set():', { key, err })
    }
  }

  /**
   * Generic delete method
   */
  async delete(key: string): Promise<void> {
    // Try Cloudflare KV REST API first, but fall back on failure.
    if (this.useCloudflareAPI) {
      try {
        await this.cfDelete(key)
        return
      } catch (err) {
        console.error('cfDelete failed for delete(), falling back to binding/local:', { key, err })
        // Fall through to other storage options
      }
    }

    if (this.kv) {
      try {
        await this.kv.delete(key)
        console.log(`✅ Deleted from KV binding (fallback): ${key}`)
        return
      } catch (err) {
        console.error('KV binding delete failed for delete(), falling back to local file:', { key, err })
      }
    }

    try {
      const storage = readLocalStorage()
      delete storage[key]
      writeLocalStorage(storage)
      console.log(`✅ Deleted from local file (fallback): ${key}`)
    } catch (err) {
      console.error('Failed to delete key from any storage for delete():', { key, err })
    }
  }
}

// Export singleton instance
export const kvStorage = new KVStorage()
