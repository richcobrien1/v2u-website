'use client'

export const dynamic = 'force-dynamic'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import { Activity, Settings, PlayCircle, AlertCircle, CheckCircle, XCircle, ArrowRight, Filter, RefreshCw, Eye } from 'lucide-react'

interface PlatformStatus {
  id: string
  name: string
  type: 'source' | 'target'
  enabled: boolean
  lastResult: 'success' | 'failed' | 'unknown'
  lastActivity: string | null
  errorMessage?: string
}

interface RecentActivity {
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

export default function SocialPostingCommandCenter() {
  const [platforms, setPlatforms] = useState<PlatformStatus[]>([])
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [allActivities, setAllActivities] = useState<RecentActivity[]>([])
  const [isPosting, setIsPosting] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'success' | 'failed'>('all')
  const [platformFilter, setPlatformFilter] = useState<string>('all')
  const [selectedLog, setSelectedLog] = useState<RecentActivity | null>(null)
  const [totalCounts, setTotalCounts] = useState({ all: 0, success: 0, failed: 0 })

  // Load platform statuses
  const loadPlatformStatuses = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/platform-status')
      if (response.ok) {
        const data = await response.json() as { platforms?: PlatformStatus[] }
        setPlatforms(data.platforms || [])
      }
    } catch (error) {
      console.error('Failed to load platform statuses:', error)
    }
  }, [])

  // Load recent activities from Cloudflare KV
  const loadRecentActivities = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/social-posting/logs?days=7`)
      
      if (response.ok) {
        const data = await response.json() as { 
          entries?: Array<{
            timestamp: string;
            type: string;
            level: string;
            message: string;
            details?: {
              platform?: string;
              source?: string;
              episodeTitle?: string;
              title?: string;
              videoId?: string;
              videoUrl?: string;
              postUrl?: string;
              error?: string;
              [key: string]: unknown;
            };
            date?: string;
          }>;
          summary?: {
            totalExecutions: number;
            successfulPosts: number;
            failedPosts: number;
          }
        }
        
        const rawLogs = data.entries || []
        
        // Transform all activities from actual KV log structure
        const activities: RecentActivity[] = rawLogs.map((entry, idx) => {
          const platform = entry.details?.platform || 'unknown'
          const source = entry.details?.source || 'ai-now'
          
          return {
            id: `${entry.timestamp}-${platform}-${idx}`,
            timestamp: entry.timestamp,
            fromPlatform: source,
            toPlatform: platform,
            success: entry.level === 'success',
            episodeTitle: entry.details?.episodeTitle || entry.details?.title,
            episodeId: entry.details?.videoId as string | undefined,
            postUrl: entry.details?.postUrl as string | undefined,
            error: entry.details?.error as string | undefined,
            response: entry.details
          }
        })
        
        setAllActivities(activities)
        
        // Calculate actual counts
        const successCount = activities.filter(a => a.success).length
        const failedCount = activities.filter(a => !a.success).length
        setTotalCounts({
          all: activities.length,
          success: successCount,
          failed: failedCount
        })
      }
    } catch (error) {
      console.error('Failed to load recent activities:', error)
    } finally {
      setIsLoading(false)
      setLastRefresh(new Date())
    }
  }, [])
  
  // Apply client-side filters
  useEffect(() => {
    let filtered = [...allActivities]
    
    // Apply status filter
    if (filter === 'success') {
      filtered = filtered.filter(a => a.success)
    } else if (filter === 'failed') {
      filtered = filtered.filter(a => !a.success)
    }
    
    // Apply platform filter
    if (platformFilter !== 'all') {
      filtered = filtered.filter(a => a.toPlatform === platformFilter)
    }
    
    setRecentActivities(filtered)
  }, [allActivities, filter, platformFilter])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    loadPlatformStatuses()
    loadRecentActivities()

    const interval = setInterval(() => {
      loadPlatformStatuses()
      loadRecentActivities()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [loadPlatformStatuses, loadRecentActivities])

  // Post latest now
  const handlePostLatest = async () => {
    setIsPosting(true)
    try {
      const response = await fetch('/api/automation/post-latest', { method: 'POST' })
      const result = await response.json() as { success?: boolean; error?: string }
      
      // Immediately refresh to show new activity
      await loadRecentActivities()
      await loadPlatformStatuses()
      
      if (!result.success && result.error) {
        alert(`Posting failed: ${result.error}`)
      }
    } catch (error) {
      console.error('Failed to post:', error)
      alert('Failed to trigger posting')
    } finally {
      setIsPosting(false)
    }
  }

  const failedCount = platforms.filter(p => p.lastResult === 'failed').length
  const activePlatforms = platforms.filter(p => p.enabled).length

  return (
    <>
      <Header isAdmin />
      <div className="min-h-screen bg-gray-950 text-white pt-16">
        {/* Page Header */}
        <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <Activity className="w-8 h-8 text-purple-500" />
                  Social Media Automation
                </h1>
                <p className="text-sm text-gray-400 mt-2">Command Center</p>
              </div>
              
              <div className="flex items-center gap-3">
                <Link
                  href="/admin/social-posting/platforms"
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Configure Platforms
                </Link>
                
                <button
                  onClick={handlePostLatest}
                  disabled={isPosting}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                >
                  <PlayCircle className="w-4 h-4" />
                  {isPosting ? 'Posting...' : 'Post Latest Now'}
                </button>
              </div>
            </div>
          </div>
        </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Platform Status Overview */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Platform Status</h2>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                {activePlatforms} Active
              </span>
              <span className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500" />
                {failedCount} Failed
              </span>
              <span className="text-gray-500">
                {platforms.length} Total
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {platforms.map((platform) => (
              <Link
                key={platform.id}
                href="/admin/social-posting/platforms"
                className="bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg p-4 transition-all group"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm font-medium truncate">{platform.name}</span>
                  {platform.lastResult === 'success' && (
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  )}
                  {platform.lastResult === 'failed' && (
                    <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  )}
                  {platform.lastResult === 'unknown' && (
                    <AlertCircle className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  )}
                </div>
                
                <div className="text-xs text-gray-500 capitalize">{platform.type}</div>
                
                {platform.lastActivity && !isNaN(new Date(platform.lastActivity).getTime()) && (
                  <div className="text-xs text-gray-600 mt-2">
                    {new Date(platform.lastActivity).toLocaleTimeString()}
                  </div>
                )}
                
                {platform.errorMessage && (
                  <div className="text-xs text-red-500 mt-2 truncate">
                    {platform.errorMessage}
                  </div>
                )}
                
                <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-purple-500 mt-2 transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        {/* Activity Logs */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Activity Logs</h2>
              <div className="text-sm text-gray-400 mt-1">
                {isLoading ? 'Loading...' : `${recentActivities.length} entries • ${recentActivities.filter(a => a.success).length} success • ${recentActivities.filter(a => !a.success).length} failed`}
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <RefreshCw className="w-3 h-3" />
              Auto-refresh • Last: {lastRefresh.toLocaleTimeString()}
            </div>
          </div>

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
                All ({totalCounts.all})
              </button>
              <button
                onClick={() => setFilter('success')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'success'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Success ({totalCounts.success})
              </button>
              <button
                onClick={() => setFilter('failed')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'failed'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Failed ({totalCounts.failed})
              </button>
            </div>

            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm"
            >
              <option value="all">All Platforms</option>
              {Array.from(new Set(allActivities.map(a => a.toPlatform))).map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {isLoading ? (
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8 text-center text-gray-400">
              Loading activities...
            </div>
          ) : recentActivities.length === 0 ? (
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8 text-center text-gray-400">
              No activity found. Click &quot;Post Latest Now&quot; to start automation.
            </div>
          ) : (
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
                  {recentActivities.map((log) => (
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

              {selectedLog.response ? (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Raw Response</div>
                  <pre className="bg-gray-950 p-4 rounded border border-gray-700 overflow-auto text-xs text-gray-300">
                    {JSON.stringify(selectedLog.response, null, 2)}
                  </pre>
                </div>
              ) : null}

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
    </>
  )
}
