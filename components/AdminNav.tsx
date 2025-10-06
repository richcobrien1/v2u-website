"use client"
import React, { useState, useEffect } from 'react'
import { getSavedToken, saveToken, clearToken } from './AdminClient'

export default function AdminNav({ onLogout }: { onLogout?: () => void }) {
  const [token, setToken] = useState('')
  const [remember, setRemember] = useState(false)

  useEffect(() => {
    const t = getSavedToken()
    if (t) setToken(t)
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
        <a href="/admin/dashboard" className="text-sm">Dashboard</a>
        <a href="/admin/subscribers" className="text-sm">Subscribers</a>
        <a href="/admin/email-template" className="text-sm">Email Template</a>
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
