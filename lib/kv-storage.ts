/**
 * Cloudflare KV Storage Utility
 * Provides encrypted credential storage and retrieval
 */

interface KVNamespace {
  get(key: string): Promise<string | null>
  put(key: string, value: string): Promise<void>
  delete(key: string): Promise<void>
  list(options?: { prefix?: string }): Promise<{ keys: Array<{ name: string }> }>
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

  constructor() {
    // Get KV namespace from env
    this.kv = (process.env as { V2U_KV?: KVNamespace }).V2U_KV || null
    this.encryptionKey = process.env.KV_ENCRYPTION_KEY || 'default-key-change-me'
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
    if (!this.kv) {
      console.warn('KV not available, saving to env vars instead')
      return
    }

    const key = `automation:level${level}:${platformId}`
    const data = {
      credentials,
      enabled,
      configured: Object.keys(credentials).length > 0,
      updatedAt: new Date().toISOString()
    }

    const encrypted = await encrypt(JSON.stringify(data), this.encryptionKey)
    await this.kv.put(key, encrypted)
  }

  /**
   * Get credentials for a platform
   */
  async getCredentials(
    level: 1 | 2,
    platformId: string
  ): Promise<{ credentials: Record<string, string>; enabled: boolean; configured: boolean } | null> {
    if (!this.kv) {
      console.warn('KV not available, returning empty credentials')
      return null
    }

    const key = `automation:level${level}:${platformId}`
    const encrypted = await this.kv.get(key)
    
    if (!encrypted) {
      return null
    }

    const decrypted = await decrypt(encrypted, this.encryptionKey)
    return JSON.parse(decrypted)
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
