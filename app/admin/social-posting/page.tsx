'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Calendar, Send, Clock, Check, X, ExternalLink, Settings } from 'lucide-react'

interface Episode {
  id: string
  title: string
  description: string
  publishDate: string
  category: string
  youtubeUrl?: string
  rumbleUrl?: string
  spotifyUrl?: string
  r2Key?: string
}

interface Platform {
  id: string
  name: string
  configured: boolean
  icon: string
  note?: string
}

interface PostResult {
  platform: string
  success: boolean
  postId?: string
  url?: string
  error?: string
  postedAt?: string
}

export default function SocialPostingPage() {
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null)
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [customMessage, setCustomMessage] = useState('')
  const [postResults, setPostResults] = useState<PostResult[]>([])
  const [isPosting, setIsPosting] = useState(false)
  const [showScheduler, setShowScheduler] = useState(false)
  const [scheduledTime, setScheduledTime] = useState('')
  const [loading, setLoading] = useState(true)

  // Load episodes and platforms on mount
  useEffect(() => {
    loadEpisodes()
    loadPlatforms()
  }, [])

  async function loadEpisodes() {
    try {
      const response = await fetch('/api/episodes')
      const data = await response.json() as { success: boolean; episodes?: Episode[] }
      if (data.success && data.episodes) {
        setEpisodes(data.episodes)
      }
    } catch (error) {
      console.error('Failed to load episodes:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadPlatforms() {
    try {
      const response = await fetch('/api/social-post')
      const data = await response.json() as { platforms?: Platform[] }
      setPlatforms(data.platforms || [])
    } catch (error) {
      console.error('Failed to load platforms:', error)
    }
  }

  function togglePlatform(platformId: string) {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    )
  }

  function selectAllPlatforms() {
    const configuredPlatforms = platforms
      .filter(p => p.configured)
      .map(p => p.id)
    setSelectedPlatforms(configuredPlatforms)
  }

  function clearPlatforms() {
    setSelectedPlatforms([])
  }

  async function handlePost() {
    if (!selectedEpisode || selectedPlatforms.length === 0) {
      alert('Please select an episode and at least one platform')
      return
    }

    setIsPosting(true)
    setPostResults([])

    try {
      const response = await fetch('/api/social-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platforms: selectedPlatforms,
          episode: selectedEpisode,
          customMessage: customMessage || undefined,
          scheduled: showScheduler,
          scheduledTime: scheduledTime || undefined
        })
      })

      const data = await response.json() as {
        success: boolean;
        results?: Record<string, { success: boolean; error?: string; postId?: string }>;
        error?: string;
      }

      if (data.success && data.results) {
        // Convert results object to array
        const resultsArray = Object.entries(data.results).map(([platform, result]) => ({
          platform,
          ...(result as { success: boolean; error?: string; postId?: string })
        }))
        setPostResults(resultsArray)
      } else {
        alert('Posting failed: ' + (data.error || 'Unknown error'))
      }

    } catch (error) {
      console.error('Post error:', error)
      alert('Failed to post: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setIsPosting(false)
    }
  }

  function generatePreview() {
    if (!selectedEpisode) return ''

    const url = selectedEpisode.youtubeUrl || selectedEpisode.rumbleUrl || selectedEpisode.spotifyUrl || ''
    
    if (customMessage) return customMessage

    return `🎙️ ${selectedEpisode.title}\n\n${selectedEpisode.description.substring(0, 150)}...\n\n🔗 Watch: ${url}\n\n#AINow #AI #Technology`
  }

  return (
    <>
      <Header isAdmin />

      <main className="max-w-7xl mx-auto px-4 py-24 bg-[var(--site-bg)] text-[var(--site-fg)] transition-colors duration-300">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-[var(--site-fg)]">Cross-Platform Social Posting</h1>
          <p className="text-[var(--site-fg)] opacity-75">Post AI-Now episodes to YouTube, Rumble, Spotify and share across social media platforms</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-[var(--site-fg)] opacity-75">Loading episodes...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Episode Selection */}
            <div className="lg:col-span-2 space-y-6">
              {/* Episode Selection */}
              <div className="bg-[var(--site-bg)] border border-[var(--site-fg)] border-opacity-20 rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center text-[var(--site-fg)]">
                  <Calendar className="w-6 h-6 mr-2" />
                  Select Episode
                </h2>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {episodes.map((episode) => (
                    <button
                      key={episode.id}
                      onClick={() => setSelectedEpisode(episode)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition ${
                        selectedEpisode?.id === episode.id
                          ? 'border-blue-600 bg-blue-600 bg-opacity-10'
                          : 'border-[var(--site-fg)] border-opacity-20 hover:border-blue-400'
                      }`}
                    >
                      <h3 className="font-semibold mb-1 text-[var(--site-fg)]">{episode.title}</h3>
                      <p className="text-sm text-[var(--site-fg)] opacity-75 mb-2">{episode.description.substring(0, 100)}...</p>
                      <div className="flex items-center gap-4 text-xs text-[var(--site-fg)] opacity-60">
                        <span>{episode.publishDate}</span>
                        <span className="capitalize">{episode.category.replace('-', ' ')}</span>
                        {episode.youtubeUrl && <span>▶️ YouTube</span>}
                        {episode.rumbleUrl && <span>🎬 Rumble</span>}
                        {episode.spotifyUrl && <span>🎧 Spotify</span>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Message */}
              {selectedEpisode && (
                <div className="bg-[var(--site-bg)] border border-[var(--site-fg)] border-opacity-20 rounded-lg shadow p-6">
                  <h2 className="text-2xl font-bold mb-4 text-[var(--site-fg)]">Customize Message (Optional)</h2>
                  <textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Leave blank to use auto-generated content..."
                    rows={6}
                    className="w-full border border-[var(--site-fg)] border-opacity-30 rounded-lg p-3 font-mono text-sm bg-[var(--site-bg)] text-[var(--site-fg)] placeholder-[var(--site-fg)] placeholder-opacity-50"
                  />

                  <div className="mt-4 p-4 bg-[var(--site-fg)] bg-opacity-5 rounded-lg">
                    <h3 className="font-semibold mb-2 text-[var(--site-fg)]">Preview:</h3>
                    <pre className="text-sm whitespace-pre-wrap text-[var(--site-fg)] opacity-90">
                      {generatePreview()}
                    </pre>
                  </div>
                </div>
              )}

              {/* Post Results */}
              {postResults.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Post Results</h2>
                  <div className="space-y-3">
                    {postResults.map((result, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg border-2 ${
                          result.success
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                            : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {result.success ? (
                              <Check className="w-5 h-5 text-green-600 mr-2" />
                            ) : (
                              <X className="w-5 h-5 text-red-600 mr-2" />
                            )}
                            <span className="font-semibold capitalize text-gray-900 dark:text-white">{result.platform}</span>
                          </div>
                          {result.url && (
                            <a
                              href={result.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center"
                            >
                              <ExternalLink className="w-4 h-4 mr-1" />
                              View Post
                            </a>
                          )}
                        </div>
                        {result.error && (
                          <p className="text-sm text-red-700 dark:text-red-400 mt-2">{result.error}</p>
                        )}
                        {result.postedAt && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Posted at {new Date(result.postedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Platform Selection & Actions */}
            <div className="space-y-6">
              {/* Platform Selection */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Select Platforms</h2>
                  <button
                    onClick={() => window.open('/admin/social-posting/settings', '_blank')}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    title="Platform Settings"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2 mb-4">
                  {platforms.map((platform) => (
                    <button
                      key={platform.id}
                      onClick={() => platform.configured && togglePlatform(platform.id)}
                      disabled={!platform.configured}
                      className={`w-full text-left p-3 rounded-lg border-2 transition ${
                        selectedPlatforms.includes(platform.id)
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                          : platform.configured
                          ? 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                          : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{platform.icon}</span>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">{platform.name}</div>
                            {!platform.configured && (
                              <div className="text-xs text-red-600 dark:text-red-400">Not configured</div>
                            )}
                            {platform.note && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">{platform.note}</div>
                            )}
                          </div>
                        </div>
                        {selectedPlatforms.includes(platform.id) && (
                          <Check className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 mb-6">
                  <button
                    onClick={selectAllPlatforms}
                    className="flex-1 px-3 py-2 text-sm border border-blue-600 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30"
                  >
                    Select All
                  </button>
                  <button
                    onClick={clearPlatforms}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Clear
                  </button>
                </div>

                {/* Scheduler Toggle */}
                <div className="mb-4">
                  <button
                    onClick={() => setShowScheduler(!showScheduler)}
                    className="flex items-center text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    {showScheduler ? 'Post Now' : 'Schedule Post'}
                  </button>

                  {showScheduler && (
                    <input
                      type="datetime-local"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="mt-2 w-full border dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    />
                  )}
                </div>

                {/* Post Button */}
                <button
                  onClick={handlePost}
                  disabled={!selectedEpisode || selectedPlatforms.length === 0 || isPosting}
                  className={`w-full py-4 rounded-lg font-semibold flex items-center justify-center ${
                    !selectedEpisode || selectedPlatforms.length === 0 || isPosting
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isPosting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      {showScheduler ? 'Schedule Post' : 'Post Now'}
                    </>
                  )}
                </button>

                {selectedPlatforms.length > 0 && (
                  <p className="text-sm text-center text-gray-600 dark:text-gray-300 mt-2">
                    Posting to {selectedPlatforms.length} platform{selectedPlatforms.length > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </>
  )
}
