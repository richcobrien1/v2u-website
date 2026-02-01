'use client'


import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Calendar, Clock, Trash2, CheckCircle, XCircle, RefreshCw } from 'lucide-react'

interface ScheduledPost {
  id: string
  episodeId: string
  episodeTitle: string
  platforms: string[]
  customMessage?: string
  scheduledTime: string
  status: 'pending' | 'completed' | 'failed'
  createdAt: string
  executedAt?: string
  results?: Record<string, { success: boolean; error?: string; postId?: string }>
}

export default function ScheduledPostsPage() {
  const [scheduled, setScheduled] = useState<ScheduledPost[]>([])
  const [history, setHistory] = useState<ScheduledPost[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState<string | null>(null)

  useEffect(() => {
    loadScheduledPosts()
  }, [])

  async function loadScheduledPosts() {
    setLoading(true)
    try {
      const response = await fetch('/api/social-schedule')
      const data = await response.json() as {
        scheduled?: ScheduledPost[]
        history?: ScheduledPost[]
        due?: number
        total?: number
      }
      
      if (data.scheduled) {
        setScheduled(data.scheduled)
      }
      if (data.history) {
        setHistory(data.history)
      }
    } catch (error) {
      console.error('Failed to load scheduled posts:', error)
    } finally {
      setLoading(false)
    }
  }

  async function cancelPost(id: string) {
    if (!confirm('Are you sure you want to cancel this scheduled post?')) {
      return
    }

    setCancelling(id)
    try {
      const response = await fetch(`/api/social-schedule?id=${id}`, {
        method: 'DELETE'
      })

      const data = await response.json() as { success: boolean; message?: string }

      if (data.success) {
        await loadScheduledPosts()
      } else {
        alert('Failed to cancel post')
      }
    } catch (error) {
      console.error('Failed to cancel post:', error)
      alert('Failed to cancel post')
    } finally {
      setCancelling(null)
    }
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  function getTimeUntil(dateString: string): string {
    const now = new Date()
    const scheduled = new Date(dateString)
    const diff = scheduled.getTime() - now.getTime()

    if (diff < 0) {
      return 'Overdue'
    }

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return `${days} day${days > 1 ? 's' : ''}`
    }

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }

    return `${minutes}m`
  }

  return (
    <>
      <Header isAdmin />

      <main className="max-w-7xl mx-auto px-4 py-24 bg-[var(--site-bg)] text-[var(--site-fg)] transition-colors duration-300">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-[var(--site-fg)]">Scheduled Posts</h1>
            <p className="text-[var(--site-fg)] opacity-75">Manage upcoming and past scheduled social media posts</p>
          </div>
          <button
            onClick={loadScheduledPosts}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-[var(--site-fg)] opacity-75">Loading scheduled posts...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Upcoming Posts */}
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center text-[var(--site-fg)]">
                <Calendar className="w-6 h-6 mr-2" />
                Upcoming Posts ({scheduled.length})
              </h2>

              {scheduled.length === 0 ? (
                <div className="bg-[var(--site-bg)] border border-[var(--site-fg)] border-opacity-20 rounded-lg shadow p-8 text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-[var(--site-fg)] opacity-40" />
                  <p className="text-[var(--site-fg)] opacity-75">No scheduled posts</p>
                  <p className="text-sm text-[var(--site-fg)] opacity-60 mt-2">
                    Schedule posts from the <a href="/admin/social-posting" className="text-blue-600 hover:text-blue-700">Social Posting</a> page
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {scheduled.map((post) => (
                    <div
                      key={post.id}
                      className="bg-[var(--site-bg)] border border-[var(--site-fg)] border-opacity-20 rounded-lg shadow p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-2 text-[var(--site-fg)]">{post.episodeTitle}</h3>
                          <div className="flex items-center gap-4 text-sm text-[var(--site-fg)] opacity-75">
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {formatDate(post.scheduledTime)}
                            </span>
                            <span className="px-2 py-1 bg-blue-500 bg-opacity-20 text-blue-600 rounded">
                              in {getTimeUntil(post.scheduledTime)}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => cancelPost(post.id)}
                          disabled={cancelling === post.id}
                          className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                        >
                          {cancelling === post.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                          Cancel
                        </button>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm font-semibold text-[var(--site-fg)] opacity-75 mb-2">Platforms:</p>
                        <div className="flex flex-wrap gap-2">
                          {post.platforms.map((platform) => (
                            <span
                              key={platform}
                              className="px-3 py-1 bg-[var(--site-fg)] bg-opacity-10 text-[var(--site-fg)] rounded-full text-sm capitalize"
                            >
                              {platform}
                            </span>
                          ))}
                        </div>
                      </div>

                      {post.customMessage && (
                        <div className="mt-4 p-3 bg-[var(--site-fg)] bg-opacity-5 rounded-lg">
                          <p className="text-sm font-semibold text-[var(--site-fg)] opacity-75 mb-1">Custom Message:</p>
                          <p className="text-sm text-[var(--site-fg)] opacity-90 whitespace-pre-wrap">{post.customMessage}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* History */}
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center text-[var(--site-fg)]">
                <Clock className="w-6 h-6 mr-2" />
                Recent History ({history.length})
              </h2>

              {history.length === 0 ? (
                <div className="bg-[var(--site-bg)] border border-[var(--site-fg)] border-opacity-20 rounded-lg shadow p-8 text-center">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-[var(--site-fg)] opacity-40" />
                  <p className="text-[var(--site-fg)] opacity-75">No post history</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((post) => (
                    <div
                      key={post.id}
                      className={`bg-[var(--site-bg)] border-2 rounded-lg shadow p-6 ${
                        post.status === 'completed'
                          ? 'border-green-500 border-opacity-30'
                          : 'border-red-500 border-opacity-30'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {post.status === 'completed' ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-600" />
                            )}
                            <h3 className="text-xl font-semibold text-[var(--site-fg)]">{post.episodeTitle}</h3>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-[var(--site-fg)] opacity-75">
                            <span>Scheduled: {formatDate(post.scheduledTime)}</span>
                            {post.executedAt && (
                              <span>Executed: {formatDate(post.executedAt)}</span>
                            )}
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            post.status === 'completed'
                              ? 'bg-green-500 bg-opacity-20 text-green-700 dark:text-green-400'
                              : 'bg-red-500 bg-opacity-20 text-red-700 dark:text-red-400'
                          }`}
                        >
                          {post.status}
                        </span>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm font-semibold text-[var(--site-fg)] opacity-75 mb-2">Platforms:</p>
                        <div className="flex flex-wrap gap-2">
                          {post.platforms.map((platform) => (
                            <span
                              key={platform}
                              className="px-3 py-1 bg-[var(--site-fg)] bg-opacity-10 text-[var(--site-fg)] rounded-full text-sm capitalize"
                            >
                              {platform}
                            </span>
                          ))}
                        </div>
                      </div>

                      {post.results && (
                        <div className="mt-4 space-y-2">
                          <p className="text-sm font-semibold text-[var(--site-fg)] opacity-75">Results:</p>
                          {Object.entries(post.results).map(([platform, result]) => (
                            <div
                              key={platform}
                              className={`p-2 rounded text-sm ${
                                result.success
                                  ? 'bg-green-500 bg-opacity-10 text-green-700 dark:text-green-400'
                                  : 'bg-red-500 bg-opacity-10 text-red-700 dark:text-red-400'
                              }`}
                            >
                              <span className="font-semibold capitalize">{platform}:</span>{' '}
                              {result.success ? 'Posted successfully' : result.error || 'Failed'}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </>
  )
}
