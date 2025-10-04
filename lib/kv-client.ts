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
      const response = await fetch(`${this.baseUrl}/values/${key}`, {
        method: 'PUT',
        headers: this.headers,
        body: value
      });

      if (!response.ok) {
        throw new Error(`KV PUT failed: ${response.statusText}`);
      }

      console.log(`✅ KV PUT: ${key} = ${value}`);
    } catch (error) {
      console.error(`❌ KV PUT failed, falling back to mock:`, error);
      // Fallback to mock behavior
      console.log(`🧪 FALLBACK MOCK KV PUT: ${key} = ${value}`);
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

  async put(key: string, value: string): Promise<void> {
    this.store.set(key, value);
    console.log(`🧪 MOCK KV PUT: ${key} = ${value}`);
  }

  async get(key: string): Promise<string | null> {
    const value = this.store.get(key) || null;
    console.log(`🧪 MOCK KV GET: ${key} = ${value}`);
    return value;
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
    console.log(`🧪 MOCK KV DELETE: ${key}`);
  }
}

// Export singleton instance - use mock for now until KV API token is configured properly
export const kvClient: KVClient = false // process.env.CLOUDFLARE_KV_NAMESPACE_ID 
  ? new CloudflareKVClient()
  : new MockKVClient();

// Helper functions for subscriber access
export async function grantAccess(customerId: string, subscriptionId: string): Promise<void> {
  const secret = crypto.randomUUID();
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