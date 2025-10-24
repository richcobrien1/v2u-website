// website/hooks/useUser.ts
// React hook to fetch /api/me and keep header state in sync with cookies

import { useEffect, useState } from 'react'

interface User {
  loggedIn: boolean
  customerId?: string
  subscription?: string
}

export function useUser() {
  const [user, setUser] = useState<User>({ loggedIn: false })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function fetchUser() {
      try {
        const res = await fetch('/api/me', { credentials: 'include' })
        if (!res.ok) {
          if (!cancelled) setUser({ loggedIn: false })
          return
        }
        const data = await res.json()
        if (!cancelled) setUser(data)
      } catch (err) {
        if (!cancelled) setUser({ loggedIn: false })
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchUser()
    return () => {
      cancelled = true
    }
  }, [])

  return { user, loading }
}
