/**
 * Generate simple promotional images for Instagram posts
 * Uses HTML Canvas to create images with episode titles
 */

export interface ImageOptions {
  title: string;
  subtitle?: string;
  backgroundColor?: string;
  textColor?: string;
  width?: number;
  height?: number;
}

/**
 * Generate a base64 PNG image for social media posts
 * This runs on the server using node-canvas or similar
 */
export async function generateEpisodeImage(options: ImageOptions): Promise<string> {
  const {
    title,
    subtitle = 'New Episode Available',
    backgroundColor = '#1a1a2e',
    textColor = '#ffffff',
    width = 1080,
    height = 1080
  } = options;

  // For now, return a data URL that can be used
  // In production, this would use node-canvas or a headless browser
  // to generate actual images
  
  const svgImage = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${backgroundColor}"/>
      
      <!-- Subtitle -->
      <text x="50%" y="30%" 
            font-family="Arial, sans-serif" 
            font-size="32" 
            font-weight="bold"
            fill="${textColor}" 
            text-anchor="middle">
        ${escapeXml(subtitle)}
      </text>
      
      <!-- Title (word wrapped) -->
      <foreignObject x="5%" y="40%" width="90%" height="40%">
        <div xmlns="http://www.w3.org/1999/xhtml" 
             style="color: ${textColor}; 
                    font-family: Arial, sans-serif; 
                    font-size: 48px; 
                    font-weight: bold; 
                    text-align: center;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    padding: 20px;
                    word-wrap: break-word;">
          ${escapeXml(title)}
        </div>
      </foreignObject>
      
      <!-- Bottom text -->
      <text x="50%" y="90%" 
            font-family="Arial, sans-serif" 
            font-size="28" 
            fill="${textColor}" 
            text-anchor="middle">
        🎙️ Listen Now on All Platforms
      </text>
    </svg>
  `;

  // Convert SVG to base64 data URL
  const base64 = Buffer.from(svgImage).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Upload image to Instagram via Graph API
 */
export async function postToInstagramWithImage(
  accessToken: string,
  userId: string,
  imageUrl: string,
  caption: string
): Promise<{ success: boolean; postId?: string; error?: string }> {
  try {
    // Step 1: Create media container
    const containerResponse = await fetch(
      `https://graph.facebook.com/v18.0/${userId}/media`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: imageUrl,
          caption: caption,
          access_token: accessToken
        })
      }
    );

    const containerResult = await containerResponse.json() as { id?: string; error?: { message?: string } };

    if (!containerResponse.ok || containerResult.error) {
      return {
        success: false,
        error: containerResult.error?.message || 'Failed to create media container'
      };
    }

    const containerId = containerResult.id;

    // Step 2: Publish the container
    const publishResponse = await fetch(
      `https://graph.facebook.com/v18.0/${userId}/media_publish`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: containerId,
          access_token: accessToken
        })
      }
    );

    const publishResult = await publishResponse.json() as { id?: string; error?: { message?: string } };

    if (!publishResponse.ok || publishResult.error) {
      return {
        success: false,
        error: publishResult.error?.message || 'Failed to publish media'
      };
    }

    return {
      success: true,
      postId: publishResult.id
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
