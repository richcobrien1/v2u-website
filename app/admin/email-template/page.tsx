"use client"
import React, { useEffect, useState, useCallback } from 'react'
import { adminFetch } from '@/components/AdminClient'
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AdminEmailTemplatePage() {
  // token is managed by AdminClient (session/local storage)
  const [html, setHtml] = useState('')
  const [history, setHistory] = useState<{ action: string; timestamp: string; actor?: string | null; html?: string }[] | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  type HistEntry = { action: string; timestamp: string; actor?: string | null; html?: string }
  type ApiResp = { source?: string; html?: string | null; history?: HistEntry[]; error?: string }

  const fetchTemplate = useCallback(async (withHistory = false) => {
    setMessage('')
    try {
      const url = '/api/admin/email-template' + (withHistory ? '?history=1' : '')
      const resp = await adminFetch(url)
      const json = (await resp.json()) as ApiResp
      if (!resp.ok) {
        setMessage(json?.error || 'failed to load')
        return
      }
      // source is not used in the UI for now
      setHtml(json.html || '')
      if (withHistory) setHistory(json.history || [])
    } catch {
      setMessage('Network error when loading template')
    }
  }, [])

  useEffect(() => { fetchTemplate() }, [fetchTemplate])

  // fetchTemplate defined via useCallback above

  async function saveTemplate() {
    setMessage('')
    try {
      const resp = await adminFetch('/api/admin/email-template', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html }),
      })
      const json = (await resp.json()) as ApiResp
      if (!resp.ok) {
        setMessage(json.error || 'save failed')
        return
      }
      setMessage('Saved \u2705')
      fetchTemplate(true)
    } catch {
      setMessage('Network error on save')
    }
  }

  async function deleteTemplate() {
    if (!confirm('Delete the stored welcome template? This cannot be undone.')) return
    setMessage('')
    try {
      const resp = await adminFetch('/api/admin/email-template', { method: 'DELETE' })
      const json = (await resp.json()) as ApiResp
      if (!resp.ok) {
        setMessage(json.error || 'delete failed')
        return
      }
      setMessage('Deleted \u2705')
      setHtml('')
      fetchTemplate(true)
    } catch {
      setMessage('Network error on delete')
    }
  }

  return (
    <main className="min-h-screen">
      <Header isAdmin />

      <div className="p-6 pt-24 max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold dark:text-white mb-4">Email Template Editor</h1>


        <div className="flex gap-3 mb-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={() => fetchTemplate(true)}>Load & History</button>
          <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={saveTemplate}>Save</button>
          <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={deleteTemplate}>Delete</button>
        </div>

        {message && <div className="mb-4 rounded-xl bg-[#212121ff] text-white p-4">{message}</div>}

        <div className="mb-6 rounded-xl bg-[#dfdfdfff] text-black p-4">
          <label className="block mb-2">Template HTML (editing will update what is sent)</label>
          <textarea className="w-full h-72 p-3 border rounded font-mono text-sm" value={html} onChange={e => setHtml(e.target.value)} />
        </div>

        <div className="mb-6 rounded-xl bg-[#dfdfdfff] text-black p-4">
          <h2 className="text-xl font-medium mb-2">Preview</h2>
          <div className="border p-4 rounded bg-white" dangerouslySetInnerHTML={{ __html: html || '<em>No template loaded</em>' }} />
        </div>

        <div className="rounded-xl bg-[#212121ff] text-white p-4">
          <h2 className="text-xl font-medium mb-2">History</h2>
    {!history && <div className="text-sm text-gray-300">No history loaded. Click &quot;Load &amp; History&quot;.</div>}
          {history && history.length === 0 && <div className="text-sm text-gray-300">No edits recorded.</div>}
          {history && history.length > 0 && (
            <ul className="space-y-2">
              {history.map((h, idx) => (
                <li key={idx} className="p-2 border rounded bg-gray-700 text-white">
                  <div><strong>{h.action}</strong> — {new Date(h.timestamp).toLocaleString()}</div>
                  {h.actor && <div className="text-sm text-gray-300">actor: {String(h.actor)}</div>}
                  {h.html && <details className="mt-2"><summary className="cursor-pointer text-sm text-blue-400">View content</summary><div className="mt-2 max-h-48 overflow-auto p-2 bg-gray-600 border text-white">{h.html.substring(0, 200)}{h.html.length > 200 ? '...' : ''}</div></details>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}
