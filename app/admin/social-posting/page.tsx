'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Activity, Settings, PlayCircle, AlertCircle, CheckCircle, XCircle, ArrowRight, RefreshCw } from 'lucide-react'

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
  error?: string
}

export default function SocialPostingCommandCenter() {
  const [platforms, setPlatforms] = useState<PlatformStatus[]>([])
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [isPosting, setIsPosting] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

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

  // Load recent activities - show ALL activities in real-time
  const loadRecentActivities = useCallback(async () => {
    try {
      const response = await fetch('/api/automation/logs?limit=100')
      if (response.ok) {
        const data = await response.json() as { activities?: Array<{
          timestamp: string;
          level: string;
          message: string;
          details?: {
            source?: string;
            platform?: string;
            videoId?: string;
            title?: string;
            error?: string;
            postUrl?: string;
          };
        }> }
        
        // Transform ALL log entries - show everything
        const activities: RecentActivity[] = (data.activities || [])
          .map((entry, idx) => ({
            id: `${entry.timestamp}-${idx}`,
            timestamp: entry.timestamp,
            fromPlatform: entry.details?.source || entry.message.split(' ')[0] || 'system',
            toPlatform: entry.details?.platform || entry.message.split(' ').pop() || 'log',
            success: entry.level === 'success',
            episodeTitle: entry.details?.title,
            error: entry.details?.error || (entry.level === 'error' ? entry.message : undefined)
          }));
        
        // Show ALL activities - accumulate and merge
        setRecentActivities(prev => {
          const combined = [...activities, ...prev]
          const seen = new Set<string>()
          const unique = combined.filter(item => {
            if (seen.has(item.id)) return false
            seen.add(item.id)
            return true
          })
          return unique
        })
      }
    } catch (error) {
      console.error('Failed to load recent activities:', error)
    }
    setLastRefresh(new Date())
  }, [])

  // Real-time auto-refresh
  useEffect(() => {
    loadPlatformStatuses()
    loadRecentActivities()

    const interval = setInterval(() => {
      loadPlatformStatuses()
      loadRecentActivities()
    }, 2000)

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

  const successCount = platforms.filter(p => p.lastResult === 'success').length
  const failedCount = platforms.filter(p => p.lastResult === 'failed').length
  const totalPlatforms = platforms.length

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <Activity className="w-7 h-7 text-purple-500" />
                Social Media Automation
              </h1>
              <p className="text-sm text-gray-400 mt-1">Command Center</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Link
                href="/admin/social-posting/logs"
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Activity className="w-4 h-4" />
                View All Logs
              </Link>
              
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
                {successCount} Active
              </span>
              <span className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500" />
                {failedCount} Failed
              </span>
              <span className="text-gray-500">
                {totalPlatforms} Total
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

        {/* Recent Activity Stream */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
            <div className="text-xs text-gray-500">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </div>
          </div>

          {recentActivities.length === 0 ? (
            <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-8 text-center text-gray-500">
              No recent activity. Click &quot;Post Latest Now&quot; to start posting.
            </div>
          ) : (
            <div className="space-y-2">
              {recentActivities.map((activity) => (
                <Link
                  key={activity.id}
                  href="/admin/social-posting/logs"
                  className="block bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg p-4 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    {/* Status Icon */}
                    <div className="flex-shrink-0">
                      {activity.success ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>

                    {/* Activity Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-gray-400">
                          {activity.timestamp && !isNaN(new Date(activity.timestamp).getTime())
                            ? new Date(activity.timestamp).toLocaleTimeString()
                            : 'Unknown time'}
                        </span>
                        <span className="font-medium text-blue-400">{activity.fromPlatform}</span>
                        <ArrowRight className="w-4 h-4 text-gray-600" />
                        <span className="font-medium text-purple-400">{activity.toPlatform}</span>
                      </div>
                      
                      {activity.episodeTitle && (
                        <div className="text-sm text-gray-300 mt-1 truncate">
                          {activity.episodeTitle}
                        </div>
                      )}
                      
                      {activity.error && (
                        <div className="text-xs text-red-400 mt-1 truncate">
                          {activity.error}
                        </div>
                      )}
                    </div>

                    {/* View Details Arrow */}
                    <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-purple-500 flex-shrink-0 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          )}

          <Link
            href="/admin/social-posting/logs"
            className="mt-4 block text-center py-3 bg-gray-800/30 hover:bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-purple-400 hover:text-purple-300 transition-all"
          >
            View All Activity Logs →
          </Link>
        </div>
      </div>
    </div>
  )
}
