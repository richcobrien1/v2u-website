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
    <main className="min-h-screen bg-[var(--site-bg)] text-[var(--site-fg)]">
      <Header loggedIn={true} firstName="Welcome" avatar="🟡" isAdmin={true} />

      <div className="p-6 pt-24">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl bg-[#212121ff] text-white p-6">
            <h1 className="text-2xl mb-4">Founder Subscribers</h1>
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
                            <button onClick={cancelEdit} className="bg-gray-600 text-white px-3 py-1 rounded">Cancel</button>
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
