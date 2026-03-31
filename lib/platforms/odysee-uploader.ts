/**
 * Odysee Video Upload via LBRY API
 * Uses file_url to publish from R2 storage — no local LBRY daemon required.
 *
 * Required env vars:
 *   LBRY_AUTH_TOKEN   — from Odysee account (see README for how to get)
 *   LBRY_CHANNEL_NAME — e.g. "@AI-Now"
 *   LBRY_CHANNEL_ID   — full claim_id (resolved automatically if blank)
 */

const LBRY_API = 'https://api.na-backend.odysee.com/api/v1/proxy';

export interface OdyseeCredentials {
  authToken: string;
  channelName: string;
  channelId?: string;
}

export interface OdyseePublishParams {
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  tags?: string[];
  publishedAt?: string; // ISO date string
}

export interface OdyseePublishResult {
  success: boolean;
  claimId?: string;
  url?: string;
  error?: string;
}

async function lbryCall(authToken: string, method: string, params: Record<string, unknown>) {
  const response = await fetch(LBRY_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Lbry-Auth-Token': authToken,
    },
    body: JSON.stringify({ method, params }),
  });

  if (!response.ok) {
    throw new Error(`LBRY API HTTP ${response.status}: ${await response.text()}`);
  }

  const data = await response.json() as { result?: unknown; error?: { message: string } };

  if (data.error) {
    throw new Error(`LBRY error: ${data.error.message}`);
  }

  return data.result;
}

/**
 * Resolve the full channel_id from the channel name if not provided.
 */
async function resolveChannelId(authToken: string, channelName: string): Promise<string> {
  const result = await lbryCall(authToken, 'channel_list', {
    name: channelName,
    resolve: true,
  }) as { items?: Array<{ claim_id: string; name: string }> };

  const channel = result?.items?.[0];
  if (!channel) {
    throw new Error(`Channel "${channelName}" not found in Odysee account`);
  }

  return channel.claim_id;
}

/**
 * Slugify the title for the LBRY claim name.
 */
function toClaimName(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

/**
 * Publish a video to Odysee using a remote URL (R2).
 */
export async function publishToOdysee(
  credentials: OdyseeCredentials,
  params: OdyseePublishParams
): Promise<OdyseePublishResult> {
  const { authToken, channelName } = credentials;
  let { channelId } = credentials;

  if (!authToken) {
    return { success: false, error: 'LBRY_AUTH_TOKEN not set' };
  }

  if (!channelName) {
    return { success: false, error: 'LBRY_CHANNEL_NAME not set' };
  }

  try {
    // Resolve channel_id if not provided
    if (!channelId) {
      channelId = await resolveChannelId(authToken, channelName);
      console.log(`[Odysee] Resolved channel_id: ${channelId}`);
    }

    const claimName = toClaimName(params.title);

    const publishParams: Record<string, unknown> = {
      name: claimName,
      bid: '0.001',
      title: params.title,
      description: params.description,
      channel_name: channelName,
      channel_id: channelId,
      file_url: params.videoUrl,
      fee_currency: 'LBC',
      fee_amount: '0',
      license: 'None',
      tags: params.tags ?? ['ai', 'technology', 'podcast', 'news', 'ai deep dive'],
    };

    if (params.thumbnailUrl) {
      publishParams.thumbnail_url = params.thumbnailUrl;
    }

    const result = await lbryCall(authToken, 'publish', publishParams) as {
      outputs?: Array<{ claim_id: string; permanent_url: string }>;
    };

    const output = result?.outputs?.[0];
    if (!output) {
      return { success: false, error: 'No output in publish response' };
    }

    const claimId = output.claim_id;
    const odyseeUrl = `https://odysee.com/${channelName}:${channelId}/${claimName}:${claimId}`;

    console.log(`[Odysee] Published: ${odyseeUrl}`);
    return { success: true, claimId, url: odyseeUrl };

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[Odysee] Publish failed:', message);
    return { success: false, error: message };
  }
}
