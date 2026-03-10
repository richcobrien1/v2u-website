import { NextResponse } from 'next/server';

/**
 * GET /api/linkedin/quick-reauth
 * Direct link to LinkedIn OAuth flow - for easy re-authentication
 * Can be used in email alerts, dashboards, etc.
 */
export async function GET() {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/linkedin/callback`;
  
  if (!clientId) {
    return NextResponse.json({ error: 'LinkedIn Client ID not configured' }, { status: 500 });
  }

  const scopes = [
    'r_liteprofile',
    'r_emailaddress',
    'w_member_social'
  ].join(' ');

  const state = Math.random().toString(36).substring(7);

  const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', scopes);
  authUrl.searchParams.set('state', state);

  // Redirect user directly to LinkedIn OAuth
  return NextResponse.redirect(authUrl.toString());
}
