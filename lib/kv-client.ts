import { randomBytes, scryptSync, randomUUID } from 'crypto';
import path from 'path';
import * as fs from 'fs';
import { promises as fsPromises } from 'fs';

// Cloudflare KV API client for subscriber management

interface KVClient {
  put(key: string, value: string): Promise<void>;
  get(key: string): Promise<string | null>;
  delete(key: string): Promise<void>;
}

class CloudflareKVClient implements KVClient {
  private accountId: string;
  private namespaceId: string;
  private apiToken: string;

  constructor() {
    this.accountId = process.env.CLOUDFLARE_ACCOUNT_ID!;
    this.namespaceId = process.env.CLOUDFLARE_KV_NAMESPACE_ID!;
    this.apiToken = process.env.CLOUDFLARE_API_TOKEN!;
  }

  private get baseUrl() {
    return `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/storage/kv/namespaces/${this.namespaceId}`;
  }

  private get headers() {
    return {
      'Authorization': `Bearer ${this.apiToken}`,
      'Content-Type': 'application/json'
    };
  }

  async put(key: string, value: string): Promise<void> {
    try {
      console.log(`🔄 Attempting KV PUT: ${key}`);
      console.log(`   URL: ${this.baseUrl}/values/${key}`);
      
      const response = await fetch(`${this.baseUrl}/values/${key}`, {
        method: 'PUT',
        headers: this.headers,
        body: value
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ KV PUT failed: ${response.status} ${response.statusText}`);
        console.error(`   Error details: ${errorText}`);
        throw new Error(`KV PUT failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      console.log(`✅ KV PUT SUCCESS: ${key}`);
    } catch (error) {
      console.error(`❌ KV PUT EXCEPTION:`, error);
      throw error; // Don't fall back silently - let it fail loudly
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/values/${key}`, {
        method: 'GET',
        headers: this.headers
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`KV GET failed: ${response.statusText}`);
      }

      const value = await response.text();
      console.log(`📖 KV GET: ${key} = ${value}`);
      return value;
    } catch (error) {
      console.error(`❌ KV GET failed, falling back to mock:`, error);
      // Fallback to mock behavior - return null for unknown keys
      console.log(`🧪 FALLBACK MOCK KV GET: ${key} = null`);
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/values/${key}`, {
        method: 'DELETE',
        headers: this.headers
      });

      if (!response.ok && response.status !== 404) {
        throw new Error(`KV DELETE failed: ${response.statusText}`);
      }

      console.log(`🗑️ KV DELETE: ${key}`);
    } catch (error) {
      console.error(`❌ KV DELETE failed, falling back to mock:`, error);
      // Fallback to mock behavior
      console.log(`🧪 FALLBACK MOCK KV DELETE: ${key}`);
    }
  }
}

// Mock KV for development/testing
class MockKVClient implements KVClient {
  private store = new Map<string, string>();
  private storagePath: string;

  constructor() {
    // Persist mock KV to a project-local JSON file so different dev server
    // worker processes can share state between route handlers.
    this.storagePath = path.resolve(process.cwd(), '.v2u-mock-kv.json');

    try {
      if (fs.existsSync(this.storagePath)) {
        const raw = fs.readFileSync(this.storagePath, 'utf8');
        const obj = raw ? JSON.parse(raw) : {};
        for (const k of Object.keys(obj)) this.store.set(k, obj[k]);
      }
    } catch (err) {
      console.error('Failed to load mock KV file, starting with empty store', err);
    }
  }

  private async persist() {
    try {
      const obj = Object.fromEntries(this.store.entries());
      await fsPromises.writeFile(this.storagePath, JSON.stringify(obj, null, 2), 'utf8');
    } catch (err) {
      console.error('Failed to persist mock KV file', err);
    }
  }

  async put(key: string, value: string): Promise<void> {
    this.store.set(key, value);
    console.log(`🧪 MOCK KV PUT: ${key} = ${value}`);
    await this.persist();
  }

  async get(key: string): Promise<string | null> {
    const value = this.store.get(key) || null;
    return value;
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
    console.log(`🧪 MOCK KV DELETE: ${key}`);
    await this.persist();
  }
}

// Export singleton instance - use mock for now until KV API token is configured properly
// Choose the real Cloudflare KV client when the namespace id is configured,
// otherwise fall back to the in-memory mock for local development.
// If NO_MOCKS is set to 'true' we want to fail fast when KV isn't configured
const NO_MOCKS = process.env.NO_MOCKS === 'true'

class StrictFailingKV implements KVClient {
  private reason: string
  constructor(reason: string) { this.reason = reason }
  async put(): Promise<void> { throw new Error(`KV not configured (NO_MOCKS=true): ${this.reason}`) }
  async get(): Promise<string | null> { throw new Error(`KV not configured (NO_MOCKS=true): ${this.reason}`) }
  async delete(): Promise<void> { throw new Error(`KV not configured (NO_MOCKS=true): ${this.reason}`) }
}

export const kvClient: KVClient = process.env.CLOUDFLARE_KV_NAMESPACE_ID
  ? new CloudflareKVClient()
  : (NO_MOCKS ? new StrictFailingKV('CLOUDFLARE_KV_NAMESPACE_ID missing') : new MockKVClient());

// Helper functions for subscriber access
export async function grantAccess(customerId: string, subscriptionId: string): Promise<void> {
  const secret = typeof randomUUID === 'function' ? randomUUID() : Math.random().toString(36).slice(2);
  await Promise.all([
    kvClient.put(`access:${customerId}`, 'granted'),
    kvClient.put(`secret:${customerId}`, secret),
    kvClient.put(`subscription:${customerId}`, subscriptionId),
  ]);
}

export async function revokeAccess(customerId: string): Promise<void> {
  await Promise.all([
    kvClient.delete(`access:${customerId}`),
    kvClient.delete(`secret:${customerId}`),
    kvClient.delete(`subscription:${customerId}`),
  ]);
}

export async function checkAccess(customerId: string): Promise<boolean> {
  const access = await kvClient.get(`access:${customerId}`);
  return access === 'granted';
}

export async function getCustomerSecret(customerId: string): Promise<string | null> {
  return await kvClient.get(`secret:${customerId}`);
}

// --- Admin / Developer onboarding helpers ---
// Admin entries are stored under `admin:{adminId}` as a JSON string:
// { secret: string, role: string, createdAt: string }
export async function createAdminUser(adminId: string, role: string = 'admin', secret?: string) {
  // Use provided secret or generate a random one
  const realSecret = secret || randomBytes(24).toString('hex');
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(realSecret, salt, 64).toString('hex');

  const payload = JSON.stringify({ hash: derived, salt, role, createdAt: new Date().toISOString() });
  await kvClient.put(`admin:${adminId}`, payload);
  // Return the plaintext secret once to the caller so it can be delivered securely
  return { adminId, secret: realSecret, role };
}

export async function getAdminEntry(adminId: string): Promise<{ hash: string; salt: string; role: string; createdAt: string } | null> {
  const raw = await kvClient.get(`admin:${adminId}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse admin entry for', adminId, err);
    return null;
  }
}

export async function revokeAdminUser(adminId: string) {
  await kvClient.delete(`admin:${adminId}`);
}

export async function checkAdmin(adminId: string): Promise<boolean> {
  const entry = await getAdminEntry(adminId);
  return !!entry;
}

export async function verifyAdminSecret(adminId: string, secret: string): Promise<boolean> {
  const entry = await getAdminEntry(adminId);
  if (!entry) return false;
  try {
  const derived = scryptSync(secret, entry.salt, 64).toString('hex');
    return derived === entry.hash;
  } catch (err) {
    console.error('Error verifying admin secret for', adminId, err);
    return false;
  }
}