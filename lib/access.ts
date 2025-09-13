import { parse } from 'cookie'

export function hasAccess(req: { headers: { cookie?: string } }) {
  const cookies = parse(req.headers.cookie || '')
  return cookies['v2u-access'] === 'granted'
}