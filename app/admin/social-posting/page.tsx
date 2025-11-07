'use client'

import { useState, useEffect, useCallback } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Power, Save, Key, CheckCircle, XCircle, RefreshCw, Play, Square, Clock } from 'lucide-react'

interface PlatformCredentials {
  [key: string]: string
}

interface Level1Platform {
  id: string
  name: string
  icon: string
  configured: boolean
  credentials: PlatformCredentials
}

interface Level2Platform {
  id: string
  name: string
  icon: string
  configured: boolean
  enabled: boolean
  credentials: PlatformCredentials
}

interface AutomationStatus {
  running: boolean
  lastCheck: string | null
  nextCheck: string | null
  checksToday: number
}

interface ScheduleConfig {
  hour: number
  minute: number
  timezone: string
}

export default function SocialPostingConfigPage() {
  const [level1, setLevel1] = useState<Level1Platform[]>([])
  const [level2, setLevel2] = useState<Level2Platform[]>([])
  const [status, setStatus] = useState<AutomationStatus>({
    running: false,
    lastCheck: null,
    nextCheck: null,
    checksToday: 0
  })
  const [schedule, setSchedule] = useState<ScheduleConfig>({
    hour: 15,
    minute: 30,
    timezone: 'America/Denver'
  })
  const [editing, setEditing] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/automation/config')
      const data = await res.json() as {
        level1?: Record<string, { configured?: boolean; credentials?: PlatformCredentials }>;
        level2?: Record<string, { configured?: boolean; enabled?: boolean; credentials?: PlatformCredentials }>;
      }
      
      setLevel1([
        { 
          id: 'youtube', 
          name: 'YouTube', 
          icon: '���', 
          configured: !!data.level1?.youtube?.configured, 
          credentials: data.level1?.youtube?.credentials || {} 
        },
        { 
          id: 'rumble', 
          name: 'Rumble', 
          icon: '���', 
          configured: !!data.level1?.rumble?.configured, 
          credentials: data.level1?.rumble?.credentials || {} 
        },
        { 
          id: 'spotify', 
          name: 'Spotify', 
          icon: '���️', 
          configured: !!data.level1?.spotify?.configured, 
          credentials: data.level1?.spotify?.credentials || {} 
        }
      ])

      setLevel2([
        { 
          id: 'twitter', 
          name: 'X (Twitter)', 
          icon: '���', 
          configured: !!data.level2?.twitter?.configured, 
          enabled: data.level2?.twitter?.enabled !== false, 
          credentials: data.level2?.twitter?.credentials || {} 
        },
        { 
          id: 'facebook', 
          name: 'Facebook', 
          icon: '���', 
          configured: !!data.level2?.facebook?.configured, 
          enabled: data.level2?.facebook?.enabled !== false, 
          credentials: data.level2?.facebook?.credentials || {} 
        },
        { 
          id: 'linkedin', 
          name: 'LinkedIn', 
          icon: '💼', 
          configured: !!data.level2?.linkedin?.configured, 
          enabled: data.level2?.linkedin?.enabled !== false, 
          credentials: data.level2?.linkedin?.credentials || {} 
        },
        { 
          id: 'instagram', 
          name: 'Instagram', 
          icon: '���', 
          configured: !!data.level2?.instagram?.configured, 
          enabled: data.level2?.instagram?.enabled === true, 
          credentials: data.level2?.instagram?.credentials || {} 
        },
        { 
          id: 'threads', 
          name: 'Threads', 
          icon: '���', 
          configured: !!data.level2?.threads?.configured, 
          enabled: data.level2?.threads?.enabled === true, 
          credentials: data.level2?.threads?.credentials || {} 
        },
        { 
          id: 'tiktok', 
          name: 'TikTok', 
          icon: '���', 
          configured: !!data.level2?.tiktok?.configured, 
          enabled: data.level2?.tiktok?.enabled === true, 
          credentials: data.level2?.tiktok?.credentials || {} 
        }
      ])
    } catch (err) {
      console.error('Failed to load config:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/automation/status')
      const data = await res.json() as AutomationStatus
      setStatus(data)
    } catch (err) {
      console.error('Failed to load status:', err)
    }
  }, [])

  const loadSchedule = useCallback(async () => {
    try {
      const res = await fetch('/api/automation/schedule')
      const data = await res.json() as ScheduleConfig
      setSchedule(data)
    } catch (err) {
      console.error('Failed to load schedule:', err)
    }
  }, [])

  useEffect(() => {
    loadConfig()
    loadStatus()
    loadSchedule()
  }, [loadConfig, loadStatus, loadSchedule])

  async function toggleAutomation() {
    try {
      await fetch('/api/automation/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ running: !status.running })
      })
      setStatus(prev => ({ ...prev, running: !prev.running }))
    } catch (err) {
      console.error('Toggle failed:', err)
    }
  }

  async function saveConfig(platformId: string, level: 1 | 2) {
    setSaving(true)
    try {
      const platform = level === 1 
        ? level1.find(p => p.id === platformId)
        : level2.find(p => p.id === platformId)

      await fetch('/api/automation/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level,
          platformId,
          credentials: platform?.credentials,
          enabled: 'enabled' in platform! ? platform.enabled : true
        })
      })

      setEditing(null)
      await loadConfig()
    } catch (err) {
      console.error('Save failed:', err)
    } finally {
      setSaving(false)
    }
  }

  function updateCred(platformId: string, level: 1 | 2, field: string, value: string) {
    if (level === 1) {
      setLevel1(prev => prev.map(p => 
        p.id === platformId ? { ...p, credentials: { ...p.credentials, [field]: value } } : p
      ))
    } else {
      setLevel2(prev => prev.map(p => 
        p.id === platformId ? { ...p, credentials: { ...p.credentials, [field]: value } } : p
      ))
    }
  }

  function toggleEnabled(platformId: string) {
    setLevel2(prev => prev.map(p =>
      p.id === platformId ? { ...p, enabled: !p.enabled } : p
    ))
  }

  if (loading) {
    return (
      <>
        <Header isAdmin />
        <main className="min-h-screen bg-white dark:bg-black">
          <div className="p-8 pt-24">
            <div className="max-w-7xl mx-auto">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-500" />
                <p className="mt-4 text-gray-900 dark:text-white">Loading...</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header isAdmin />
      <main className="min-h-screen bg-white dark:bg-black">
        <div className="p-8 pt-24">
          <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Social Media Automation
                </h1>
                <p className="text-gray-900 dark:text-white mt-2">
                  Configure Level 1 sources and Level 2 targets
                </p>
              </div>

              <button
                onClick={toggleAutomation}
                className={`flex items-center px-6 py-3 rounded-lg font-semibold ${
                  status.running
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {status.running ? (
                  <>
                    <Square className="w-5 h-5 mr-2" />
                    Stop
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Start
                  </>
                )}
              </button>
            </div>

            <div className="bg-white/95 dark:bg-black/95 backdrop-blur-sm rounded-lg p-4 shadow-lg">
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <Power className={`w-5 h-5 mr-2 ${status.running ? 'text-green-500' : 'text-red-500'}`} />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {status.running ? 'Running' : 'Stopped'}
                  </span>
                </div>
                {status.lastCheck && (
                  <span className="text-sm text-gray-900 dark:text-white">
                    Last: {new Date(status.lastCheck).toLocaleString()}
                  </span>
                )}
                {status.nextCheck && (
                  <span className="text-sm text-gray-900 dark:text-white">
                    Next: {new Date(status.nextCheck).toLocaleString()}
                  </span>
                )}
                <span className="text-sm text-gray-900 dark:text-white">
                  Today: {status.checksToday}
                </span>
              </div>
            </div>

            <div className="bg-white/95 dark:bg-black/95 backdrop-blur-sm rounded-xl p-6 shadow-lg mt-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-500" />
                  <span className="text-base font-semibold text-gray-900 dark:text-white">
                    Daily Schedule
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Time:</label>
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={schedule.hour}
                      onChange={(e) => setSchedule({...schedule, hour: parseInt(e.target.value) || 0})}
                      className="w-16 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">:</span>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={schedule.minute}
                      onChange={(e) => setSchedule({...schedule, minute: parseInt(e.target.value) || 0})}
                      className="w-16 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <select
                    value={schedule.timezone}
                    onChange={(e) => setSchedule({...schedule, timezone: e.target.value})}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="America/Denver">MST (Denver)</option>
                    <option value="America/New_York">EST (New York)</option>
                    <option value="America/Los_Angeles">PST (Los Angeles)</option>
                    <option value="America/Chicago">CST (Chicago)</option>
                  </select>
                  <button
                    onClick={async () => {
                      try {
                        await fetch('/api/automation/schedule', {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(schedule)
                        })
                        alert('Schedule saved!')
                      } catch (err) {
                        console.error('Failed to update schedule:', err)
                        alert('Failed to save schedule')
                      }
                    }}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                📥 Level 1: Sources (READ)
              </h2>
              <p className="text-sm text-gray-900 dark:text-white mb-6">
                Monitor for new content hourly
              </p>

              <div className="space-y-4">
                {level1.map(p => (
                  <div key={p.id} className="bg-white/95 dark:bg-black/95 backdrop-blur-sm rounded-lg p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <span className="text-3xl mr-3">{p.icon}</span>
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{p.name}</h3>
                      </div>
                      {p.configured ? (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-500" />
                      )}
                    </div>

                    {editing === p.id ? (
                      <div className="space-y-3">
                        {p.id === 'youtube' && (
                          <>
                            <input
                              type="text"
                              placeholder="API Key"
                              value={p.credentials.apiKey || ''}
                              onChange={(e) => updateCred(p.id, 1, 'apiKey', e.target.value)}
                              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                            <input
                              type="text"
                              placeholder="Channel ID"
                              value={p.credentials.channelId || ''}
                              onChange={(e) => updateCred(p.id, 1, 'channelId', e.target.value)}
                              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                          </>
                        )}

                        {p.id === 'rumble' && (
                          <>
                            <input
                              type="text"
                              placeholder="API Key"
                              value={p.credentials.apiKey || ''}
                              onChange={(e) => updateCred(p.id, 1, 'apiKey', e.target.value)}
                              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                            <input
                              type="text"
                              placeholder="Channel ID"
                              value={p.credentials.channelId || ''}
                              onChange={(e) => updateCred(p.id, 1, 'channelId', e.target.value)}
                              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                          </>
                        )}

                        {p.id === 'spotify' && (
                          <>
                            <input
                              type="text"
                              placeholder="Client ID"
                              value={p.credentials.clientId || ''}
                              onChange={(e) => updateCred(p.id, 1, 'clientId', e.target.value)}
                              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                            <input
                              type="password"
                              placeholder="Client Secret"
                              value={p.credentials.clientSecret || ''}
                              onChange={(e) => updateCred(p.id, 1, 'clientSecret', e.target.value)}
                              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                            <input
                              type="text"
                              placeholder="Show ID"
                              value={p.credentials.showId || ''}
                              onChange={(e) => updateCred(p.id, 1, 'showId', e.target.value)}
                              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                          </>
                        )}

                        <div className="flex space-x-2">
                          <button
                            onClick={() => saveConfig(p.id, 1)}
                            disabled={saving}
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center justify-center"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            {saving ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={() => setEditing(null)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditing(p.id)}
                        className="flex items-center text-blue-500 hover:text-blue-600"
                      >
                        <Key className="w-4 h-4 mr-2" />
                        {p.configured ? 'Update' : 'Configure'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                📤 Level 2: Targets (WRITE)
              </h2>
              <p className="text-sm text-gray-900 dark:text-white mb-6">
                Auto-post new content here
              </p>

              <div className="space-y-4">
                {level2.map(p => (
                  <div key={p.id} className="bg-white/95 dark:bg-black/95 backdrop-blur-sm rounded-lg p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <span className="text-3xl mr-3">{p.icon}</span>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{p.name}</h3>
                          <label className="flex items-center mt-1">
                            <input
                              type="checkbox"
                              checked={p.enabled}
                              onChange={() => toggleEnabled(p.id)}
                              className="mr-2"
                            />
                            <span className="text-sm text-gray-900 dark:text-white">
                              Enabled
                            </span>
                          </label>
                        </div>
                      </div>
                      {p.configured ? (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-500" />
                      )}
                    </div>

                    {editing === p.id ? (
                      <div className="space-y-3">
                        {p.id === 'twitter' && (
                          <>
                            <input
                              type="text"
                              placeholder="App Key"
                              value={p.credentials.appKey || ''}
                              onChange={(e) => updateCred(p.id, 2, 'appKey', e.target.value)}
                              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                            <input
                              type="password"
                              placeholder="App Secret"
                              value={p.credentials.appSecret || ''}
                              onChange={(e) => updateCred(p.id, 2, 'appSecret', e.target.value)}
                              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                            <input
                              type="text"
                              placeholder="Access Token"
                              value={p.credentials.accessToken || ''}
                              onChange={(e) => updateCred(p.id, 2, 'accessToken', e.target.value)}
                              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                            <input
                              type="password"
                              placeholder="Access Secret"
                              value={p.credentials.accessSecret || ''}
                              onChange={(e) => updateCred(p.id, 2, 'accessSecret', e.target.value)}
                              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                          </>
                        )}

                        {p.id === 'facebook' && (
                          <>
                            <input
                              type="text"
                              placeholder="Page ID"
                              value={p.credentials.pageId || ''}
                              onChange={(e) => updateCred(p.id, 2, 'pageId', e.target.value)}
                              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                            <input
                              type="password"
                              placeholder="Page Access Token"
                              value={p.credentials.pageAccessToken || ''}
                              onChange={(e) => updateCred(p.id, 2, 'pageAccessToken', e.target.value)}
                              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                          </>
                        )}

                        {p.id === 'linkedin' && (
                          <>
                            <input
                              type="text"
                              placeholder="Client ID"
                              value={p.credentials.clientId || ''}
                              onChange={(e) => updateCred(p.id, 2, 'clientId', e.target.value)}
                              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                            <input
                              type="password"
                              placeholder="Client Secret"
                              value={p.credentials.clientSecret || ''}
                              onChange={(e) => updateCred(p.id, 2, 'clientSecret', e.target.value)}
                              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                            <input
                              type="text"
                              placeholder="Access Token"
                              value={p.credentials.accessToken || ''}
                              onChange={(e) => updateCred(p.id, 2, 'accessToken', e.target.value)}
                              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                          </>
                        )}

                        {(p.id === 'instagram' || p.id === 'threads' || p.id === 'tiktok') && (
                          <input
                            type="text"
                            placeholder="Access Token"
                            value={p.credentials.accessToken || ''}
                            onChange={(e) => updateCred(p.id, 2, 'accessToken', e.target.value)}
                            className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        )}

                        <div className="flex space-x-2">
                          <button
                            onClick={() => saveConfig(p.id, 2)}
                            disabled={saving}
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center justify-center"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            {saving ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={() => setEditing(null)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditing(p.id)}
                        className="flex items-center text-blue-500 hover:text-blue-600"
                      >
                        <Key className="w-4 h-4 mr-2" />
                        {p.configured ? 'Update' : 'Configure'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              How It Works
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Checks Level 1 platforms every hour for new content</li>
              <li>• Fetches metadata and thumbnails automatically</li>
              <li>• Posts to all enabled Level 2 platforms</li>
              <li>• Credentials stored encrypted in Cloudflare KV + local .env</li>
            </ul>
          </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
