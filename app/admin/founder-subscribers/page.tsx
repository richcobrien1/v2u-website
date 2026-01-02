"use client"

import { useEffect, useState } from 'react'
import { adminFetch } from '@/components/AdminClient'
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function FounderSubscribersAdmin() {
  const [subs, setSubs] = useState<Array<{ email: string; createdAt?: string }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newEmail, setNewEmail] = useState('')
  const [editing, setEditing] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [sending, setSending] = useState<Record<string, boolean>>({})

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await adminFetch('/api/admin-subscribers', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json() as { subscribers?: Array<{ email: string; createdAt?: string }> }
        setSubs(data.subscribers || [])
      } else if (res.status === 401) {
        window.location.href = '/admin/login'
        return
      } else {
        setError(`Failed to load subscribers: ${res.status}`)
      }
    } catch (err) {
      console.error('Load error:', err)
      setError('Network error while loading subscribers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleAdd() {
    if (!newEmail.trim()) {
      setError('Please enter an email address')
      return
    }

    setError(null)
    try {
      const res = await adminFetch('/api/admin-subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail.trim() })
      })
      if (res.ok) {
        setNewEmail('')
        await load()
      } else {
        const data = await res.json().catch(() => ({})) as { error?: string }
        setError(data.error || 'Failed to add subscriber')
      }
    } catch (err) {
      console.error('Add error:', err)
      setError('Network error while adding subscriber')
    }
  }

  async function handleDelete(email: string) {
    if (!confirm(`Are you sure you want to delete ${email}?`)) return

    setError(null)
    try {
      const res = await adminFetch(`/api/admin-subscribers?email=${encodeURIComponent(email)}`, { method: 'DELETE' })
      if (res.ok) {
        await load()
      } else {
        const data = await res.json().catch(() => ({})) as { error?: string }
        setError(data.error || 'Failed to delete subscriber')
      }
    } catch (err) {
      console.error('Delete error:', err)
      setError('Network error while deleting subscriber')
    }
  }

  function startEdit(email: string) {
    setEditing(email)
    setEditValue(email)
    setError(null)
  }

  async function saveEdit() {
    if (!editing || !editValue.trim()) return

    setError(null)
    try {
      const res = await adminFetch('/api/admin-subscribers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: editing, newEmail: editValue.trim() })
      })
      if (res.ok) {
        setEditing(null)
        setEditValue('')
        await load()
      } else {
        const data = await res.json().catch(() => ({})) as { error?: string }
        setError(data.error || 'Failed to update subscriber')
      }
    } catch (err) {
      console.error('Edit error:', err)
      setError('Network error while updating subscriber')
    }
  }

  function cancelEdit() {
    setEditing(null)
    setEditValue('')
    setError(null)
  }

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
    <main className="min-h-screen">
      <Header isAdmin />

      <div className="p-6 pt-24">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl p-6 shadow-lg" style={{ backgroundColor: 'var(--panel-bg)', color: 'var(--panel-fg)' }}>
            <h1 className="text-2xl mb-4">Founder Subscribers</h1>
            <div className="mb-4">
              <a href="/admin/email-template" className="text-sm text-blue-400 underline">Edit welcome email template</a>
            </div>
            <div className="mb-4 flex gap-2">
              <input
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="p-2 border rounded w-full bg-gray-700 text-white"
                placeholder="email@example.com"
                type="email"
                onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
              />
              <button
                onClick={handleAdd}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                disabled={!newEmail.trim()}
              >
                Add
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
                <button
                  onClick={() => setError(null)}
                  className="float-right ml-2 text-red-700 hover:text-red-900"
                >
                  ×
                </button>
              </div>
            )}

            {loading ? (
              <p className="text-gray-400">Loading subscribers...</p>
            ) : subs.length === 0 ? (
              <p className="text-gray-400">No subscribers yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-auto" role="table" aria-label="Founder subscribers">
                  <thead>
                    <tr className="text-left border-b border-gray-600">
                      <th className="pb-2 font-semibold">Email</th>
                      <th className="pb-2 font-semibold">Created</th>
                      <th className="pb-2 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subs.map(s => (
                      <tr key={s.email} className="border-t border-gray-700 hover:bg-gray-800">
                        <td className="py-3 pr-4">
                          {editing === s.email ? (
                            <input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="p-1 border rounded bg-gray-600 text-white w-full"
                              type="email"
                              autoFocus
                              onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                            />
                          ) : (
                            <span className="break-all">{s.email}</span>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-gray-300">
                          {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-3 text-right">
                          {editing === s.email ? (
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={saveEdit}
                                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
                                disabled={!editValue.trim()}
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => handleSend(s.email)}
                                disabled={Boolean(sending[s.email])}
                                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50 text-sm"
                                title="Send welcome email"
                              >
                                {sending[s.email] ? 'Sending...' : 'Send'}
                              </button>
                              <button
                                onClick={() => startEdit(s.email)}
                                className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 text-sm"
                                title="Edit email"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(s.email)}
                                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                                title="Delete subscriber"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
