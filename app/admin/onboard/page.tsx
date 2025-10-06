"use client"
import React, { useState, useEffect } from 'react'
import { adminFetch } from '@/components/AdminClient'
import { useRouter } from 'next/navigation'

export default function AdminOnboardPage() {
  const [adminId, setAdminId] = useState('')
  const [secret, setSecret] = useState('')
  const [message, setMessage] = useState('')
  const [authorized, setAuthorized] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function check() {
      try {
        const res = await adminFetch('/api/admin-whoami')
        if (!res.ok) return router.push('/admin/login')
        const j: unknown = await res.json()
        if (j && typeof j === 'object') {
          const obj = j as Record<string, unknown>
          if (obj['identity']) setAuthorized(true)
          else router.push('/admin/login')
        } else {
          router.push('/admin/login')
        }
      } catch {
        router.push('/admin/login')
      }
    }
    check()
  }, [router])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setMessage('Creating admin...')
    try {
      const res = await adminFetch('/api/admin-onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', adminId, secret })
      })
      const j: unknown = await res.json()
      if (!res.ok) {
        let errMsg = 'create failed'
        if (j && typeof j === 'object') {
          const obj = j as Record<string, unknown>
          if (typeof obj['error'] === 'string') errMsg = obj['error']
        }
        setMessage(errMsg)
        return
      }
      setMessage('Admin created ✅')
      setAdminId('')
      setSecret('')
    } catch {
      setMessage('Network error')
    }
  }

  if (!authorized) return <div className="p-8 bg-[var(--site-bg)] text-[var(--site-fg)] min-h-screen">Checking authorization...</div>

  return (
    <div className="p-6 max-w-xl mx-auto bg-[var(--site-bg)] text-[var(--site-fg)] min-h-screen">
      <h1 className="text-2xl mb-4">Create Admin</h1>
      <div className="rounded-xl bg-[#212121ff] text-white p-6">
        <form onSubmit={handleCreate}>
          <label className="block mb-2">Admin ID</label>
          <input value={adminId} onChange={e => setAdminId(e.target.value)} className="w-full mb-4 p-2 rounded bg-gray-700 text-white" />
          <label className="block mb-2">Secret</label>
          <input value={secret} onChange={e => setSecret(e.target.value)} className="w-full mb-4 p-2 rounded bg-gray-700 text-white" />
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-green-600 text-white rounded">Create</button>
            <a href="/admin/dashboard" className="px-4 py-2 bg-gray-600 text-white rounded">Back</a>
          </div>
        </form>
      </div>
      {message && <div className="mt-4 rounded-xl bg-[#212121ff] text-white p-4">{message}</div>}
    </div>
  )
}
