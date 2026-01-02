'use client'

import { useCallback, useEffect, useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { CheckCircle, XCircle, Power, Settings, ChevronDown, ChevronUp, ExternalLink, BarChart3, Smartphone, AlertTriangle, Loader2, Zap } from 'lucide-react'
import Image from 'next/image'

interface PostResult {
  platform: string
  success: boolean
  error?: string
  postUrl?: string
  timestamp: string
  message?: string
}

interface PlatformStatus {
  id: string
  name: string
  icon: string
  enabled: boolean
  validated: boolean
  configured: boolean
  lastPost?: PostResult
}

export default function SocialPostingPage() {
  const [platforms, setPlatforms] = useState<PlatformStatus[]>([])
  const [recentPosts, setRecentPosts] = useState<PostResult[]>([])
  const [automationRunning, setAutomationRunning] = useState(false)
  const [lastCheck, setLastCheck] = useState<string | null>(null)
  const [posting, setPosting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showCredentials, setShowCredentials] = useState(false)
  const [showResultModal, setShowResultModal] = useState(false)
  const [modalResults, setModalResults] = useState<Record<string, { success: boolean; error?: string; postUrl?: string; message?: string }>>({})

  const loadStatus = useCallback(async () => {
    try {
      const [configRes, statusRes] = await Promise.all([
        fetch(`/api/automation/config?t=${Date.now()}`, { cache: 'no-store' }),
        fetch(`/api/automation/status?t=${Date.now()}`, { cache: 'no-store' })
      ])

      const config = await configRes.json() as {
        level2?: Record<string, { 
          name?: string; 
          enabled?: boolean; 
          validated?: boolean; 
          configured?: boolean; 
          lastPostResult?: PostResult 
        }>
      }
      const status = await statusRes.json() as { running?: boolean; lastCheck?: string }

      // Build platform status list
      const platformList: PlatformStatus[] = []
      
      if (config.level2) {
        Object.entries(config.level2).forEach(([id, data]: [string, { name?: string; enabled?: boolean; validated?: boolean; configured?: boolean; lastPostResult?: PostResult }]) => {
          platformList.push({
            id,
            name: data.name || id,
            icon: getIcon(id),
            enabled: data.enabled ?? true,
            validated: data.validated ?? false,
            configured: data.configured ?? false,
            lastPost: data.lastPostResult
          })
        })
      }

      setPlatforms(platformList)
      setAutomationRunning(status.running ?? false)
      setLastCheck(status.lastCheck || null)
      setLoading(false)
    } catch (error) {
      console.error('Failed to load status:', error)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStatus()
    const interval = setInterval(loadStatus, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [loadStatus])

  async function handlePostNow() {
    setPosting(true)
    try {
      const res = await fetch('/api/automation/post-latest', { method: 'POST' })
      const data = await res.json() as {
        results?: Record<string, { 
          success: boolean; 
          error?: string; 
          postUrl?: string; 
          message?: string 
        }>
      }
      
      if (data.results) {
        const posts: PostResult[] = []
        Object.entries(data.results).forEach(([platform, result]: [string, { success: boolean; error?: string; postUrl?: string; message?: string }]) => {
          posts.push({
            platform,
            success: result.success,
            error: result.error,
            postUrl: result.postUrl,
            message: result.message,
            timestamp: new Date().toISOString()
          })
        })
        setRecentPosts(posts)
        
        // Show results modal
        setModalResults(data.results)
        setShowResultModal(true)
      }
      
      await loadStatus()
    } catch (error) {
      console.error('Post failed:', error)
      // Show error modal
      setModalResults({ error: { success: false, error: error instanceof Error ? error.message : 'Unknown error' } })
      setShowResultModal(true)
    } finally {
      setPosting(false)
    }
  }

  async function toggleAutomation() {
    try {
      await fetch('/api/automation/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ running: !automationRunning })
      })
      setAutomationRunning(!automationRunning)
    } catch (error) {
      console.error('Toggle failed:', error)
    }
  }

  function getIcon(platform: string) {
    const logoMap: Record<string, string> = {
      'twitter': '/logos/x-logo.svg',
      'twitter-ainow': '/logos/x-logo.svg',
      'facebook': '/logos/facebook-logo.svg',
      'facebook-ainow': '/logos/facebook-logo.svg',
      'linkedin': '/logos/linkedin-logo.svg',
      'instagram': '/logos/instagram-logo.svg',
      'instagram-ainow': '/logos/instagram-logo.svg',
      'threads': '/logos/threads-logo.svg',
      'bluesky': '/logos/bluesky-logo.svg',
      'tiktok': '/logos/tiktok-logo.svg',
      'odysee': '/logos/odysee-logo.svg',
      'vimeo': '/logos/vimeo-logo.svg'
    }
    return logoMap[platform] || '/logos/default-logo.svg'
  }

  function PlatformLogo({ platform, size = 32 }: { platform: string; size?: number }) {
    const logoPath = getIcon(platform)
    const platformName = platform.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
    
    return (
      <div className="relative bg-white dark:bg-white rounded-lg p-2 shadow-sm" style={{ width: size + 16, height: size + 16 }}>
        <Image
          src={logoPath}
          alt={`${platformName} logo`}
          width={size}
          height={size}
          className="object-contain"
          onError={(e) => {
            // Fallback to text if logo doesn't exist
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
            if (target.parentElement) {
              target.parentElement.innerHTML = `<span style="font-size: ${size * 0.6}px">${platform[0].toUpperCase()}</span>`
            }
          }}
        />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-black">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center py-20">Loading...</div>
        </main>
        <Footer />
      </div>
    )
  }

  const enabledPlatforms = platforms.filter(p => p.enabled)
  const workingPlatforms = enabledPlatforms.filter(p => p.validated)
  const brokenPlatforms = enabledPlatforms.filter(p => !p.validated)

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-12 mt-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-gray-100">Social Media Automation</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Automatic cross-posting from YouTube/Spotify/Rumble to {enabledPlatforms.length} platforms
            </p>
          </div>

          {/* Automation Control */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-2xl p-8 mb-8 border-2 border-black dark:border-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">Automation Status</h2>
                <div className="flex items-center gap-3">
                  {automationRunning ? (
                    <>
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                      <div>
                        <span className="text-lg font-medium text-gray-900 dark:text-gray-100">Running - Checks every hour</span>
                        {lastCheck && (
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Last check: {new Date(lastCheck).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-3 h-3 bg-gray-400 rounded-full" />
                      <span className="text-lg font-medium text-gray-600 dark:text-gray-400">Stopped</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={handlePostNow}
                  disabled={posting}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-lg rounded-xl hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 transition-all transform hover:scale-105 flex items-center gap-2"
                >
                  {posting ? (
                    <><Loader2 className="animate-spin" size={20} /> Posting...</>
                  ) : (
                    <><Zap size={20} /> Post Latest Now</>
                  )}
                </button>
                
                <button
                  onClick={toggleAutomation}
                  className={`px-6 py-4 font-bold rounded-xl border-2 transition-all ${
                    automationRunning
                      ? 'bg-red-500 text-white border-red-600 hover:bg-red-600'
                      : 'bg-green-500 text-white border-green-600 hover:bg-green-600'
                  }`}
                >
                  <Power className="inline mr-2" />
                  {automationRunning ? 'Stop' : 'Start'}
                </button>
              </div>
            </div>
          </div>

          {/* Level 1 Source Platforms */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
              📺 Content Sources (Level 1)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-xl border-2 bg-green-50 dark:bg-green-950 border-green-500 text-center">
                <div className="flex justify-center mb-3">
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <Image src="/logos/youtube-logo.svg" alt="YouTube" width={56} height={56} />
                  </div>
                </div>
                <div className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2">YouTube</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">AI-Now Podcast</div>
                <div className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center justify-center gap-1">
                  <CheckCircle size={12} /> Connected
                </div>
              </div>
              
              <div className="p-6 rounded-xl border-2 bg-green-50 dark:bg-green-950 border-green-500 text-center">
                <div className="flex justify-center mb-3">
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <Image src="/logos/spotify-logo.svg" alt="Spotify" width={56} height={56} />
                  </div>
                </div>
                <div className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2">Spotify</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">AI-Now Podcast</div>
                <div className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center justify-center gap-1">
                  <CheckCircle size={12} /> Connected
                </div>
              </div>
              
              <div className="p-6 rounded-xl border-2 bg-blue-50 dark:bg-blue-950 border-blue-500 text-center">
                <div className="flex justify-center mb-3">
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <Image src="/logos/rumble-logo.svg" alt="Rumble" width={56} height={56} />
                  </div>
                </div>
                <div className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2">Rumble</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">AI-Now Channel</div>
                <div className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center justify-center gap-1">
                  <CheckCircle size={12} /> Connected
                </div>
              </div>
            </div>
          </div>

          {/* Platform Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-green-50 dark:bg-green-950 rounded-xl p-6 border-2 border-green-500">
              <div className="text-4xl font-bold text-green-600 dark:text-green-400">{workingPlatforms.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Platforms Working</div>
            </div>
            
            <div className="bg-red-50 dark:bg-red-950 rounded-xl p-6 border-2 border-red-500">
              <div className="text-4xl font-bold text-red-600 dark:text-red-400">{brokenPlatforms.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Need Attention</div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-950 rounded-xl p-6 border-2 border-blue-500">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">{recentPosts.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Recent Posts</div>
            </div>
          </div>

          {/* Recent Posts */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100"><BarChart3 size={28} /> Latest Posting Results</h2>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border-2 border-black dark:border-white">
              {recentPosts.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <BarChart3 size={48} className="mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium">No posts yet this session</p>
                  <p className="text-sm mt-2">Click &quot;Post Latest Now&quot; to publish to all platforms</p>
                  <p className="text-sm mt-1">Results and links will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentPosts.map((post, i) => (
                    <div key={i} className={`flex items-center justify-between p-4 rounded-lg ${
                      post.success ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
                    }`}>
                      <div className="flex items-center gap-3">
                        <PlatformLogo platform={post.platform} size={32} />
                        <div>
                          <div className="font-bold text-gray-900 dark:text-gray-100">{post.platform.replace('-', ' ').toUpperCase()}</div>
                          {post.message && <div className="text-sm text-gray-700 dark:text-gray-300">{post.message}</div>}
                          {post.error && <div className="text-sm text-red-700 dark:text-red-300">{post.error}</div>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {post.postUrl && (
                          <a
                            href={post.postUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                          >
                            <ExternalLink size={20} />
                          </a>
                        )}
                        <div className="flex items-center gap-2">
                          {post.success ? (
                            <>
                              <CheckCircle className="text-green-600" size={24} />
                              <span className="text-sm font-bold text-green-600">Posted</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="text-red-600" size={24} />
                              <span className="text-sm font-bold text-red-600">Failed</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Platform Status Cards */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100"><Smartphone size={28} /> Platform Status</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {platforms.map(p => (
                <div
                  key={p.id}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    !p.enabled
                      ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 opacity-50'
                      : p.validated
                      ? 'bg-green-50 dark:bg-green-950 border-green-500'
                      : 'bg-red-50 dark:bg-red-950 border-red-500'
                  }`}
                >
                  <div className="flex justify-center mb-2">
                    <PlatformLogo platform={p.id} size={40} />
                  </div>
                  <div className="font-bold text-sm text-gray-900 dark:text-gray-100">{p.name}</div>
                  {p.id.includes('ainow') && <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">AI-Now</div>}
                  {!p.id.includes('ainow') && p.id !== 'threads' && <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">V2U</div>}
                  {!p.enabled && <div className="text-xs text-gray-500 mt-1">Disabled</div>}
                  {p.enabled && !p.validated && <div className="text-xs text-red-600 mt-1 flex items-center justify-center gap-1"><AlertTriangle size={12} /> Fix</div>}
                  {p.enabled && p.validated && <div className="text-xs text-green-600 mt-1 flex items-center justify-center gap-1"><CheckCircle size={12} /> Ready</div>}
                  {p.lastPost && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {new Date(p.lastPost.timestamp).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Collapsible Credentials Section */}
          <div className="mb-8">
            <button
              onClick={() => setShowCredentials(!showCredentials)}
              className="w-full flex items-center justify-between p-6 bg-gray-100 dark:bg-gray-900 rounded-xl border-2 border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Settings size={24} />
                <span className="text-xl font-bold">Advanced Settings & Credentials</span>
              </div>
              {showCredentials ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
            </button>
            
            {showCredentials && (
              <div className="mt-4 p-6 bg-gray-50 dark:bg-gray-900 rounded-xl border-2 border-gray-300 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  🔧 For credential management and detailed configuration, use the dedicated admin page:
                </p>
                <a
                  href="/admin/social-posting/settings"
                  className="inline-block px-6 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Go to Credential Settings →
                </a>
              </div>
            )}
          </div>

        </div>
      </main>
      
      <Footer />
      
      {/* Results Modal */}
      {showResultModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowResultModal(false)}
        >
          <div 
            className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                ✅ Posting Complete!
              </h2>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-lg p-4">
                  <div className="text-3xl font-bold text-green-600">
                    {Object.values(modalResults).filter(r => r.success).length}
                  </div>
                  <div className="text-sm font-medium text-green-800 dark:text-green-200">Success</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-lg p-4">
                  <div className="text-3xl font-bold text-red-600">
                    {Object.values(modalResults).filter(r => !r.success).length}
                  </div>
                  <div className="text-sm font-medium text-red-800 dark:text-red-200">Failed</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 rounded-lg p-4">
                  <div className="text-3xl font-bold text-blue-600">
                    {Object.keys(modalResults).length}
                  </div>
                  <div className="text-sm font-medium text-blue-800 dark:text-blue-200">Total</div>
                </div>
              </div>

              {/* Results List */}
              <div className="space-y-3">
                {Object.entries(modalResults).map(([platform, result]) => (
                  <div
                    key={platform}
                    className={`p-4 rounded-lg border-2 ${
                      result.success
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                        : 'bg-red-50 dark:bg-red-900/20 border-red-500'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {result.success ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                          <span className="font-bold text-gray-900 dark:text-gray-100 capitalize">
                            {platform.replace('-', ' ')}
                          </span>
                        </div>
                        {result.message && (
                          <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                            {result.message}
                          </div>
                        )}
                        {result.error && (
                          <div className="text-sm text-red-700 dark:text-red-300 mb-1">
                            {result.error}
                          </div>
                        )}
                        {result.postUrl && (
                          <a
                            href={result.postUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                          >
                            View Post <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowResultModal(false)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
