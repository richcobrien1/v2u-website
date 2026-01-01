'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useTheme } from '@/components/theme/ThemeContext'
import { Settings, Play, Square, Clock, Check, X, RefreshCw, Key, Timer } from 'lucide-react'

interface PlatformConfig {
  id: string
  name: string
  icon: string
  configured: boolean
  credentials: Record<string, string>
  checkInterval?: number
  lastCheck?: string
  latestVideo?: string
  lastPostResult?: LastPostResult
}

type LastPostResult = {
  postUrl?: string
  postedAt?: string
  // allow other misc fields but restrict to primitives or undefined
  [key: string]: string | number | boolean | undefined
}

interface AutomationStatus {
  running: boolean
  lastCheck: string | null
  nextCheck: string | null
  checksToday: number
}

export default function AutomationControlPanel() {
  const [level1Platforms, setLevel1Platforms] = useState<PlatformConfig[]>([])
  const [level2Platforms, setLevel2Platforms] = useState<PlatformConfig[]>([])
  const [automationStatus, setAutomationStatus] = useState<AutomationStatus>({
    running: false,
    lastCheck: null,
    nextCheck: null,
    checksToday: 0
  })
  const [editingPlatform, setEditingPlatform] = useState<string | null>(null)
  const [credentials, setCredentials] = useState<Record<string, string>>({})
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  useEffect(() => {
    loadConfigurations()
    loadAutomationStatus()
  }, [])

  async function loadConfigurations() {
    // Load Level 1 platforms (Content sources)
    const level1: PlatformConfig[] = [
      {
        id: 'youtube',
        name: 'YouTube',
        icon: '🎥',
        configured: false,
        checkInterval: 60,
        credentials: {
          YOUTUBE_CLIENT_ID: '',
          YOUTUBE_CLIENT_SECRET: '',
          YOUTUBE_API_KEY: '',
          YOUTUBE_CHANNEL_ID: ''
        }
      },
      {
        id: 'rumble',
        name: 'Rumble',
        icon: '📹',
        configured: false,
        checkInterval: 60,
        credentials: {
          RUMBLE_API_KEY: '',
          RUMBLE_CHANNEL_ID: ''
        }
      },
      {
        id: 'spotify',
        name: 'Spotify',
        icon: '🎵',
        configured: false,
        checkInterval: 60,
        credentials: {
          SPOTIFY_CLIENT_ID: '',
          SPOTIFY_CLIENT_SECRET: '',
          SPOTIFY_SHOW_ID: ''
        }
      }
    ]

    // Load Level 2 platforms (Social promotion)
    const level2: PlatformConfig[] = [
      {
        id: 'twitter',
        name: 'X (Twitter)',
        icon: '𝕏',
        configured: false,
        credentials: {
          TWITTER_API_KEY: '',
          TWITTER_API_SECRET: '',
          TWITTER_ACCESS_TOKEN: '',
          TWITTER_ACCESS_SECRET: ''
        }
      },
      {
        id: 'linkedin',
        name: 'LinkedIn',
        icon: '💼',
        configured: false,
        credentials: {
          LINKEDIN_ACCESS_TOKEN: '',
          LINKEDIN_PERSON_URN: ''
        }
      },
      {
        id: 'facebook',
        name: 'Facebook',
        icon: '📘',
        configured: false,
        credentials: {
          FACEBOOK_PAGE_ACCESS_TOKEN: '',
          FACEBOOK_PAGE_ID: ''
        }
      }
    ]

    // Load actual status from API
    try {
      const response = await fetch('/api/automation/config')
      const data = await response.json() as { 
        level1?: Record<string, { configured: boolean; lastCheck?: string; latestVideo?: string }>
        level2?: Record<string, { configured: boolean; lastPostResult?: LastPostResult }>
      }
      
      // Merge with actual configuration
      if (data.level1) {
        level1.forEach(p => {
          if (data.level1?.[p.id]) {
            p.configured = data.level1[p.id].configured
            p.lastCheck = data.level1[p.id].lastCheck
            p.latestVideo = data.level1[p.id].latestVideo
          }
        })
      }
      
      if (data.level2) {
        level2.forEach(p => {
          if (data.level2?.[p.id]) {
            p.configured = data.level2[p.id].configured
            // Attach lastPostResult when available so the admin UI can show repost receipts
            const maybePost = data.level2[p.id]?.lastPostResult;
            if (maybePost) {
              p.lastPostResult = maybePost;
            }
          }
        })
      }
    } catch (error) {
      console.error('Failed to load configurations:', error)
    }

    setLevel1Platforms(level1)
    setLevel2Platforms(level2)
  }

  async function loadAutomationStatus() {
    try {
      const response = await fetch('/api/automation/status')
      const data = await response.json() as AutomationStatus
      setAutomationStatus(data)
    } catch (error) {
      console.error('Failed to load automation status:', error)
    }
  }

  async function toggleAutomation() {
    try {
      const newState = !automationStatus.running
      const response = await fetch('/api/automation/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle', running: newState })
      })
      
      if (response.ok) {
        setAutomationStatus(prev => ({ ...prev, running: newState }))
      }
    } catch (error) {
      console.error('Failed to toggle automation:', error)
      alert('Failed to toggle automation')
    }
  }

  async function checkNow() {
    try {
      const response = await fetch('/api/automation/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check-now' })
      })
      
      if (response.ok) {
        alert('Manual check started! Check results will appear shortly.')
        await loadConfigurations()
        await loadAutomationStatus()
      }
    } catch (error) {
      console.error('Failed to trigger check:', error)
      alert('Failed to trigger check')
    }
  }

  async function saveCredentials(platformId: string, level: 1 | 2) {
    try {
      const response = await fetch('/api/automation/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save-credentials',
          platform: platformId,
          level,
          credentials
        })
      })
      
      if (response.ok) {
        alert('Credentials saved to Cloudflare KV!')
        setEditingPlatform(null)
        setCredentials({})
        await loadConfigurations()
      }
    } catch (error) {
      console.error('Failed to save credentials:', error)
      alert('Failed to save credentials')
    }
  }

  function startEdit(platform: PlatformConfig) {
    setEditingPlatform(platform.id)
    setCredentials({ ...platform.credentials })
  }

  function renderPlatformCard(platform: PlatformConfig, level: 1 | 2) {
    const isEditing = editingPlatform === platform.id

    return (
      <div key={platform.id} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <span className="text-3xl mr-3">{platform.icon}</span>
            <div>
              <h3 className="font-bold text-lg">{platform.name}</h3>
              {platform.configured ? (
                <span className="text-xs text-green-600 flex items-center">
                  <Check className="w-3 h-3 mr-1" />
                  Configured
                </span>
              ) : (
                <span className="text-xs text-red-600 flex items-center">
                  <X className="w-3 h-3 mr-1" />
                  Not configured
                </span>
              )}
            </div>
          </div>
        </div>

        {level === 1 && platform.checkInterval && (
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
            <Clock className="w-3 h-3 inline mr-1" />
            Check every {platform.checkInterval} minutes
            {platform.lastCheck && (
              <div>Last check: {new Date(platform.lastCheck).toLocaleString()}</div>
            )}
          </div>
        )}

        {isEditing ? (
          <div className="space-y-2 mt-3">
            {Object.keys(platform.credentials).map(key => (
              <div key={key}>
                <label className="text-xs font-semibold block mb-1">{key}</label>
                <input
                  type="password"
                  value={credentials[key] || ''}
                  onChange={(e) => setCredentials({ ...credentials, [key]: e.target.value })}
                  className="w-full px-2 py-1 border rounded text-sm"
                  placeholder="Enter value"
                />
              </div>
            ))}
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => saveCredentials(platform.id, level)}
                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                Save to KV
              </button>
              <button
                onClick={() => { setEditingPlatform(null); setCredentials({}) }}
                className="px-3 py-1 bg-gray-300 rounded text-sm hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            {level === 2 && platform.lastPostResult && platform.lastPostResult.postUrl && (
              <div className="mt-3 text-sm">
                <div className="text-xs text-gray-500">Last post</div>
                <a
                  href={platform.lastPostResult.postUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline font-medium"
                >
                  View last post →
                </a>
                {platform.lastPostResult.postedAt && (
                  <div className="text-xs text-gray-500 mt-1">
                    Posted: {new Date(platform.lastPostResult.postedAt).toLocaleString()}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => startEdit(platform)}
              className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center"
            >
              <Key className="w-3 h-3 mr-1" />
              Configure
            </button>
          </>
        )}
      </div>
    )
  }

  return (
    <>
      <Header isAdmin />

      <main className="max-w-7xl mx-auto px-4 py-24">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center">
            <Settings className="w-10 h-10 mr-3" />
            Automation Control Panel
          </h1>
          <p className="opacity-75">Automated cross-platform content distribution</p>
        </div>

        {/* Automation Controls */}
        <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Automation Status: {automationStatus.running ? 'RUNNING' : 'STOPPED'}
              </h2>
              <div className="text-sm space-y-1">
                <div className="font-semibold flex items-center gap-2">
                  <Timer className="w-4 h-4" />
                  Check Frequency: Every hour (0 * * * *)
                </div>
                {automationStatus.lastCheck && (
                  <div>Last check: {new Date(automationStatus.lastCheck).toLocaleString()}</div>
                )}
                {automationStatus.nextCheck && automationStatus.running && (
                  <div>Next check: {new Date(automationStatus.nextCheck).toLocaleString()}</div>
                )}
                <div>Checks today: {automationStatus.checksToday}</div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={toggleAutomation}
                className={`px-6 py-3 rounded-lg font-bold flex items-center text-lg ${
                  automationStatus.running
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {automationStatus.running ? (
                  <>
                    <Square className="w-5 h-5 mr-2" />
                    STOP
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    START
                  </>
                )}
              </button>

              <button
                onClick={checkNow}
                className="px-4 py-3 bg-white text-blue-600 rounded-lg font-bold flex items-center hover:bg-gray-100"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Check Now
              </button>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Level 1: Content Platforms */}
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              🎬 Level 1: Content Platforms
            </h2>
            <p className="text-sm opacity-75 mb-4">
              Automatically check these platforms for new videos every hour
            </p>
            <div className="space-y-4">
              {level1Platforms.map(platform => renderPlatformCard(platform, 1))}
            </div>
          </div>

          {/* Level 2: Social Platforms */}
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              📢 Level 2: Social Platforms
            </h2>
            <p className="text-sm opacity-75 mb-4">
              Automatically post new videos to these platforms
            </p>
            <div className="space-y-4">
              {level2Platforms.map(platform => renderPlatformCard(platform, 2))}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <h3 className="font-bold mb-2">🔒 Security</h3>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li>Credentials are stored encrypted in Cloudflare KV</li>
            <li>Credentials are also saved to .env.local for local development</li>
            <li>Never commit credential files to git</li>
            <li>Automation runs on Vercel Edge Functions</li>
          </ul>
        </div>
      </main>

      <Footer />
    </>
  )
}
