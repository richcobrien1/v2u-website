'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Filter, CheckCircle, XCircle, ArrowRight, RefreshCw, Eye } from 'lucide-react'

interface LogEntry {
  id: string
  timestamp: string
  fromPlatform: string
  toPlatform: string
  success: boolean
  episodeTitle?: string
  episodeId?: string
  postUrl?: string
  error?: string
  response?: unknown
}

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [filter, setFilter] = useState<'all' | 'success' | 'failed'>('all')
  const [platformFilter, setPlatformFilter] = useState<string>('all')
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const loadLogs = useCallback(async () => {
    try {
      const response = await fetch('/api/automation/logs?limit=100')
      if (response.ok) {
        const data = await response.json()
        setLogs(data.activities || [])
      }
    } catch (error) {
      console.error('Failed to load logs:', error)
    }
    setLastRefresh(new Date())
  }, [])

  useEffect(() => {
    loadLogs()
    const interval = setInterval(loadLogs, 100) // Real-time updates
    return () => clearInterval(interval)
  }, [loadLogs])

  const filteredLogs = logs.filter(log => {
    if (filter === 'success' && !log.success) return false
    if (filter === 'failed' && log.success) return false
    if (platformFilter !== 'all' && log.toPlatform !== platformFilter) return false
    return true
  })

  const platforms = Array.from(new Set(logs.map(l => l.toPlatform)))
  const successCount = filteredLogs.filter(l => l.success).length
  const failedCount = filteredLogs.filter(l => !l.success).length

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/social-posting"
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Activity Logs</h1>
                <p className="text-sm text-gray-400 mt-1">
                  {filteredLogs.length} entries • {successCount} success • {failedCount} failed
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <RefreshCw className="w-3 h-3" />
              Real-time updates
              <span className="ml-2">Last: {lastRefresh.toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <Filter className="w-5 h-5 text-gray-500" />
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              All ({logs.length})
            </button>
            <button
              onClick={() => setFilter('success')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'success'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Success ({logs.filter(l => l.success).length})
            </button>
            <button
              onClick={() => setFilter('failed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'failed'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Failed ({logs.filter(l => !l.success).length})
            </button>
          </div>

          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm"
          >
            <option value="all">All Platforms</option>
            {platforms.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Logs Table */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-900/50">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Time</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">From</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">To</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Episode</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Result</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-400">Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  className={`border-b border-gray-700/50 hover:bg-gray-800/30 transition-colors ${
                    !log.success ? 'bg-red-950/10' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    {log.success ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-blue-400">{log.fromPlatform}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-purple-400">{log.toPlatform}</span>
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <div className="text-sm text-gray-300 truncate">{log.episodeTitle || 'N/A'}</div>
                    {log.episodeId && (
                      <div className="text-xs text-gray-600">{log.episodeId}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    {log.postUrl ? (
                      <a
                        href={log.postUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-400 hover:text-blue-300 truncate block"
                      >
                        View Post →
                      </a>
                    ) : log.error ? (
                      <div className="text-xs text-red-400 truncate">{log.error}</div>
                    ) : (
                      <span className="text-sm text-gray-500">No URL</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white"
                    >
                      <Eye className="w-4 h-4" />
                      Response
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredLogs.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No logs found matching the current filters.
            </div>
          )}
        </div>
      </div>

      {/* Response Modal */}
      {selectedLog && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedLog(null)}
        >
          <div
            className="bg-gray-900 border border-gray-700 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Platform Response</h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">From → To</div>
                <div className="text-lg font-medium">
                  {selectedLog.fromPlatform} → {selectedLog.toPlatform}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-1">Timestamp</div>
                <div>{new Date(selectedLog.timestamp).toLocaleString()}</div>
              </div>

              {selectedLog.episodeTitle && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Episode</div>
                  <div>{selectedLog.episodeTitle}</div>
                </div>
              )}

              {selectedLog.postUrl && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Post URL</div>
                  <a
                    href={selectedLog.postUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 break-all"
                  >
                    {selectedLog.postUrl}
                  </a>
                </div>
              )}

              {selectedLog.error && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Error</div>
                  <div className="text-red-400 bg-red-950/20 p-4 rounded border border-red-900">
                    {selectedLog.error}
                  </div>
                </div>
              )}

              {selectedLog.response && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Raw Response</div>
                  <pre className="bg-gray-950 p-4 rounded border border-gray-700 overflow-auto text-xs text-gray-300">
                    {JSON.stringify(selectedLog.response, null, 2)}
                  </pre>
                </div>
              )}

              <div className="pt-4 border-t border-gray-700">
                <Link
                  href="/admin/social-posting/platforms"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Configure {selectedLog.toPlatform} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
