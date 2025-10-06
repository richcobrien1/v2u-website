"use client"
// Client-side helper to persist admin onboarding token and attach it to requests
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
