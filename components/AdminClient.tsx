"use client"
// Client-side helper to persist admin onboarding token and attach it to requests

// Simple JWT decode function (without verification - for client-side expiration checking only)
function decodeJwt(token: string): { exp?: number; iat?: number; adminId?: string; role?: string } | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// Check if JWT token expires within the next hour (for short sessions) or day (for long sessions)
function isTokenExpiringSoon(token: string): boolean {
  const decoded = decodeJwt(token);
  if (!decoded || !decoded.exp) return true;
  const now = Math.floor(Date.now() / 1000);

  // Check if this is a long session (30 days) by looking at the expiration time
  const tokenDuration = decoded.exp - (decoded.iat || now);
  const isLongSession = tokenDuration > 24 * 60 * 60; // longer than 24 hours

  // For long sessions (30 days), refresh when < 1 day remains
  // For short sessions (24 hours), refresh when < 1 hour remains
  const threshold = isLongSession ? 24 * 60 * 60 : 60 * 60;

  return decoded.exp - now < threshold;
}

// Global flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;

async function refreshAdminToken(): Promise<boolean> {
  if (isRefreshing) return false;
  isRefreshing = true;

  try {
    const response = await fetch('/api/admin-refresh', {
      method: 'POST',
      credentials: 'same-origin',
    });

    if (response.ok) {
      console.log('Admin token refreshed successfully');
      return true;
    } else {
      console.error('Failed to refresh admin token');
      return false;
    }
  } catch (error) {
    console.error('Error refreshing admin token:', error);
    return false;
  } finally {
    isRefreshing = false;
  }
}
export function getSavedToken(): string | null {
  if (typeof window === 'undefined') return null
  // prefer localStorage (remembered) then sessionStorage
  const local = window.localStorage.getItem('v2u_admin_onboard_token')
  if (local) return local
  const sess = window.sessionStorage.getItem('v2u_admin_onboard_token')
  return sess
}

export function saveToken(token: string, remember = false) {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem('v2u_admin_onboard_token', token)
    if (remember) window.localStorage.setItem('v2u_admin_onboard_token', token)
    else window.localStorage.removeItem('v2u_admin_onboard_token')
  } catch {
    // ignore
  }
}

export function clearToken() {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.removeItem('v2u_admin_onboard_token')
    window.localStorage.removeItem('v2u_admin_onboard_token')
  } catch {
    // ignore
  }
}

export async function adminFetch(input: RequestInfo, init?: RequestInit) {
  // Check if we need to refresh the JWT token before making the request
  if (typeof window !== 'undefined') {
    const cookies = document.cookie.split(';');
    const adminTokenCookie = cookies.find(cookie => cookie.trim().startsWith('v2u_admin_token='));

    if (adminTokenCookie) {
      const token = adminTokenCookie.split('=')[1];
      if (isTokenExpiringSoon(token)) {
        console.log('Admin token expiring soon, refreshing...');
        await refreshAdminToken();
      }
    }
  }

  const token = getSavedToken()
  // clone headers into an object
  const headers: Record<string, string> = {}
  if (init && init.headers) {
    if (init.headers instanceof Headers) {
      init.headers.forEach((v, k) => { headers[k] = v })
    } else if (Array.isArray(init.headers)) {
      init.headers.forEach(([k, v]) => { headers[String(k)] = String(v) })
    } else {
      Object.assign(headers, init.headers as Record<string, string>)
    }
  }
  if (token && !headers['x-admin-onboard-token'] && !headers['x-admin-token']) headers['x-admin-onboard-token'] = token

  const finalInit: RequestInit = { ...(init || {}), headers }
  // Include same-origin credentials so server-side JWT cookie (v2u_admin_token)
  // is sent automatically for logged-in admin requests.
  if (!finalInit.credentials) finalInit.credentials = 'same-origin'
  return fetch(input, finalInit)
}
