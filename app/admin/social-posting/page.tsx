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
  validated: boolean
  credentials: PlatformCredentials
  validatedAt?: string
}

interface Level2Platform {
  id: string
  name: string
  icon: string
  configured: boolean
  validated: boolean
  enabled: boolean
  credentials: PlatformCredentials
  validatedAt?: string
  lastTestResult?: {
    success: boolean
    error?: string
    timestamp: string
    postUrl?: string
  }
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
  const [validating, setValidating] = useState<string | null>(null)
  const [testing, setTesting] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Helper to calculate credential age and show warnings
  const getCredentialAge = (validatedAt?: string) => {
    if (!validatedAt) return null
    
    const validated = new Date(validatedAt)
    const now = new Date()
    const daysSince = Math.floor((now.getTime() - validated.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysSince === 0) return { text: 'Today', color: 'text-green-600' }
    if (daysSince === 1) return { text: '1 day ago', color: 'text-green-600' }
    if (daysSince < 30) return { text: `${daysSince} days ago`, color: 'text-green-600' }
    if (daysSince < 60) return { text: `${daysSince} days ago`, color: 'text-yellow-600' }
    return { text: `${daysSince} days ago`, color: 'text-red-600' }
  }

  const loadConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/automation/config')
      const data = await res.json() as {
        level1?: Record<string, { configured?: boolean; validated?: boolean; credentials?: PlatformCredentials; validatedAt?: string }>;
        level2?: Record<string, { configured?: boolean; validated?: boolean; enabled?: boolean; credentials?: PlatformCredentials; validatedAt?: string; lastPostResult?: Record<string, unknown> }>;
      }
      
      setLevel1([
        { 
          id: 'youtube', 
          name: 'YouTube', 
          icon: 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg', 
          configured: !!data.level1?.youtube?.configured,
          validated: !!data.level1?.youtube?.validated,
          credentials: data.level1?.youtube?.credentials || {},
          validatedAt: data.level1?.youtube?.validatedAt
        },
        { 
          id: 'rumble', 
          name: 'Rumble', 
          icon: 'https://rumble.com/apple-touch-icon.png', 
          configured: !!data.level1?.rumble?.configured,
          validated: !!data.level1?.rumble?.validated,
          credentials: data.level1?.rumble?.credentials || {},
          validatedAt: data.level1?.rumble?.validatedAt
        },
        { 
          id: 'spotify', 
          name: 'Spotify', 
          icon: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg', 
          configured: !!data.level1?.spotify?.configured,
          validated: !!data.level1?.spotify?.validated,
          credentials: data.level1?.spotify?.credentials || {},
          validatedAt: data.level1?.spotify?.validatedAt
        }
      ])

      setLevel2([
        { 
          id: 'twitter', 
          name: 'X (Twitter) @V2U_now', 
          icon: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/X_logo_2023.svg', 
          configured: !!data.level2?.twitter?.configured,
          validated: !!data.level2?.twitter?.validated,
          enabled: data.level2?.twitter?.enabled !== false, 
          credentials: data.level2?.twitter?.credentials ||{},
          validatedAt: data.level2?.twitter?.validatedAt,
          lastTestResult: data.level2?.twitter?.lastPostResult as { success: boolean; error?: string; timestamp: string; postUrl?: string } | undefined
        },
        { 
          id: 'twitter-ainow', 
          name: 'X (Twitter) @AI_Now_v2u', 
          icon: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/X_logo_2023.svg', 
          configured: !!data.level2?.['twitter-ainow']?.configured,
          validated: !!data.level2?.['twitter-ainow']?.validated,
          enabled: data.level2?.['twitter-ainow']?.enabled !== false, 
          credentials: data.level2?.['twitter-ainow']?.credentials || {},
          validatedAt: data.level2?.['twitter-ainow']?.validatedAt,
          lastTestResult: data.level2?.['twitter-ainow']?.lastPostResult as { success: boolean; error?: string; timestamp: string; postUrl?: string } | undefined
        },
        { 
          id: 'facebook', 
          name: 'Facebook @V2U', 
          icon: 'https://upload.wikimedia.org/wikipedia/commons/b/b9/2023_Facebook_icon.svg', 
          configured: !!data.level2?.facebook?.configured,
          validated: !!data.level2?.facebook?.validated,
          enabled: data.level2?.facebook?.enabled !== false, 
          credentials: data.level2?.facebook?.credentials || {},
          validatedAt: data.level2?.facebook?.validatedAt,
          lastTestResult: data.level2?.facebook?.lastPostResult as { success: boolean; error?: string; timestamp: string; postUrl?: string } | undefined
        },
        { 
          id: 'facebook-ainow', 
          name: 'Facebook @AI_Now', 
          icon: 'https://upload.wikimedia.org/wikipedia/commons/b/b9/2023_Facebook_icon.svg', 
          configured: !!data.level2?.['facebook-ainow']?.configured,
          validated: !!data.level2?.['facebook-ainow']?.validated,
          enabled: data.level2?.['facebook-ainow']?.enabled !== false, 
          credentials: data.level2?.['facebook-ainow']?.credentials || {},
          validatedAt: data.level2?.['facebook-ainow']?.validatedAt,
          lastTestResult: data.level2?.['facebook-ainow']?.lastPostResult as { success: boolean; error?: string; timestamp: string; postUrl?: string } | undefined
        },
        { 
          id: 'linkedin', 
          name: 'LinkedIn', 
          icon: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png', 
          configured: !!data.level2?.linkedin?.configured,
          validated: !!data.level2?.linkedin?.validated,
          enabled: data.level2?.linkedin?.enabled !== false, 
          credentials: data.level2?.linkedin?.credentials || {},
          validatedAt: data.level2?.linkedin?.validatedAt,
          lastTestResult: data.level2?.linkedin?.lastPostResult as { success: boolean; error?: string; timestamp: string; postUrl?: string } | undefined
        },
        { 
          id: 'instagram', 
          name: 'Instagram', 
          icon: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png', 
          configured: !!data.level2?.instagram?.configured,
          validated: !!data.level2?.instagram?.validated,
          enabled: data.level2?.instagram?.enabled === true, 
          credentials: data.level2?.instagram?.credentials ||{},
          validatedAt: data.level2?.instagram?.validatedAt,
          lastTestResult: data.level2?.instagram?.lastPostResult as { success: boolean; error?: string; timestamp: string; postUrl?: string } | undefined
        },
        { 
          id: 'threads', 
          name: 'Threads', 
          icon: 'https://upload.wikimedia.org/wikipedia/commons/d/db/Threads_%28app%29.svg', 
          configured: !!data.level2?.threads?.configured,
          validated: !!data.level2?.threads?.validated,
          enabled: data.level2?.threads?.enabled === true, 
          credentials: data.level2?.threads?.credentials || {},
          validatedAt: data.level2?.threads?.validatedAt,
          lastTestResult: data.level2?.threads?.lastPostResult as { success: boolean; error?: string; timestamp: string; postUrl?: string } | undefined
        },
        { 
          id: 'tiktok', 
          name: 'TikTok', 
          icon: 'https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg', 
          configured: !!data.level2?.tiktok?.configured,
          validated: !!data.level2?.tiktok?.validated,
          enabled: data.level2?.tiktok?.enabled === true, 
          credentials: data.level2?.tiktok?.credentials || {},
          validatedAt: data.level2?.tiktok?.validatedAt,
          lastTestResult: data.level2?.tiktok?.lastPostResult as { success: boolean; error?: string; timestamp: string; postUrl?: string } | undefined
        },
        { 
          id: 'odysee', 
          name: 'Odysee', 
          icon: 'https://upload.wikimedia.org/wikipedia/commons/3/39/Odysee_logo.svg', 
          configured: !!data.level2?.odysee?.configured,
          validated: !!data.level2?.odysee?.validated,
          enabled: data.level2?.odysee?.enabled === true, 
          credentials: data.level2?.odysee?.credentials || {},
          validatedAt: data.level2?.odysee?.validatedAt,
          lastTestResult: data.level2?.odysee?.lastPostResult as { success: boolean; error?: string; timestamp: string; postUrl?: string } | undefined
        },
        { 
          id: 'vimeo', 
          name: 'Vimeo', 
          icon: 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Vimeo_Logo.svg', 
          configured: !!data.level2?.vimeo?.configured,
          validated: !!data.level2?.vimeo?.validated,
          enabled: data.level2?.vimeo?.enabled === true, 
          credentials: data.level2?.vimeo?.credentials || {},
          validatedAt: data.level2?.vimeo?.validatedAt,
          lastTestResult: data.level2?.vimeo?.lastPostResult as { success: boolean; error?: string; timestamp: string; postUrl?: string } | undefined
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

      // For credentials with (configured) or masked values, we need to get the actual values from the server
      // Only send credentials that have been actually edited by the user
      const cleanCredentials = Object.fromEntries(
        Object.entries(platform?.credentials || {})
          .filter(([key, value]) => {
            const shouldInclude = value !== '***' && 
              value !== '(configured)' && 
              value !== '' &&
              !value.startsWith('••••••••');
            
            console.log(`Credential ${key}: "${value}" -> ${shouldInclude ? 'INCLUDE' : 'FILTER OUT'}`);
            return shouldInclude;
          })
      )

      console.log('Clean credentials being sent:', cleanCredentials);

      // If no credentials were edited, we can't validate - need actual values
      if (Object.keys(cleanCredentials).length === 0) {
        alert(`⚠️ Please edit at least one credential field.\n\nThe current values are masked for security. To validate, you need to either:\n1. Re-enter the credentials, or\n2. Edit at least one field`)
        return
      }

      const response = await fetch('/api/automation/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level,
          platformId,
          credentials: cleanCredentials,
          enabled: 'enabled' in platform! ? platform.enabled : true
        })
      })

      const result = await response.json() as { success?: boolean; error?: string }

      if (!response.ok) {
        // Validation failed - show error but keep form open with current values
        alert(`❌ Validation Failed:\n\n${result.error || 'Invalid credentials'}\n\nPlease correct the credentials and try again.`)
        return // Don't close form, don't reload config
      }

      // Success - close form and reload
      setEditing(null)
      await loadConfig()
      alert(`✅ ${platform?.name || platformId} credentials saved and validated successfully!`)
    } catch (err) {
      console.error('Save failed:', err)
      alert('Failed to save configuration: ' + (err instanceof Error ? err.message : 'Unknown error'))
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

  function startEditing(platformId: string) {
    // Just set editing mode - keep credentials as-is (masked values stay for display)
    setEditing(platformId)
  }

  async function validateExisting(platformId: string, level: 1 | 2) {
    setValidating(platformId)
    try {
      const response = await fetch(`/api/automation/validate?level=${level}&platformId=${platformId}`)
      const result = await response.json() as { success?: boolean; error?: string; message?: string }

      if (!response.ok) {
        alert(`❌ Validation Failed:\n\n${result.error || 'Unknown error'}`)
        return
      }

      await loadConfig()
      alert(`✅ ${result.message || 'Validation successful!'}`)
    } catch (err) {
      console.error('Validation failed:', err)
      alert('Failed to validate credentials: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setValidating(null)
    }
  }

  async function testPost(platformId: string) {
    setTesting(platformId)
    try {
      const response = await fetch('/api/automation/test-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platformId, level: 2 })
      })
      
      const result = await response.json() as { 
        success?: boolean; 
        error?: string; 
        message?: string;
        postUrl?: string;
        details?: string;
      }

      // Update platform with test result
      setLevel2(prev => prev.map(p =>
        p.id === platformId ? {
          ...p,
          lastTestResult: {
            success: result.success || false,
            error: result.error,
            timestamp: new Date().toISOString(),
            postUrl: result.postUrl
          }
        } : p
      ))

      if (result.success) {
        const message = result.postUrl 
          ? `✅ Test post successful!\n\nView post: ${result.postUrl}`
          : `✅ ${result.message || 'Test post successful!'}`;
        alert(message)
      } else {
        alert(`❌ Test Post Failed:\n\n${result.error || 'Unknown error'}\n\n${result.details || ''}`)
      }
    } catch (err) {
      console.error('Test post failed:', err)
      
      // Update platform with error
      setLevel2(prev => prev.map(p =>
        p.id === platformId ? {
          ...p,
          lastTestResult: {
            success: false,
            error: err instanceof Error ? err.message : 'Unknown error',
            timestamp: new Date().toISOString()
          }
        } : p
      ))
      
      alert('Failed to test post: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setTesting(null)
    }
  }

  async function postLatestNow() {
    if (!confirm('Post latest episode to all enabled Level 2 platforms?')) {
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/automation/post-latest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      const result = await response.json() as { 
        success?: boolean; 
        error?: string; 
        episode?: Record<string, unknown>;
        results?: Record<string, { success?: boolean; skipped?: boolean; error?: string; details?: string }>;
        logs?: Array<{ timestamp: string; level: string; platform?: string; message: string; data?: unknown }>;
      }

      // Always log the full response for debugging
      console.log('📋 Post Latest Response:', result)
      if (result.logs) {
        console.log('📋 Execution Logs:')
        result.logs.forEach(log => {
          const prefix = log.platform ? `[${log.platform}]` : ''
          console.log(`  ${log.timestamp} [${log.level}] ${prefix} ${log.message}`, log.data || '')
        })
      }

      if (!response.ok || !result.success) {
        alert(`❌ Failed to post:\n\n${result.error || 'Unknown error'}\n\nCheck browser console for detailed logs.`)
        return
      }

      // Reload config to show updated post results
      await loadConfig()

      // Show summary with detailed errors
      const results = result.results || {}
      const successCount = Object.values(results).filter(r => r.success).length
      const failCount = Object.values(results).filter(r => !r.success && !r.skipped).length
      const skippedCount = Object.values(results).filter(r => r.skipped).length
      
      // Collect failed platforms with errors
      const failedDetails = Object.entries(results)
        .filter(([, r]) => !r.success && !r.skipped)
        .map(([platform, r]) => `  • ${platform}: ${r.error || 'Unknown error'}${r.details ? `\n    ${r.details}` : ''}`)
        .join('\n')

      alert(`✅ Posting Complete!\n\n` +
        `Episode: ${result.episode?.title || 'Latest'}\n\n` +
        `✅ Success: ${successCount}\n` +
        `❌ Failed: ${failCount}\n` +
        `⏭️  Skipped: ${skippedCount}\n\n` +
        (failedDetails ? `Failed platforms:\n${failedDetails}\n\n` : '') +
        `Check browser console for detailed logs.`)
    } catch (err) {
      console.error('Post latest failed:', err)
      alert('Failed to post: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setSaving(false)
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
                        <h3 className="font-semibold text-lg">{p.name}</h3>
                      </div>
                      {p.validated ? (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      ) : p.configured ? (
                        <XCircle className="w-6 h-6 text-yellow-500" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-500" />
                      )}
                    </div>

                    {/* Always show current credentials */}
                    <div className="space-y-2 mb-4 text-sm">
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
                          <div><span className="font-medium">RSS Feed URL (fallback):</span> {p.credentials.rssFeedUrl || 'Not set'}</div>
                        </>
                      )}
                    </div>

                    {/* Credential age warning */}
                    {p.validatedAt && (() => {
                      const age = getCredentialAge(p.validatedAt)
                      if (age) {
                        return (
                          <div className={`text-sm mb-4 ${age.color}`}>
                            <span className="font-medium">Last validated:</span> {age.text}
                          </div>
                        )
                      }
                      return null
                    })()}

                    {/* Edit form shown BELOW credentials when editing */}
                    {editing === p.id ? (
                      <div className="space-y-3 pt-4 border-t-2 border-blue-500">
                        <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">
                          ✏️ Edit Credentials Below:
                        </div>
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
                              placeholder="Client ID (primary)"
                              value={p.credentials.clientId || ''}
                              onChange={(e) => updateCred(p.id, 1, 'clientId', e.target.value)}
                              className="w-full px-3 py-2 border-2 border-black dark:border-white rounded-lg bg-white dark:bg-black "
                            />
                            <input
                              type="password"
                              placeholder="Client Secret (primary)"
                              value={p.credentials.clientSecret || ''}
                              onChange={(e) => updateCred(p.id, 1, 'clientSecret', e.target.value)}
                              className="w-full px-3 py-2 border-2 border-black dark:border-white rounded-lg bg-white dark:bg-black "
                            />
                            <input
                              type="text"
                              placeholder="Show ID (primary)"
                              value={p.credentials.showId || ''}
                              onChange={(e) => updateCred(p.id, 1, 'showId', e.target.value)}
                              className="w-full px-3 py-2 border-2 border-black dark:border-white rounded-lg bg-white dark:bg-black "
                            />
                            <input
                              type="url"
                              placeholder="RSS Feed URL (fallback)"
                              value={p.credentials.rssFeedUrl || ''}
                              onChange={(e) => updateCred(p.id, 1, 'rssFeedUrl', e.target.value)}
                              className="w-full px-3 py-2 border-2 border-black dark:border-white rounded-lg bg-white dark:bg-black "
                            />
                          </>
                        )}

                        <div className="flex space-x-2">
                          <button
                            onClick={() => saveConfig(p.id, 1)}
                            disabled={saving}
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg flex items-center justify-center font-semibold"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            {saving ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={() => setEditing(null)}
                            className="px-6 py-3 border-2 border-black dark:border-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 font-semibold"
                          >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={() => startEditing(p.id)}
                    className="flex items-center text-blue-500 hover:text-blue-600 font-medium"
                  >
                    <Key className="w-4 h-4 mr-2" />
                    Edit
                  </button>
                  {p.configured && (
                    <button
                      onClick={() => validateExisting(p.id, 1)}
                      disabled={validating === p.id}
                      className="flex items-center text-green-600 hover:text-green-700 font-medium disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {validating === p.id ? 'Validating...' : 'Validate'}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    📤 Level 2: Targets (WRITE)
                  </h2>
                  <p className="text-sm">
                    Auto-post new content here
                  </p>
                </div>
                <button
                  onClick={postLatestNow}
                  disabled={saving}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="w-5 h-5" />
                  {saving ? 'Posting...' : 'Post Latest Now'}
                </button>
              </div>

              <div className="space-y-4">
                {level2.map(p => (
                  <div key={p.id} className="rounded-xl p-6" style={{ backgroundColor: 'var(--panel-bg)', color: 'var(--panel-fg)' }}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Image src={p.icon} alt={p.name} width={32} height={32} className="rounded" unoptimized />
                        <div>
                          <h3 className="font-semibold text-lg">{p.name}</h3>
                          <label className="flex items-center gap-2 mt-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={p.enabled}
                              onChange={() => toggleEnabled(p.id)}
                              className="w-5 h-5 cursor-pointer accent-blue-500"
                            />
                            <span className="text-base font-medium">
                              Enabled
                            </span>
                          </label>
                        </div>
                      </div>
                      {p.validated ? (
                        <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                      ) : p.configured ? (
                        <XCircle className="w-6 h-6 text-yellow-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                      )}
                    </div>

                    {/* Always show current credentials */}
                    <div className="space-y-2 mb-4 text-sm">
                      {(p.id === 'twitter' || p.id === 'twitter-ainow') && (
                        <>
                          <div><span className="font-medium">App Key:</span> {p.credentials.appKey || 'Not set'}</div>
                          <div><span className="font-medium">App Secret:</span> {p.credentials.appSecret === '(configured)' || p.credentials.appSecret ? '••••••••' : 'Not set'}</div>
                          <div><span className="font-medium">Access Token:</span> {p.credentials.accessToken || 'Not set'}</div>
                          <div><span className="font-medium">Access Secret:</span> {p.credentials.accessSecret === '(configured)' || p.credentials.accessSecret ? '••••••••' : 'Not set'}</div>
                        </>
                      )}
                      {(p.id === 'facebook' || p.id === 'facebook-ainow') && (
                        <>
                          <div><span className="font-medium">Page ID:</span> {p.credentials.pageId || 'Not set'}</div>
                          <div><span className="font-medium">Page Access Token:</span> {p.credentials.pageAccessToken === '(configured)' ? '••••••••' : (p.credentials.pageAccessToken ? '••••••••' + p.credentials.pageAccessToken.slice(-4) : 'Not set')}</div>
                        </>
                      )}
                      {p.id === 'linkedin' && (
                        <>
                          <div><span className="font-medium">Client ID:</span> {p.credentials.clientId || 'Not set'}</div>
                          <div><span className="font-medium">Client Secret:</span> {p.credentials.clientSecret === '(configured)' || p.credentials.clientSecret ? '••••••••' : 'Not set'}</div>
                          <div><span className="font-medium">Access Token:</span> {p.credentials.accessToken === '(configured)' || p.credentials.accessToken ? '••••••••' : 'Not set'}</div>
                        </>
                      )}
                      {(p.id === 'instagram' || p.id === 'threads') && (
                        <div><span className="font-medium">Access Token:</span> {p.credentials.accessToken || 'Not set'}</div>
                      )}
                      {(p.id === 'tiktok' || p.id === 'odysee' || p.id === 'vimeo') && (
                        <div><span className="font-medium">Channel URL:</span> {p.credentials.url || 'Not set'}</div>
                      )}
                    </div>

                    {/* Credential age warning */}
                    {p.validatedAt && (() => {
                      const age = getCredentialAge(p.validatedAt)
                      if (age) {
                        return (
                          <div className={`text-sm mb-4 ${age.color}`}>
                            <span className="font-medium">Last validated:</span> {age.text}
                          </div>
                        )
                      }
                      return null
                    })()}

                    {/* Edit form shown BELOW credentials when editing */}
                    {editing === p.id ? (
                      <div className="space-y-3 pt-4 border-t-2 border-blue-500">
                        <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">
                          ✏️ Edit Credentials Below:
                        </div>
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

                        {(p.id === 'facebook' || p.id === 'facebook-ainow') && (
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
                              type="password"
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
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg flex items-center justify-center font-semibold"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            {saving ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={() => setEditing(null)}
                            className="px-6 py-3 border-2 border-black dark:border-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 font-semibold"
                          >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Last test result - show error panel */}
                    {p.lastTestResult && !p.lastTestResult.success && (
                      <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-lg">
                        <div className="flex items-start gap-2">
                          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="font-semibold text-red-900 dark:text-red-100 mb-1">
                              Last Test Post Failed
                            </div>
                            <div className="text-sm text-red-800 dark:text-red-200 mb-2">
                              {p.lastTestResult.error}
                            </div>
                            <div className="text-xs text-red-700 dark:text-red-300">
                              {new Date(p.lastTestResult.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Last test result - show success panel */}
                    {p.lastTestResult && p.lastTestResult.success && (
                      <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-lg">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="font-semibold text-green-900 dark:text-green-100 mb-1">
                              Last Test Post Successful
                            </div>
                            {p.lastTestResult.postUrl && (
                              <a 
                                href={p.lastTestResult.postUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-green-700 dark:text-green-300 hover:underline"
                              >
                                View Post →
                              </a>
                            )}
                            <div className="text-xs text-green-700 dark:text-green-300 mt-1">
                              {new Date(p.lastTestResult.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEditing(p.id)}
                        className="flex items-center text-blue-500 hover:text-blue-600 font-medium"
                      >
                        <Key className="w-4 h-4 mr-2" />
                        {p.configured ? 'Edit' : 'Configure'}
                      </button>
                      {p.configured && (
                        <button
                          onClick={() => validateExisting(p.id, 2)}
                          disabled={validating === p.id}
                          className="flex items-center text-green-600 hover:text-green-700 font-medium disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {validating === p.id ? 'Validating...' : 'Validate'}
                        </button>
                      )}
                      {p.validated && p.enabled && (
                        <button
                          onClick={() => testPost(p.id)}
                          disabled={testing === p.id}
                          className="flex items-center text-purple-600 hover:text-purple-700 font-medium disabled:opacity-50"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          {testing === p.id ? 'Testing...' : 'Test Post'}
                        </button>
                      )}
                    </div>
                  </>
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
