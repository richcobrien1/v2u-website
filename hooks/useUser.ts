'use client'

import { useEffect, useState } from 'react'

interface User {
  loggedIn: boolean
  customerId?: string
  subscription?: string
  firstName?: string
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
        // explicitly type the JSON result
        const data = (await res.json()) as User
        if (!cancelled) setUser(data)
      } catch {
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
