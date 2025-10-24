// website/components/Header.tsx
// Header component that reflects authentication state via /api/me

'use client'

import Link from 'next/link'
import { useUser } from '../hooks/useUser'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Header() {
  const { user, loading } = useUser()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout(e: React.FormEvent) {
    e.preventDefault()
    setLoggingOut(true)
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      })
      // After logout, force a refresh so /api/me is re‑fetched
      router.refresh()
    } catch (err) {
      console.error('Logout failed:', err)
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <header className="w-full bg-gray-900 text-white shadow-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Left side: logo / brand */}
        <div className="flex items-center space-x-3">
          <Link href="/" className="text-xl font-bold hover:text-gray-300">
            V2U
          </Link>
          <nav className="hidden md:flex space-x-4">
            <Link href="/podcast-dashboard" className="hover:text-gray-300">
              Dashboard
            </Link>
            <Link href="/about" className="hover:text-gray-300">
              About
            </Link>
          </nav>
        </div>

        {/* Right side: auth controls */}
        <div className="flex items-center space-x-4">
          {loading ? (
            <span className="text-sm text-gray-400">Loading…</span>
          ) : user.loggedIn ? (
            <>
              <span className="text-sm">
                Welcome, <strong>{user.customerId}</strong>{' '}
                {user.subscription && (
                  <em className="ml-1 text-green-400">
                    ({user.subscription})
                  </em>
                )}
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
