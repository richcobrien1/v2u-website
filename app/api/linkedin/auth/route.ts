import { NextResponse } from 'next/server';

/**
 * GET /api/linkedin/auth
 * Step 1: Generate LinkedIn OAuth URL
 */
export async function GET() {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/linkedin/callback`;
  
  if (!clientId) {
    return NextResponse.json({ error: 'LinkedIn Client ID not configured' }, { status: 500 });
  }

  // LinkedIn OAuth scopes - Share on LinkedIn product (Default Tier)
  // Note: Not using openid scope as it requires "Sign In with LinkedIn" product
  const scopes = [
    'r_liteprofile',
    'r_emailaddress',
    'w_member_social' // Share on LinkedIn - post on behalf of user
  ].join(' ');

  const state = Math.random().toString(36).substring(7); // Random state for CSRF protection

  const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', scopes);
  authUrl.searchParams.set('state', state);

  return NextResponse.json({
    authUrl: authUrl.toString(),
    instructions: [
      '1. Click the authUrl below',
      '2. Authorize the app with LinkedIn',
      '3. You will be redirected back with your credentials',
      '4. Copy the credentials into your .env.local and the admin panel'
    ],
    redirectUri,
    state
  });
}
