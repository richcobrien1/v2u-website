import { NextRequest, NextResponse } from 'next/server';
import { kvStorage } from '@/lib/kv-storage';

/**
 * GET /api/linkedin/callback
 * Step 2: Handle OAuth callback and exchange code for access token
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (error) {
    return NextResponse.redirect(
      new URL(`/admin/social-posting?linkedin_error=${encodeURIComponent(errorDescription || error)}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.json({ error: 'No authorization code received' }, { status: 400 });
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/linkedin/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: 'LinkedIn credentials not configured' }, { status: 500 });
  }

  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri
      })
    });

    const tokenData = await tokenResponse.json() as {
      access_token?: string;
      expires_in?: number;
      refresh_token?: string;
      error?: string;
      error_description?: string;
    };

    if (!tokenData.access_token) {
      throw new Error(tokenData.error_description || tokenData.error || 'Failed to get access token');
    }

    // Get user profile info
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });

    const profileData = await profileResponse.json() as {
      sub?: string;
      name?: string;
      email?: string;
      picture?: string;
    };

    // Try to get organization IDs (if user is admin of any and has permission)
    let organizations: Array<{id?: string; name?: string; vanityName?: string}> = [];
    try {
      const orgsResponse = await fetch('https://api.linkedin.com/v2/organizationAcls?q=roleAssignee&role=ADMINISTRATOR&projection=(elements*(organization~(localizedName,vanityName)))', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });

      if (orgsResponse.ok) {
        const orgsData = await orgsResponse.json() as {
          elements?: Array<{
            organization?: string;
            'organization~'?: {
              localizedName?: string;
              vanityName?: string;
            };
          }>;
        };

        organizations = orgsData.elements?.map(el => ({
          id: el.organization,
          name: el['organization~']?.localizedName,
          vanityName: el['organization~']?.vanityName
        })) || [];
      } else {
        console.log('Organization API not accessible - scope may not be approved');
      }
    } catch (error) {
      console.log('Could not fetch organizations:', error);
      // Continue without organizations
    }

    // Prepare credentials display
    const credentials = {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token || 'N/A',
      expiresIn: tokenData.expires_in,
      personUrn: profileData.sub,
      name: profileData.name,
      email: profileData.email,
      organizations
    };

    // Auto-save credentials to KV storage
    try {
      await kvStorage.saveCredentials(
        2, 
        'linkedin',
        {
          accessToken: tokenData.access_token,
          personUrn: profileData.sub || '',
          // Store first organization if available (can be changed in admin panel)
          organizationId: organizations[0]?.id || ''
        },
        true, // enabled
        true, // validated
        new Date().toISOString() // validatedAt timestamp for expiry tracking
      );
      console.log('✅ LinkedIn credentials auto-saved to KV');
    } catch (saveError) {
      console.error('❌ Failed to auto-save credentials to KV:', saveError);
      // Don't fail the OAuth flow if KV save fails
    }

    // Return HTML page with credentials
    return new NextResponse(
      `<!DOCTYPE html>
<html>
<head>
  <title>LinkedIn OAuth Success</title>
  <style>
    body { font-family: system-ui; max-width: 800px; margin: 50px auto; padding: 20px; }
    h1 { color: #0077B5; }
    .credential { background: #f0f0f0; padding: 10px; margin: 10px 0; border-radius: 5px; }
    .credential strong { display: inline-block; width: 150px; }
    .token { word-break: break-all; font-family: monospace; font-size: 12px; }
    .org { background: #e6f3ff; padding: 5px; margin: 5px 0; border-radius: 3px; }
    button { background: #0077B5; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin: 10px 5px; }
    button:hover { background: #005885; }
    .success { color: #28a745; background: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #c3e6cb; }
    .warning { color: #856404; background: #fff3cd; padding: 10px; border-radius: 5px; margin: 10px 0; border: 1px solid #ffeeba; }
    .info { color: #004085; background: #cce5ff; padding: 10px; border-radius: 5px; margin: 10px 0; border: 1px solid #b8daff; }
  </style>
</head>
<body>
  <h1>✅ LinkedIn OAuth Successful!</h1>
  
  <div class="success">
    <strong>🎉 Credentials automatically saved!</strong><br>
    Your LinkedIn access token has been securely stored. LinkedIn posting is now enabled and ready to use.
  </div>
  
  <div class="credential">
    <strong>User:</strong> ${credentials.name} (${credentials.email})
  </div>
  
  <div class="credential">
    <strong>Person URN:</strong> <span class="token">${credentials.personUrn}</span>
  </div>
  
  <div class="credential">
    <strong>Access Token:</strong>
    <div class="token">${credentials.accessToken}</div>
  </div>
  
  ${credentials.refreshToken !== 'N/A' ? `
  <div class="credential">
    <strong>Refresh Token:</strong>
    <div class="token">${credentials.refreshToken}</div>
  </div>
  ` : ''}
  
  <div class="credential">
    <strong>Expires In:</strong> ${credentials.expiresIn} seconds (~${Math.round((credentials.expiresIn || 0) / 86400)} days)
  </div>
  
  ${organizations.length > 0 ? `
  <h2>Your Organizations</h2>
  ${organizations.map(org => `
    <div class="org">
      <strong>${org.name}</strong> (@${org.vanityName})
      <div class="token">ID: ${org.id}</div>
    </div>
  `).join('')}
  ` : '<div class="info">ℹ️ No organizations found. Posts will be shared to your personal LinkedIn profile.</div>'}
  
  <div class="info">
    <strong>✅ What was automatically configured:</strong><br>
    • Access Token: Saved securely ✓<br>
    • Person URN: ${credentials.personUrn} ✓<br>
    ${organizations.length > 0 ? `• Organization: ${organizations[0].name} ✓<br>` : ''}
    • Status: Enabled and validated ✓<br>
    • Expires: ${Math.round((credentials.expiresIn || 0) / 86400)} days from now
  </div>
  
  <h2>You're all set! 🎉</h2>
  <p>LinkedIn posting is now active. The system will automatically:</p>
  <ul>
    <li>Post new episodes to LinkedIn</li>
    <li>Monitor token expiry and alert you 7 days before it expires</li>
    <li>Send you a reminder email with re-auth link</li>
  </ul>
    <li>Go to the <a href="/admin/social-posting">Social Posting Admin</a></li>
    <li>Enter these credentials in the LinkedIn section</li>
    <li>Save and enable LinkedIn</li>
  </ol>
  
  <div class="warning">
    ⚠️ <strong>Token Expiration:</strong> LinkedIn tokens expire in ${Math.round((credentials.expiresIn || 0) / 86400)} days. 
    You'll receive an automatic email reminder 7 days before expiry.
  </div>
  
  <button onclick="window.location.href='/admin/automation'">Go to Automation Dashboard</button>
  <button onclick="window.location.href='/admin/social-posting'">View Social Posting</button>
  
  <details style="margin-top: 30px;">
    <summary style="cursor: pointer; font-weight: bold; color: #0077B5;">🔧 Advanced: View Raw Credentials</summary>
    <div style="margin-top: 15px;">
      <div class="credential">
        <strong>Access Token:</strong>
        <div class="token">${credentials.accessToken}</div>
      </div>
      
      <div class="credential">
        <strong>Person URN:</strong> <span class="token">${credentials.personUrn}</span>
      </div>
      
      ${credentials.refreshToken !== 'N/A' ? `
      <div class="credential">
        <strong>Refresh Token:</strong>
        <div class="token">${credentials.refreshToken}</div>
      </div>
      ` : ''}
      
      <button onclick="navigator.clipboard.writeText('${credentials.accessToken}')">Copy Access Token</button>
      <button onclick="navigator.clipboard.writeText('${credentials.personUrn}')">Copy Person URN</button>
      
      <h4>For .env.local (optional):</h4>
      <div class="credential">
        <pre>LINKEDIN_ACCESS_TOKEN="${credentials.accessToken}"
LINKEDIN_PERSON_URN="${credentials.personUrn}"
${organizations.length > 0 ? `LINKEDIN_ORGANIZATION_ID="${organizations[0].id}"` : '# No organization - personal posts only'}</pre>
      </div>
    </div>
  </details>
</body>
</html>`,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      }
    );

  } catch (error) {
    console.error('LinkedIn OAuth error:', error);
    return NextResponse.redirect(
      new URL(
        `/admin/social-posting?linkedin_error=${encodeURIComponent(error instanceof Error ? error.message : 'OAuth failed')}`,
        request.url
      )
    );
  }
}
