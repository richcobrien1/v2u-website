"use client"
import React, { useState } from 'react'
import { adminFetch } from '@/components/AdminClient'
import Header from '@/components/Header'

export default function SendWelcomePage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    setMessage('Sending...')
    try {
      const res = await adminFetch('/api/admin/send-welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
  type ApiResp = { error?: string; success?: boolean; [k: string]: unknown }
  const j = await res.json() as ApiResp
  if (!res.ok) setMessage('Error: ' + (j?.error || String(res.status)))
  else setMessage('Sent ✅')
    } catch (err) {
      console.error(err)
      setMessage('Network error')
    }
  }

  return (
    <main className="min-h-screen bg-(--site-bg) text-(--site-fg)">
      <Header />

      <div className="p-6 max-w-lg mx-auto pt-24">
        <h1 className="text-2xl mb-4">Send Welcome Email</h1>
        <form onSubmit={handleSend} className="flex gap-3">
          <input value={email} onChange={e => setEmail(e.target.value)} className="flex-1 p-2 rounded bg-gray-800" placeholder="recipient@example.com" />
          <button className="px-4 py-2 bg-green-600 rounded">Send</button>
        </form>
        {message && <div className="mt-4">{message}</div>}
      </div>
    </main>
  )
}
