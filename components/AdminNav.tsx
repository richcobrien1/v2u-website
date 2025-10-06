"use client"
import React, { useState, useEffect } from 'react'
import { getSavedToken, saveToken, clearToken, adminFetch } from './AdminClient'

export default function AdminNav({ onLogout }: { onLogout?: () => void }) {
  const [token, setToken] = useState('')
  const [remember, setRemember] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)

  useEffect(() => {
    async function check() {
      const t = getSavedToken()
      if (t) setToken(t)
      try {
        const res = await adminFetch('/api/admin-whoami')
        if (!res.ok) {
          // not logged in anymore: clear saved token
          clearToken()
          setToken('')
          setIsLoggedIn(false)
        } else {
          setIsLoggedIn(true)
        }
      } catch {
        // network - ignore
        setIsLoggedIn(false)
      }
    }
    check()
  }, [])

  function handleSave() {
    saveToken(token, remember)
  }

  function handleClear() {
    clearToken()
    setToken('')
    if (onLogout) onLogout()
  }

  return (
    <div className="bg-gray-800 p-4 text-white flex items-center justify-between">
      <div className="flex gap-4 items-center">
        {
          // If isLoggedIn is explicitly false, render disabled-looking links.
        }
        <a
          href="/admin/dashboard"
          className={isLoggedIn ? 'text-sm text-white hover:underline' : 'text-sm text-gray-400 opacity-60 pointer-events-none'}
          aria-disabled={!isLoggedIn}
        >
          Dashboard
        </a>
        <a
          href="/admin/subscribers"
          className={isLoggedIn ? 'text-sm text-white hover:underline' : 'text-sm text-gray-400 opacity-60 pointer-events-none'}
          aria-disabled={!isLoggedIn}
        >
          Subscribers
        </a>
        <a
          href="/admin/email-template"
          className={isLoggedIn ? 'text-sm text-white hover:underline' : 'text-sm text-gray-400 opacity-60 pointer-events-none'}
          aria-disabled={!isLoggedIn}
        >
          Email Template
        </a>
      </div>

      <div className="flex items-center gap-2">
        <input placeholder="admin token" className="p-1 rounded text-black" value={token} onChange={e => setToken(e.target.value)} />
        <label className="text-sm"><input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} /> remember</label>
        <button onClick={handleSave} className="bg-blue-600 px-3 py-1 rounded text-sm">Save</button>
        <button onClick={handleClear} className="bg-red-600 px-3 py-1 rounded text-sm">Clear</button>
      </div>
    </div>
  )
}
