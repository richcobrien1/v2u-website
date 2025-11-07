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
      const url = `https://api.cloudflare.com/client/v4/accounts/${this.cfAccountId}/storage/kv/namespaces/${this.cfNamespaceId}/values/${key}`
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
      const url = `https://api.cloudflare.com/client/v4/accounts/${this.cfAccountId}/storage/kv/namespaces/${this.cfNamespaceId}/values/${key}`
      console.log('Cloudflare KV PUT:', { key, url: url.substring(0, 80) + '...' })
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.cfApiToken}`,
          'Content-Type': 'text/plain'
        },
        body: value
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Cloudflare KV PUT failed:', response.status, response.statusText, errorText)
        throw new Error(`Cloudflare KV PUT failed: ${response.status} ${errorText}`)
      }
      
      console.log('Cloudflare KV PUT success:', key)
    } catch (err) {
      console.error('Error writing to Cloudflare KV:', err)
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
    enabled = true
  ): Promise<void> {
    const key = `automation:level${level}:${platformId}`
    const data = {
      credentials,
      enabled,
      configured: Object.keys(credentials).length > 0,
      updatedAt: new Date().toISOString()
    }
    const jsonData = JSON.stringify(data)

    console.log(`Saving credentials for ${platformId}:`, {
      level,
      useCloudflareAPI: this.useCloudflareAPI,
      hasKVBinding: !!this.kv,
      credentialKeys: Object.keys(credentials)
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
  ): Promise<{ credentials: Record<string, string>; enabled: boolean; configured: boolean } | null> {
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
    configured: boolean 
  }>> {
    const platforms = ['youtube', 'rumble', 'spotify']
    const config: Record<string, { credentials: Record<string, string>; enabled: boolean; configured: boolean }> = {}

    for (const platform of platforms) {
      const data = await this.getCredentials(1, platform)
      if (data) {
        config[platform] = data
      }
    }

    return config
  }

  /**
   * Get all Level 2 platform configurations
   */
  async getLevel2Config(): Promise<Record<string, { 
    credentials: Record<string, string>; 
    enabled: boolean; 
    configured: boolean 
  }>> {
    const platforms = ['twitter', 'facebook', 'linkedin', 'instagram', 'threads', 'tiktok']
    const config: Record<string, { credentials: Record<string, string>; enabled: boolean; configured: boolean }> = {}

    for (const platform of platforms) {
      const data = await this.getCredentials(2, platform)
      if (data) {
        config[platform] = data
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
    if (!this.kv) {
      console.warn('KV not available')
      return
    }

    await this.kv.put('automation:status', JSON.stringify(status))
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
    if (!this.kv) {
      return null
    }

    const data = await this.kv.get('automation:status')
    return data ? JSON.parse(data) : null
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
}

// Export singleton instance
export const kvStorage = new KVStorage()
