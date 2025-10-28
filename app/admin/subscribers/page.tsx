"use client"

import { useEffect, useState } from 'react'
import { adminFetch } from '@/components/AdminClient'
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function SubscribersAdmin() {
  const [subs, setSubs] = useState<Array<{ email: string; createdAt?: string }>>([])
  const [loading, setLoading] = useState(true)
  const [newEmail, setNewEmail] = useState('')
  const [editing, setEditing] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  async function load() {
    setLoading(true)
    const res = await adminFetch('/api/admin-subscribers', { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json() as { subscribers?: Array<{ email: string; createdAt?: string }> }
      setSubs(data.subscribers || [])
    } else if (res.status === 401) {
      window.location.href = '/admin/login'
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleAdd() {
    const res = await adminFetch('/api/admin-subscribers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: newEmail }) })
    if (res.ok) { setNewEmail(''); await load() }
  }

  async function handleDelete(email: string) {
    const res = await adminFetch(`/api/admin-subscribers?email=${encodeURIComponent(email)}`, { method: 'DELETE' })
    if (res.ok) await load()
  }

  async function startEdit(email: string) { setEditing(email); setEditValue(email) }
  async function saveEdit() {
    if (!editing) return
    const res = await adminFetch('/api/admin-subscribers', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: editing, newEmail: editValue }) })
    if (res.ok) { setEditing(null); setEditValue(''); await load() }
  }

  const [sending, setSending] = useState<Record<string, boolean>>({})

  async function handleSend(email: string) {
    try {
      setSending(prev => ({ ...prev, [email]: true }))
      const res = await adminFetch('/api/admin/send-welcome', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
      if (res.ok) {
        alert(`Welcome email sent to ${email}`)
      } else if (res.status === 401) {
        window.location.href = '/admin/login'
      } else {
        const data = await res.json().catch(() => ({} as { error?: string }))
        alert(`Failed to send: ${(data as { error?: string })?.error || 'unknown'}`)
      }
    } catch (err) {
      console.error('send error', err)
      alert('Failed to send email')
    } finally {
      setSending(prev => ({ ...prev, [email]: false }))
    }
  }

  return (
    <main className="min-h-screen bg-(--site-bg) text-(--site-fg)">
      <Header />

      <div className="p-6 pt-24">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl bg-[#212121ff] text-white p-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl">Subscribers</h1>
              <a
                href="/admin/dashboard"
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200"
              >
                ← Back to Dashboard
              </a>
            </div>
            <div className="mb-4">
              <a href="/admin/email-template" className="text-sm text-blue-400 underline">Edit welcome email template</a>
            </div>
            <div className="mb-4 flex gap-2">
              <input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="p-2 border rounded w-full bg-gray-700 text-white" placeholder="email@example.com" />
              <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
            </div>

            {loading ? <p>Loading...</p> : (
              <table className="w-full table-auto">
                <thead>
                  <tr className="text-left"><th>Email</th><th>Created</th><th></th></tr>
                </thead>
                <tbody>
                  {subs.map(s => (
                    <tr key={s.email} className="border-t border-gray-600">
                      <td>
                        {editing === s.email ? (
                          <input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="p-1 border rounded bg-gray-600 text-white" />
                        ) : (
                          s.email
                        )}
                      </td>
                      <td>{s.createdAt ?? '—'}</td>
                      <td className="text-right">
                        {editing === s.email ? (
                          <>
                            <button onClick={saveEdit} className="mr-2 bg-green-600 text-white px-3 py-1 rounded">Save</button>
                            <button onClick={() => setEditing(null)} className="bg-gray-600 text-white px-3 py-1 rounded">Cancel</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleSend(s.email)} disabled={Boolean(sending[s.email])} className="mr-2 bg-green-600 text-white px-3 py-1 rounded">
                              {sending[s.email] ? 'Sending...' : 'Send'}
                            </button>
                            <button onClick={() => startEdit(s.email)} className="mr-2 bg-yellow-600 text-white px-3 py-1 rounded">Edit</button>
                            <button onClick={() => handleDelete(s.email)} className="bg-red-600 text-white px-3 py-1 rounded">Delete</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
