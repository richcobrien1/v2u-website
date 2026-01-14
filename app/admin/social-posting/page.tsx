'use client'

export const dynamic = 'force-dynamic'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Activity, Settings, PlayCircle, AlertCircle, CheckCircle, XCircle, ArrowRight } from 'lucide-react'

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
  const [isLoading, setIsLoading] = useState(true)

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
      const response = await fetch('/api/admin/social-posting/activity')
      if (response.ok) {
        const data = await response.json() as { 
          recentActivity?: Array<{
            timestamp: string;
            platform: string;
            status: 'success' | 'failed' | 'active';
            videoTitle?: string;
            videoId?: string;
            videoUrl?: string;
            error?: string;
            details?: Record<string, unknown>;
            date?: string;
          }> 
        }
        
        const rawLogs = data.recentActivity || []
        
        // Transform and show logs immediately as they arrive
        const activities: RecentActivity[] = rawLogs.map((entry, idx) => {
          return {
            id: `${entry.timestamp}-${entry.platform}-${idx}`,
            timestamp: entry.timestamp,
            fromPlatform: 'ai-now',
            toPlatform: entry.platform,
            success: entry.status === 'success',
            episodeTitle: entry.videoTitle,
            error: entry.error
          }
        })
        
        setRecentActivities(activities)
      }
    } catch (error) {
      console.error('Failed to load recent activities:', error)
    } finally {
      setIsLoading(false)
      setLastRefresh(new Date())
    }
  }, [])
  
  // Auto-refresh every 10 seconds (reasonable interval)
  useEffect(() => {
    loadPlatformStatuses()
    loadRecentActivities()

    const interval = setInterval(() => {
      loadPlatformStatuses()
      loadRecentActivities()
    }, 10000) // 10 seconds

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
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
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

        {/* Recent Activity Stream */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Recent Activity</h2>
              <div className="text-sm text-gray-400 mt-1">
                {isLoading ? 'Loading...' : `${recentActivities.length} activities (last 7 days)`}
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </div>
          </div>

          {isLoading ? (
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8 text-center text-gray-400">
              Loading activities...
            </div>
          ) : recentActivities.length === 0 ? (
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8 text-center text-gray-400">
              No recent activity. Click &quot;Post Latest Now&quot; to start automation.
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
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
