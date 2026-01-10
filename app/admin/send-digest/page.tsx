'use client'

import { useState } from 'react'

interface DigestLog {
  timestamp: string
  sent: number
  failed: number
  total: number
}

export default function SendDigestPage() {
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    sent?: number
    failed?: number
    total?: number
    episodes?: number
    errors?: string[]
    error?: string
  } | null>(null)
  const [logs, setLogs] = useState<DigestLog[]>([])
  const [logsLoading, setLogsLoading] = useState(false)

  const handleSendDigest = async () => {
    if (!confirm('Are you sure you want to send the weekly digest to ALL subscribers?')) {
      return
    }

    setSending(true)
    setResult(null)

    try {
      const adminSecret = prompt('Enter ADMIN_SECRET:')
      if (!adminSecret) {
        setSending(false)
        return
      }

      const response = await fetch('/api/send-weekly-digest', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminSecret}`,
        },
      })

      const data = await response.json() as {
        success: boolean
        sent?: number
        failed?: number
        total?: number
        episodes?: number
        errors?: string[]
        error?: string
      }
      setResult(data)

      if (data.success) {
        // Refresh logs after successful send
        await fetchLogs()
      }
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setSending(false)
    }
  }

  const fetchLogs = async () => {
    setLogsLoading(true)
    try {
      const response = await fetch('/api/digest-logs')
      if (response.ok) {
        const data = await response.json() as { logs?: DigestLog[] }
        setLogs(data.logs || [])
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    } finally {
      setLogsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-2">Send Weekly Digest</h1>
          <p className="text-gray-600 mb-8">
            Send the weekly AI digest email to all subscribers
          </p>

          {/* Send Button */}
          <div className="mb-8">
            <button
              onClick={handleSendDigest}
              disabled={sending}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {sending ? '🔄 Sending...' : '📧 Send Weekly Digest'}
            </button>
          </div>

          {/* Result Display */}
          {result && (
            <div
              className={`p-6 rounded-lg mb-8 ${
                result.success
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              <h2
                className={`text-xl font-semibold mb-4 ${
                  result.success ? 'text-green-900' : 'text-red-900'
                }`}
              >
                {result.success ? '✅ Digest Sent Successfully' : '❌ Send Failed'}
              </h2>

              {result.success && (
                <div className="space-y-2 text-gray-700">
                  <p>
                    <strong>Episodes included:</strong> {result.episodes}
                  </p>
                  <p>
                    <strong>Emails sent:</strong> {result.sent} / {result.total}
                  </p>
                  {result.failed ? (
                    <p className="text-orange-600">
                      <strong>Failed:</strong> {result.failed}
                    </p>
                  ) : null}
                </div>
              )}

              {result.error && (
                <p className="text-red-700">
                  <strong>Error:</strong> {result.error}
                </p>
              )}

              {result.errors && result.errors.length > 0 && (
                <details className="mt-4">
                  <summary className="cursor-pointer font-semibold text-orange-700">
                    View Errors ({result.errors.length})
                  </summary>
                  <ul className="mt-2 text-sm text-gray-600 list-disc pl-5">
                    {result.errors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}

          {/* Logs Section */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Send History</h2>
              <button
                onClick={fetchLogs}
                disabled={logsLoading}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 transition text-sm"
              >
                {logsLoading ? '🔄 Loading...' : '🔄 Refresh'}
              </button>
            </div>

            {logs.length === 0 && !logsLoading && (
              <p className="text-gray-500 text-center py-8">
                No digest sends recorded yet
              </p>
            )}

            {logs.length > 0 && (
              <div className="space-y-4">
                {logs.map((log, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {new Date(log.timestamp).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Sent: {log.sent} · Failed: {log.failed} · Total: {log.total}
                        </p>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          log.failed === 0
                            ? 'bg-green-100 text-green-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {log.failed === 0 ? '✓ Success' : '⚠ Partial'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
