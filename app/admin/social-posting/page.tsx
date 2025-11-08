'use client'

import { useCallback, useEffect, useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Save, Key, CheckCircle, XCircle, RefreshCw, Power, Square, Play } from 'lucide-react'
import Image from 'next/image'

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

export default function SocialPostingConfigPage() {
  const [level1, setLevel1] = useState<Level1Platform[]>([])
  const [level2, setLevel2] = useState<Level2Platform[]>([])
  const [status, setStatus] = useState<AutomationStatus>({
    running: false,
    lastCheck: null,
    nextCheck: null,
    checksToday: 0
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
      
      console.log('Loaded config data:', JSON.stringify(data, null, 2))
      console.log('twitter-ainow data:', data.level2?.['twitter-ainow'])
      
      setLevel1([
        { 
          id: 'youtube', 
          name: 'YouTube', 
          icon: 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg', 
          configured: !!data.level1?.youtube?.configured, 
          credentials: data.level1?.youtube?.credentials || {} 
        },
        { 
          id: 'rumble', 
          name: 'Rumble', 
          icon: 'https://rumble.com/apple-touch-icon.png', 
          configured: !!data.level1?.rumble?.configured, 
          credentials: data.level1?.rumble?.credentials || {} 
        },
        { 
          id: 'spotify', 
          name: 'Spotify', 
          icon: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg', 
          configured: !!data.level1?.spotify?.configured, 
          credentials: data.level1?.spotify?.credentials || {} 
        }
      ])

      setLevel2([
        { 
          id: 'twitter', 
          name: 'X (Twitter) @V2U_now', 
          icon: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/X_logo_2023.svg', 
          configured: !!data.level2?.twitter?.configured, 
          enabled: data.level2?.twitter?.enabled !== false, 
          credentials: data.level2?.twitter?.credentials || {} 
        },
        { 
          id: 'twitter-ainow', 
          name: 'X (Twitter) @AI_Now_v2u', 
          icon: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/X_logo_2023.svg', 
          configured: !!data.level2?.['twitter-ainow']?.configured, 
          enabled: data.level2?.['twitter-ainow']?.enabled !== false, 
          credentials: data.level2?.['twitter-ainow']?.credentials || {} 
        },
        { 
          id: 'facebook', 
          name: 'Facebook', 
          icon: 'https://upload.wikimedia.org/wikipedia/commons/b/b9/2023_Facebook_icon.svg', 
          configured: !!data.level2?.facebook?.configured, 
          enabled: data.level2?.facebook?.enabled !== false, 
          credentials: data.level2?.facebook?.credentials || {} 
        },
        { 
          id: 'linkedin', 
          name: 'LinkedIn', 
          icon: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png', 
          configured: !!data.level2?.linkedin?.configured, 
          enabled: data.level2?.linkedin?.enabled !== false, 
          credentials: data.level2?.linkedin?.credentials || {} 
        },
        { 
          id: 'instagram', 
          name: 'Instagram', 
          icon: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png', 
          configured: !!data.level2?.instagram?.configured, 
          enabled: data.level2?.instagram?.enabled === true, 
          credentials: data.level2?.instagram?.credentials || {} 
        },
        { 
          id: 'threads', 
          name: 'Threads', 
          icon: 'https://upload.wikimedia.org/wikipedia/commons/d/db/Threads_%28app%29.svg', 
          configured: !!data.level2?.threads?.configured, 
          enabled: data.level2?.threads?.enabled === true, 
          credentials: data.level2?.threads?.credentials || {} 
        },
        { 
          id: 'tiktok', 
          name: 'TikTok', 
          icon: 'https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg', 
          configured: !!data.level2?.tiktok?.configured, 
          enabled: data.level2?.tiktok?.enabled === true, 
          credentials: data.level2?.tiktok?.credentials || {} 
        },
        { 
          id: 'odysee', 
          name: 'Odysee', 
          icon: 'https://upload.wikimedia.org/wikipedia/commons/3/39/Odysee_logo.svg', 
          configured: !!data.level2?.odysee?.configured, 
          enabled: data.level2?.odysee?.enabled === true, 
          credentials: data.level2?.odysee?.credentials || {} 
        },
        { 
          id: 'vimeo', 
          name: 'Vimeo', 
          icon: 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Vimeo_Logo.svg', 
          configured: !!data.level2?.vimeo?.configured, 
          enabled: data.level2?.vimeo?.enabled === true, 
          credentials: data.level2?.vimeo?.credentials || {} 
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

  useEffect(() => {
    loadConfig()
    loadStatus()
  }, [loadConfig, loadStatus])

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

      // Filter out masked credentials (don't send *** or (configured) back to server)
      const cleanCredentials = Object.fromEntries(
        Object.entries(platform?.credentials || {}).filter(([, value]) => value !== '***' && value !== '(configured)')
      )

      await fetch('/api/automation/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level,
          platformId,
          credentials: cleanCredentials,
          enabled: 'enabled' in platform! ? platform.enabled : true
        })
      })

      setEditing(null)
      await loadConfig()
    } catch (err) {
      console.error('Save failed:', err)
      alert('Failed to save configuration')
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

  function startEditing(platformId: string, level: 1 | 2) {
    // Clear masked values when starting to edit
    if (level === 1) {
      setLevel1(prev => prev.map(p => {
        if (p.id === platformId) {
          const cleanCredentials = Object.fromEntries(
            Object.entries(p.credentials).map(([key, value]) => [key, value === '***' || value === '(configured)' ? '' : value])
          )
          return { ...p, credentials: cleanCredentials }
        }
        return p
      }))
    } else {
      setLevel2(prev => prev.map(p => {
        if (p.id === platformId) {
          const cleanCredentials = Object.fromEntries(
            Object.entries(p.credentials).map(([key, value]) => [key, value === '***' || value === '(configured)' ? '' : value])
          )
          return { ...p, credentials: cleanCredentials }
        }
        return p
      }))
    }
    setEditing(platformId)
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
        <main className="min-h-screen">
          <div className="p-8 pt-24">
            <div className="max-w-7xl mx-auto">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-500" />
                <p className="mt-4">Loading...</p>
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
      <main className="min-h-screen">
        <div className="p-8 pt-24">
          <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold">
                  Social Media Automation
                </h1>
                <p className="mt-2">
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

            <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--panel-bg)', color: 'var(--panel-fg)' }}>
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <Power className={`w-5 h-5 mr-2 ${status.running ? 'text-green-500' : 'text-red-500'}`} />
                  <span className="text-sm font-medium">
                    {status.running ? 'Running' : 'Stopped'}
                  </span>
                </div>
                {status.lastCheck && (
                  <span className="text-sm">
                    Last: {new Date(status.lastCheck).toLocaleString()}
                  </span>
                )}
                {status.nextCheck && (
                  <span className="text-sm">
                    Next: {new Date(status.nextCheck).toLocaleString()}
                  </span>
                )}
                <span className="text-sm">
                  Today: {status.checksToday}
                </span>
              </div>
            </div>

            {/* Schedule section hidden - hourly monitoring doesn't need specific time
            <div className="rounded-xl p-6 mt-4" style={{ backgroundColor: 'var(--panel-bg)', color: 'var(--panel-fg)' }}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-500" />
                  <span className="text-base font-semibold ">
                    Daily Schedule
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium ">Time:</label>
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={schedule.hour}
                      onChange={(e) => setSchedule({...schedule, hour: parseInt(e.target.value) || 0})}
                      className="w-16 px-3 py-2 border-2 border-black dark:border-white rounded-lg bg-white dark:bg-black  text-sm font-medium focus:ring-2 focus:ring-blue-500"
                    />
                    <span className=" font-medium">:</span>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={schedule.minute}
                      onChange={(e) => setSchedule({...schedule, minute: parseInt(e.target.value) || 0})}
                      className="w-16 px-3 py-2 border-2 border-black dark:border-white rounded-lg bg-white dark:bg-black  text-sm font-medium focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <select
                    value={schedule.timezone}
                    onChange={(e) => setSchedule({...schedule, timezone: e.target.value})}
                    className="px-4 py-2 border-2 border-black dark:border-white rounded-lg bg-white dark:bg-black  text-sm font-medium focus:ring-2 focus:ring-blue-500"
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
            */}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold  mb-4">
                📥 Level 1: Sources (READ)
              </h2>
              <p className="text-sm  mb-6">
                Monitor for new content hourly
              </p>

              <div className="space-y-4">
                {level1.map(p => (
                  <div key={p.id} className="rounded-xl p-6" style={{ backgroundColor: 'var(--panel-bg)', color: 'var(--panel-fg)' }}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Image src={p.icon} alt={p.name} width={32} height={32} className="mr-3 rounded" unoptimized />
                        <h3 className="font-semibold text-lg ">{p.name}</h3>
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
                              className="w-full px-3 py-2 border-2 border-black dark:border-white rounded-lg bg-white dark:bg-black "
                            />
                            <input
                              type="text"
                              placeholder="Channel ID"
                              value={p.credentials.channelId || ''}
                              onChange={(e) => updateCred(p.id, 1, 'channelId', e.target.value)}
                              className="w-full px-3 py-2 border-2 border-black dark:border-white rounded-lg bg-white dark:bg-black "
                            />
                          </>
                        )}

                        {p.id === 'rumble' && (
                          <input
                            type="url"
                            placeholder="Channel URL (e.g., https://rumble.com/c/YourChannel)"
                            value={p.credentials.url || ''}
                            onChange={(e) => updateCred(p.id, 1, 'url', e.target.value)}
                            className="w-full px-3 py-2 border-2 border-black dark:border-white rounded-lg bg-white dark:bg-black "
                          />
                        )}

                        {p.id === 'spotify' && (
                          <>
                            <input
                              type="text"
                              placeholder="Client ID"
                              value={p.credentials.clientId || ''}
                              onChange={(e) => updateCred(p.id, 1, 'clientId', e.target.value)}
                              className="w-full px-3 py-2 border-2 border-black dark:border-white rounded-lg bg-white dark:bg-black "
                            />
                            <input
                              type="password"
                              placeholder="Client Secret"
                              value={p.credentials.clientSecret || ''}
                              onChange={(e) => updateCred(p.id, 1, 'clientSecret', e.target.value)}
                              className="w-full px-3 py-2 border-2 border-black dark:border-white rounded-lg bg-white dark:bg-black "
                            />
                            <input
                              type="text"
                              placeholder="Show ID"
                              value={p.credentials.showId || ''}
                              onChange={(e) => updateCred(p.id, 1, 'showId', e.target.value)}
                              className="w-full px-3 py-2 border-2 border-black dark:border-white rounded-lg bg-white dark:bg-black "
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
                            className="px-4 py-2 border-2 border-black dark:border-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 "
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        {p.configured && (
                          <div className="space-y-2 mb-3 text-sm opacity-70">
                            {p.id === 'youtube' && (
                              <>
                                <div><span className="font-medium">API Key:</span> {p.credentials.apiKey === '(configured)' ? '••••••••' : (p.credentials.apiKey ? '••••••••' + p.credentials.apiKey.slice(-4) : 'Not set')}</div>
                                <div><span className="font-medium">Channel ID:</span> {p.credentials.channelId || 'Not set'}</div>
                              </>
                            )}
                            {p.id === 'rumble' && (
                              <div><span className="font-medium">Channel URL:</span> {p.credentials.url || 'Not set'}</div>
                            )}
                            {p.id === 'spotify' && (
                              <>
                                <div><span className="font-medium">Client ID:</span> {p.credentials.clientId ? '••••••••' + p.credentials.clientId.slice(-4) : 'Not set'}</div>
                                <div><span className="font-medium">Client Secret:</span> {p.credentials.clientSecret === '(configured)' || p.credentials.clientSecret ? '••••••••' : 'Not set'}</div>
                                <div><span className="font-medium">Show ID:</span> {p.credentials.showId || 'Not set'}</div>
                              </>
                            )}
                          </div>
                        )}
                        <button
                          onClick={() => startEditing(p.id, 1)}
                          className="flex items-center text-blue-500 hover:text-blue-600"
                        >
                          <Key className="w-4 h-4 mr-2" />
                          {p.configured ? 'Edit' : 'Configure'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold  mb-4">
                📤 Level 2: Targets (WRITE)
              </h2>
              <p className="text-sm  mb-6">
                Auto-post new content here
              </p>

              <div className="space-y-4">
                {level2.map(p => (
                  <div key={p.id} className="rounded-xl p-6" style={{ backgroundColor: 'var(--panel-bg)', color: 'var(--panel-fg)' }}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Image src={p.icon} alt={p.name} width={32} height={32} className="mr-3 rounded" unoptimized />
                        <div>
                          <h3 className="font-semibold text-lg ">{p.name}</h3>
                          <label className="flex items-center mt-1">
                            <input
                              type="checkbox"
                              checked={p.enabled}
                              onChange={() => toggleEnabled(p.id)}
                              className="mr-2"
                            />
                            <span className="text-sm ">
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
                        {(p.id === 'twitter' || p.id === 'twitter-ainow') && (
                          <>
                            <input
                              type="text"
                              placeholder="App Key"
                              value={p.credentials.appKey || ''}
                              onChange={(e) => updateCred(p.id, 2, 'appKey', e.target.value)}
                              className="w-full px-3 py-2 border-2 border-black dark:border-white rounded-lg bg-white dark:bg-black "
                            />
                            <input
                              type="password"
                              placeholder="App Secret"
                              value={p.credentials.appSecret || ''}
                              onChange={(e) => updateCred(p.id, 2, 'appSecret', e.target.value)}
                              className="w-full px-3 py-2 border-2 border-black dark:border-white rounded-lg bg-white dark:bg-black "
                            />
                            <input
                              type="text"
                              placeholder="Access Token"
                              value={p.credentials.accessToken || ''}
                              onChange={(e) => updateCred(p.id, 2, 'accessToken', e.target.value)}
                              className="w-full px-3 py-2 border-2 border-black dark:border-white rounded-lg bg-white dark:bg-black "
                            />
                            <input
                              type="password"
                              placeholder="Access Secret"
                              value={p.credentials.accessSecret || ''}
                              onChange={(e) => updateCred(p.id, 2, 'accessSecret', e.target.value)}
                              className="w-full px-3 py-2 border-2 border-black dark:border-white rounded-lg bg-white dark:bg-black "
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
                              className="w-full px-3 py-2 border-2 border-black dark:border-white rounded-lg bg-white dark:bg-black "
                            />
                            <input
                              type="password"
                              placeholder="Page Access Token"
                              value={p.credentials.pageAccessToken || ''}
                              onChange={(e) => updateCred(p.id, 2, 'pageAccessToken', e.target.value)}
                              className="w-full px-3 py-2 border-2 border-black dark:border-white rounded-lg bg-white dark:bg-black "
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
                              className="w-full px-3 py-2 border-2 border-black dark:border-white rounded-lg bg-white dark:bg-black "
                            />
                            <input
                              type="password"
                              placeholder="Client Secret"
                              value={p.credentials.clientSecret || ''}
                              onChange={(e) => updateCred(p.id, 2, 'clientSecret', e.target.value)}
                              className="w-full px-3 py-2 border-2 border-black dark:border-white rounded-lg bg-white dark:bg-black "
                            />
                            <input
                              type="text"
                              placeholder="Access Token"
                              value={p.credentials.accessToken || ''}
                              onChange={(e) => updateCred(p.id, 2, 'accessToken', e.target.value)}
                              className="w-full px-3 py-2 border-2 border-black dark:border-white rounded-lg bg-white dark:bg-black "
                            />
                          </>
                        )}

                        {(p.id === 'instagram' || p.id === 'threads') && (
                          <input
                            type="text"
                            placeholder="Access Token"
                            value={p.credentials.accessToken || ''}
                            onChange={(e) => updateCred(p.id, 2, 'accessToken', e.target.value)}
                            className="w-full px-3 py-2 border-2 border-black dark:border-white rounded-lg bg-white dark:bg-black "
                          />
                        )}

                        {(p.id === 'tiktok' || p.id === 'odysee' || p.id === 'vimeo') && (
                          <input
                            type="url"
                            placeholder="Channel URL"
                            value={p.credentials.url || ''}
                            onChange={(e) => updateCred(p.id, 2, 'url', e.target.value)}
                            className="w-full px-3 py-2 border-2 border-black dark:border-white rounded-lg bg-white dark:bg-black "
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
                            className="px-4 py-2 border-2 border-black dark:border-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 "
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        {p.configured && (
                          <div className="space-y-2 mb-3 text-sm opacity-70">
                            {(p.id === 'twitter' || p.id === 'twitter-ainow') && (
                              <>
                                <div><span className="font-medium">App Key:</span> {p.credentials.appKey || 'Not set'}</div>
                                <div><span className="font-medium">App Secret:</span> {p.credentials.appSecret === '(configured)' || p.credentials.appSecret ? '••••••••' : 'Not set'}</div>
                                <div><span className="font-medium">Access Token:</span> {p.credentials.accessToken || 'Not set'}</div>
                                <div><span className="font-medium">Access Secret:</span> {p.credentials.accessSecret === '(configured)' || p.credentials.accessSecret ? '••••••••' : 'Not set'}</div>
                              </>
                            )}
                            {p.id === 'facebook' && (
                              <>
                                <div><span className="font-medium">Page ID:</span> {p.credentials.pageId || 'Not set'}</div>
                                <div><span className="font-medium">Page Access Token:</span> {p.credentials.pageAccessToken === '(configured)' ? '••••••••' : (p.credentials.pageAccessToken ? '••••••••' + p.credentials.pageAccessToken.slice(-4) : 'Not set')}</div>
                              </>
                            )}
                            {p.id === 'linkedin' && (
                              <>
                                <div><span className="font-medium">Client ID:</span> {p.credentials.clientId || 'Not set'}</div>
                                <div><span className="font-medium">Client Secret:</span> {p.credentials.clientSecret === '(configured)' || p.credentials.clientSecret ? '••••••••' : 'Not set'}</div>
                                <div><span className="font-medium">Access Token:</span> {p.credentials.accessToken || 'Not set'}</div>
                              </>
                            )}
                            {(p.id === 'instagram' || p.id === 'threads') && (
                              <div><span className="font-medium">Access Token:</span> {p.credentials.accessToken || 'Not set'}</div>
                            )}
                            {(p.id === 'tiktok' || p.id === 'odysee' || p.id === 'vimeo') && (
                              <div><span className="font-medium">Channel URL:</span> {p.credentials.url || 'Not set'}</div>
                            )}
                          </div>
                        )}
                        <button
                          onClick={() => startEditing(p.id, 2)}
                          className="flex items-center text-blue-500 hover:text-blue-600"
                        >
                          <Key className="w-4 h-4 mr-2" />
                          {p.configured ? 'Edit' : 'Configure'}
                        </button>
                      </div>
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
