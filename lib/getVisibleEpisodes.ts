// lib/getVisibleEpisodes.ts

import { fetchR2Episodes, R2Episode } from '@/lib/r2-episodes'

export async function getVisibleEpisodes(userSubscription: 'free' | 'premium'): Promise<R2Episode[]> {
  const allEpisodes = await fetchR2Episodes()

  // Filter based on subscription
  const visibleEpisodes = allEpisodes.filter(ep => {
    return !ep.isPremium || userSubscription === 'premium'
  })

  return visibleEpisodes
}
