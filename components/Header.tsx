'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useUser } from '../hooks/useUser'

export default function Header() {
  const { user, loading } = useUser()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout(e: React.FormEvent) {
    e.preventDefault()
    setLoggingOut(true)
    await fetch('/api/logout', { method: 'POST', credentials: 'include' })
    router.refresh()
    setLoggingOut(false)
  }

  return (
    <header className="w-full bg-gray-900 text-white shadow-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold hover:text-gray-300">
          V2U
        </Link>
        <div className="flex items-center space-x-4">
          {loading ? (
            <span className="text-sm text-gray-400">Loading…</span>
          ) : user.loggedIn ? (
            <>
              <span className="text-sm">
                Welcome, <strong>{user.customerId}</strong>
              </span>
              <form onSubmit={handleLogout}>
                <button
                  type="submit"
                  disabled={loggingOut}
                  className="rounded bg-red-600 px-3 py-1 text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                >
                  {loggingOut ? 'Logging out…' : 'Logout'}
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded bg-blue-600 px-3 py-1 text-sm font-medium hover:bg-blue-700"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
