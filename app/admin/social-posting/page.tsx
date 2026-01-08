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
  supportsLinkPosts?: boolean
  requiresVideoUpload?: boolean
  postingMethod?: 'link' | 'video' | 'manual'
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
  const [postResultModal, setPostResultModal] = useState<{
    show: boolean;
    episode?: { title?: string };
    results?: Record<string, { success: boolean; error?: string; details?: string; skipped?: boolean }>;
  }>({ show: false })

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
      // Add cache-busting parameter to ensure fresh data
      const res = await fetch(`/api/automation/config?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      const data = await res.json() as {
        level1?: Record<string, { configured?: boolean; validated?: boolean; credentials?: PlatformCredentials; validatedAt?: string }>;
        level2?: Record<string, { configured?: boolean; validated?: boolean; enabled?: boolean; credentials?: PlatformCredentials; validatedAt?: string; lastPostResult?: Record<string, unknown> }>;
      }
      
      console.log('📥 Loaded config from API:', { 
        twitterValidated: data.level2?.twitter?.validated,
        twitterAinowValidated: data.level2?.['twitter-ainow']?.validated,
        facebookValidated: data.level2?.facebook?.validated,
        linkedinValidated: data.level2?.linkedin?.validated
      })
      
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
          lastTestResult: data.level2?.twitter?.lastPostResult as { success: boolean; error?: string; timestamp: string; postUrl?: string } | undefined,
          supportsLinkPosts: true,
          postingMethod: 'link'
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
          lastTestResult: data.level2?.['twitter-ainow']?.lastPostResult as { success: boolean; error?: string; timestamp: string; postUrl?: string } | undefined,
          supportsLinkPosts: true,
          postingMethod: 'link'
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
          lastTestResult: data.level2?.facebook?.lastPostResult as { success: boolean; error?: string; timestamp: string; postUrl?: string } | undefined,
          supportsLinkPosts: true,
          postingMethod: 'link'
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
          lastTestResult: data.level2?.['facebook-ainow']?.lastPostResult as { success: boolean; error?: string; timestamp: string; postUrl?: string } | undefined,
          supportsLinkPosts: true,
          postingMethod: 'link'
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
          lastTestResult: data.level2?.linkedin?.lastPostResult as { success: boolean; error?: string; timestamp: string; postUrl?: string } | undefined,
          supportsLinkPosts: true,
          postingMethod: 'link'
        },
        { 
          id: 'instagram', 
          name: 'Instagram (V2U)', 
          icon: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png', 
          configured: !!data.level2?.instagram?.configured,
          validated: !!data.level2?.instagram?.validated,
          enabled: data.level2?.instagram?.enabled === true, 
          credentials: data.level2?.instagram?.credentials ||{},
          validatedAt: data.level2?.instagram?.validatedAt,
          lastTestResult: data.level2?.instagram?.lastPostResult as { success: boolean; error?: string; timestamp: string; postUrl?: string } | undefined,
          requiresVideoUpload: true,
          postingMethod: 'video'
        },
        { 
          id: 'instagram-ainow', 
          name: 'Instagram (AI-Now)', 
          icon: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png', 
          configured: !!data.level2?.['instagram-ainow']?.configured,
          validated: !!data.level2?.['instagram-ainow']?.validated,
          enabled: data.level2?.['instagram-ainow']?.enabled !== false, 
          credentials: data.level2?.['instagram-ainow']?.credentials || {},
          validatedAt: data.level2?.['instagram-ainow']?.validatedAt,
          lastTestResult: data.level2?.['instagram-ainow']?.lastPostResult as { success: boolean; error?: string; timestamp: string; postUrl?: string } | undefined,
          requiresVideoUpload: true,
          postingMethod: 'video'
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
          lastTestResult: data.level2?.threads?.lastPostResult as { success: boolean; error?: string; timestamp: string; postUrl?: string } | undefined,
          supportsLinkPosts: true,
          postingMethod: 'link'
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
          lastTestResult: data.level2?.tiktok?.lastPostResult as { success: boolean; error?: string; timestamp: string; postUrl?: string } | undefined,
          requiresVideoUpload: true,
          postingMethod: 'video'
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
          lastTestResult: data.level2?.odysee?.lastPostResult as { success: boolean; error?: string; timestamp: string; postUrl?: string } | undefined,
          requiresVideoUpload: true,
          postingMethod: 'manual'
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
          lastTestResult: data.level2?.vimeo?.lastPostResult as { success: boolean; error?: string; timestamp: string; postUrl?: string } | undefined,
          requiresVideoUpload: true,
          postingMethod: 'manual'
        },
        { 
          id: 'bluesky', 
          name: 'Bluesky', 
          icon: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Bluesky_Logo.svg', 
          configured: !!data.level2?.bluesky?.configured,
          validated: !!data.level2?.bluesky?.validated,
          enabled: data.level2?.bluesky?.enabled !== false, 
          credentials: data.level2?.bluesky?.credentials || {},
          validatedAt: data.level2?.bluesky?.validatedAt,
          lastTestResult: data.level2?.bluesky?.lastPostResult as { success: boolean; error?: string; timestamp: string; postUrl?: string } | undefined,
          supportsLinkPosts: true,
          postingMethod: 'link'
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
        // Don't show alert - user will see status remain unchanged
        setSaving(false)
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
        // Validation failed - update state to show error in status panel
        if (level === 2) {
          setLevel2(prev => prev.map(pl =>
            pl.id === platformId ? {
              ...pl,
              validated: false,
              lastTestResult: {
                success: false,
                error: result.error || 'Invalid credentials',
                timestamp: new Date().toISOString()
              }
            } : pl
          ))
        }
        setSaving(false)
        return // Don't close form, don't reload config
      }

      // Success - close form and reload
      setEditing(null)
      await loadConfig()
      // Success will show in status panel with green checkmark
    } catch (err) {
      console.error('Save failed:', err)
      // Error will show in status panel
      if (level === 2) {
        setLevel2(prev => prev.map(pl =>
          pl.id === platformId ? {
            ...pl,
            lastTestResult: {
              success: false,
              error: err instanceof Error ? err.message : 'Unknown error',
              timestamp: new Date().toISOString()
            }
          } : pl
        ))
      }
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
      console.log(`🔍 Starting validation for ${platformId} (level ${level})`)
      const response = await fetch(`/api/automation/validate?level=${level}&platformId=${platformId}`)
      const result = await response.json() as { success?: boolean; error?: string; message?: string }

      if (!response.ok) {
        console.error(`❌ Validation failed for ${platformId}:`, result)
        // Update state to show error in status panel
        if (level === 2) {
          setLevel2(prev => prev.map(p =>
            p.id === platformId ? {
              ...p,
              validated: false,
              lastTestResult: {
                success: false,
                error: result.error || 'Unknown error',
                timestamp: new Date().toISOString()
              }
            } : p
          ))
        }
        setValidating(null)
        return
      }

      console.log(`✅ Validation successful for ${platformId}, reloading config...`)
      
      // Update the state immediately to show validated status
      if (level === 1) {
        setLevel1(prev => prev.map(p =>
          p.id === platformId ? { ...p, validated: true, validatedAt: new Date().toISOString() } : p
        ))
      } else {
        setLevel2(prev => prev.map(p =>
          p.id === platformId ? { 
            ...p, 
            validated: true, 
            validatedAt: new Date().toISOString()
            // Keep lastTestResult - status panel needs it
          } : p
        ))
      }
      
      // Reload from server to get any additional updates
      await loadConfig()
      console.log(`✅ Config reloaded for ${platformId}`)
      // Success will show in status panel with green checkmark
    } catch (err) {
      console.error('Validation failed:', err)
      // Update state to show error in status panel
      if (level === 2) {
        setLevel2(prev => prev.map(p =>
          p.id === platformId ? {
            ...p,
            validated: false,
            lastTestResult: {
              success: false,
              error: err instanceof Error ? err.message : 'Unknown error',
              timestamp: new Date().toISOString()
            }
          } : p
        ))
      }
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

      // Result already updated in state above, status panel will show success/failure
      // No need for alert popup
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
      // Error will show in status panel
    } finally {
      setTesting(null)
    }
  }

  async function postLatestNow() {
    // Confirmation handled by button UI state
    // User already clicked the button, proceed

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
        // Show error in modal
        setPostResultModal({
          show: true,
          episode: result.episode,
          results: { error: { success: false, error: result.error || 'Unknown error' } } as Record<string, { success: boolean; error?: string; details?: string; skipped?: boolean }>
        })
        return
      }

      // Reload config to show updated post results
      await loadConfig()

      // Show summary with detailed errors
      const results = result.results || {}
      
      // Show modal with results
      setPostResultModal({
        show: true,
        episode: result.episode,
        results: results as Record<string, { success: boolean; error?: string; details?: string; skipped?: boolean }>
      })

      // Reload config to get latest post results
      await loadConfig()
    } catch (err) {
      console.error('Post latest failed:', err)
      // Show error in modal
      setPostResultModal({
        show: true,
        results: { error: { success: false, error: err instanceof Error ? err.message : 'Unknown error' } } as Record<string, { success: boolean; error?: string; details?: string; skipped?: boolean }>
      })
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

              <div className="flex items-center gap-4">
                <a
                  href="/admin/automation-logs"
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  📋 View Logs
                </a>
                
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
                  <span className="text-base font-semibold">
                    Daily Schedule
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium">Time:</label>
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
                              className="w-full px-3 py-2 border-2 border-black dark:border-white rounded-lg bg-white dark:bg-black"
                            />
                            <input
                              type="text"
                              placeholder="Channel ID"
                              value={p.credentials.channelId || ''}
                              onChange={(e) => updateCred(p.id, 1, 'channelId', e.target.value)}
                              className="w-full px-3 py-2 border-2 border-black dark:border-white rounded-lg bg-white dark:bg-black"
                            />
                          </>
                        )}

                        {p.id === 'rumble' && (
                          <input
                            type="url"
                            placeholder="Channel URL (e.g., https://rumble.com/c/YourChannel)"
                            value={p.credentials.url || ''}
                            onChange={(e) => updateCred(p.id, 1, 'url', e.target.value)}
                            className="w-full px-3 py-2 border-2 border-black dark:border-white rounded-lg bg-white dark:bg-black"
                          />
                        )}

                        {p.id === 'spotify' && (
                          <>
                            <input
                              type="text"
                              placeholder="Client ID (primary)"
                              value={p.credentials.clientId || ''}
                              onChange={(e) => updateCred(p.id, 1, 'clientId', e.target.value)}
                              className="w-full px-3 py-2 border-2 border-black dark:border-white rounded-lg bg-white dark:bg-black"
                            />
                            <input
                              type="password"
                              placeholder="Client Secret (primary)"
                              value={p.credentials.clientSecret || ''}
                              onChange={(e) => updateCred(p.id, 1, 'clientSecret', e.target.value)}
                              className="w-full px-3 py-2 border-2 border-black dark:border-white rounded-lg bg-white dark:bg-black"
                            />
                            <input
                              type="text"
                              placeholder="Show ID (primary)"
                              value={p.credentials.showId || ''}
                              onChange={(e) => updateCred(p.id, 1, 'showId', e.target.value)}
                              className="w-full px-3 py-2 border-2 border-black dark:border-white rounded-lg bg-white dark:bg-black"
                            />
                            <input
                              type="url"
                              placeholder="RSS Feed URL (fallback)"
                              value={p.credentials.rssFeedUrl || ''}
                              onChange={(e) => updateCred(p.id, 1, 'rssFeedUrl', e.target.value)}
                              className="w-full px-3 py-2 border-2 border-black dark:border-white rounded-lg bg-white dark:bg-black"
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
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{p.name}</h3>
                            {/* Posting Method Badge */}
                            {p.postingMethod === 'link' && (
                              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 font-medium">
                                🔗 Link Posts
                              </span>
                            )}
                            {p.postingMethod === 'video' && (
                              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 font-medium">
                                🎥 Video Upload
                              </span>
                            )}
                            {p.postingMethod === 'manual' && (
                              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 font-medium">
                                ✋ Manual Only
                              </span>
                            )}
                          </div>
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
                    <div className="space-y-2 mb-4 text-sm break-words">
                      {(p.id === 'twitter' || p.id === 'twitter-ainow') && (
                        <>
                          <div><span className="font-medium">App Key:</span> <span className="break-all">{p.credentials.appKey || 'Not set'}</span></div>
                          <div><span className="font-medium">App Secret:</span> {p.credentials.appSecret === '(configured)' || p.credentials.appSecret ? '••••••••' : 'Not set'}</div>
                          <div><span className="font-medium">Access Token:</span> <span className="break-all">{p.credentials.accessToken || 'Not set'}</span></div>
                          <div><span className="font-medium">Access Secret:</span> {p.credentials.accessSecret === '(configured)' || p.credentials.accessSecret ? '••••••••' : 'Not set'}</div>
                        </>
                      )}
                      {(p.id === 'facebook' || p.id === 'facebook-ainow') && (
                        <>
                          <div><span className="font-medium">Page ID:</span> <span className="break-all">{p.credentials.pageId || 'Not set'}</span></div>
                          <div><span className="font-medium">Page Access Token:</span> <span className="break-all">{p.credentials.pageAccessToken === '(configured)' ? '••••••••' : (p.credentials.pageAccessToken ? '••••••••' + p.credentials.pageAccessToken.slice(-4) : 'Not set')}</span></div>
                        </>
                      )}
                      {p.id === 'linkedin' && (
                        <>
                          <div><span className="font-medium">Client ID:</span> <span className="break-all">{p.credentials.clientId || 'Not set'}</span></div>
                          <div><span className="font-medium">Client Secret:</span> {p.credentials.clientSecret === '(configured)' || p.credentials.clientSecret ? '••••••••' : 'Not set'}</div>
                          <div><span className="font-medium">Access Token:</span> <span className="break-all">{p.credentials.accessToken === '(configured)' || p.credentials.accessToken ? '••••••••' : 'Not set'}</span></div>
                          <div><span className="font-medium">Person URN:</span> <span className="break-all">{p.credentials.personUrn || 'Not set (will be fetched on validation)'}</span></div>
                          <div><span className="font-medium">Organization URN:</span> <span className="break-all">{p.credentials.organizationUrn || 'Not set (personal posting only)'}</span></div>
                          {p.credentials.organizationUrn && (
                            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">💼 Posts will go to company page</div>
                          )}
                        </>
                      )}
                      {(p.id === 'instagram' || p.id === 'threads') && (
                        <>
                          <div><span className="font-medium">Access Token:</span> <span className="break-all">{p.credentials.accessToken || 'Not set'}</span></div>
                          <div><span className="font-medium">User ID:</span> <span className="break-all">{p.credentials.userId || 'Not set (will be fetched on validation)'}</span></div>
                          {p.credentials.username && <div><span className="font-medium">Username:</span> @{p.credentials.username}</div>}
                        </>
                      )}
                      {(p.id === 'tiktok' || p.id === 'odysee' || p.id === 'vimeo') && (
                        <div><span className="font-medium">Channel URL:</span> <span className="break-all">{p.credentials.url || 'Not set'}</span></div>
                      )}
                      {p.id === 'bluesky' && (
                        <>
                          <div><span className="font-medium">Username:</span> {p.credentials.username || 'Not set'}</div>
                          <div><span className="font-medium">App Password:</span> {p.credentials.appPassword === '(configured)' || p.credentials.appPassword ? '••••••••' : 'Not set'}</div>
                          {p.credentials.handle && <div><span className="font-medium">Handle:</span> {p.credentials.handle}</div>}
                          {p.credentials.did && <div><span className="font-medium">DID:</span> <span className="text-xs">{p.credentials.did}</span></div>}
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
                        {(p.id === 'twitter' || p.id === 'twitter-ainow') && (
                          <>
                            <input
                              type="text"
                              placeholder="App Key"
                              value={p.credentials.appKey || ''}
                              onChange={(e) => updateCred(p.id, 2, 'appKey', e.target.value)}
                              className="w-full px-3 py-2 border-2 border-black dark:border-white rounded-lg bg-white dark:bg-black"
                            />
                            <input
                              type="password"
                              placeholder="App Secret"
                              value={p.credentials.appSecret || ''}
                              onChange={(e) => updateCred(p.id, 2, 'appSecret', e.target.value)}
                              className="w-full px-3 py-2 border-2 border-black dark:border-white rounded-lg bg-white dark:bg-black"
                            />
                            <input
                              type="text"
                              placeholder="Access Token"
                              value={p.credentials.accessToken || ''}
                              onChange={(e) => updateCred(p.id, 2, 'accessToken', e.target.value)}
                              className="w-full px-3 py-2 border-2 border-black dark:border-white rounded-lg bg-white dark:bg-black"
                            />
                            <input
                              type="password"
                              placeholder="Access Secret"
                              value={p.credentials.accessSecret || ''}
                              onChange={(e) => updateCred(p.id, 2, 'accessSecret', e.target.value)}
                              className="w-full px-3 py-2 border-2 border-black dark:border-white rounded-lg bg-white dark:bg-black"
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
                              className="w-full px-3 py-2 border-2 border-black dark:border-white rounded-lg bg-white dark:bg-black"
                            />
                            <input
                              type="password"
                              placeholder="Page Access Token"
                              value={p.credentials.pageAccessToken || ''}
                              onChange={(e) => updateCred(p.id, 2, 'pageAccessToken', e.target.value)}
                              className="w-full px-3 py-2 border-2 border-black dark:border-white rounded-lg bg-white dark:bg-black"
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
                              className="w-full px-3 py-2 border-2 border-black dark:border-white rounded-lg bg-white dark:bg-black"
                            />
                            <input
                              type="password"
                              placeholder="Client Secret"
                              value={p.credentials.clientSecret || ''}
                              onChange={(e) => updateCred(p.id, 2, 'clientSecret', e.target.value)}
                              className="w-full px-3 py-2 border-2 border-black dark:border-white rounded-lg bg-white dark:bg-black"
                            />
                            <input
                              type="password"
                              placeholder="Access Token"
                              value={p.credentials.accessToken || ''}
                              onChange={(e) => updateCred(p.id, 2, 'accessToken', e.target.value)}
                              className="w-full px-3 py-2 border-2 border-black dark:border-white rounded-lg bg-white dark:bg-black"
                            />
                            <input
                              type="text"
                              placeholder="Organization URN (optional, for company page posting - e.g., urn:li:organization:108130024)"
                              value={p.credentials.organizationUrn || ''}
                              onChange={(e) => updateCred(p.id, 2, 'organizationUrn', e.target.value)}
                              className="w-full px-3 py-2 border-2 border-black dark:border-white rounded-lg bg-white dark:bg-black"
                            />
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              💼 Leave Organization URN empty to post to your personal profile. Add organization URN to post to company page instead.
                            </div>
                          </>
                        )}

                        {(p.id === 'instagram' || p.id === 'threads') && (
                          <input
                            type="text"
                            placeholder="Access Token"
                            value={p.credentials.accessToken || ''}
                            onChange={(e) => updateCred(p.id, 2, 'accessToken', e.target.value)}
                            className="w-full px-3 py-2 border-2 border-black dark:border-white rounded-lg bg-white dark:bg-black"
                          />
                        )}

                        {(p.id === 'tiktok' || p.id === 'odysee' || p.id === 'vimeo') && (
                          <input
                            type="url"
                            placeholder="Channel URL"
                            value={p.credentials.url || ''}
                            onChange={(e) => updateCred(p.id, 2, 'url', e.target.value)}
                            className="w-full px-3 py-2 border-2 border-black dark:border-white rounded-lg bg-white dark:bg-black"
                          />
                        )}

                        {p.id === 'bluesky' && (
                          <>
                            <input
                              type="text"
                              placeholder="Username (e.g., ai-now.bsky.social)"
                              value={p.credentials.username || ''}
                              onChange={(e) => updateCred(p.id, 2, 'username', e.target.value)}
                              className="w-full px-3 py-2 border-2 border-black dark:border-white rounded-lg bg-white dark:bg-black"
                            />
                            <input
                              type="password"
                              placeholder="App Password (from Bluesky settings)"
                              value={p.credentials.appPassword || ''}
                              onChange={(e) => updateCred(p.id, 2, 'appPassword', e.target.value)}
                              className="w-full px-3 py-2 border-2 border-black dark:border-white rounded-lg bg-white dark:bg-black"
                            />
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Generate an app password in Bluesky: Settings → Privacy → App Passwords
                            </div>
                          </>
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
                    {/* Status Panel - Always Visible */}
                    <div className={`mb-4 p-4 rounded-lg border-2 ${
                      !p.configured 
                        ? 'bg-gray-50 dark:bg-gray-900/20 border-gray-400'
                        : !p.validated
                        ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
                        : p.lastTestResult?.success
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                        : p.lastTestResult && !p.lastTestResult.success
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                        : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                    }`}>
                      <div className="flex items-start gap-2">
                        {!p.configured ? (
                          <XCircle className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                        ) : !p.validated ? (
                          <XCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        ) : p.lastTestResult?.success ? (
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : p.lastTestResult && !p.lastTestResult.success ? (
                          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className={`font-semibold mb-1 ${
                            !p.configured 
                              ? ''
                              : !p.validated
                              ? 'text-yellow-900 dark:text-yellow-100'
                              : p.lastTestResult?.success
                              ? 'text-green-900 dark:text-green-100'
                              : p.lastTestResult && !p.lastTestResult.success
                              ? 'text-red-900 dark:text-red-100'
                              : 'text-blue-900 dark:text-blue-100'
                          }`}>
                            {!p.configured 
                              ? 'Not Configured'
                              : !p.validated
                              ? 'Configured - Needs Validation'
                              : p.lastTestResult?.success
                              ? 'Last Test Post: Success'
                              : p.lastTestResult && !p.lastTestResult.success
                              ? 'Last Test Post: Failed'
                              : 'Validated - Ready to Test'
                            }
                          </div>
                          
                          {/* Details based on state */}
                          {!p.configured && (
                            <div className="text-sm ">
                              Click &quot;Configure&quot; to add credentials
                            </div>
                          )}
                          
                          {p.configured && !p.validated && (
                            <div className="text-sm text-yellow-800 dark:text-yellow-200">
                              Credentials added but not validated. Click &quot;Validate&quot; to verify.
                            </div>
                          )}
                          
                          {p.validated && !p.lastTestResult && (
                            <div className="text-sm text-blue-800 dark:text-blue-200">
                              Credentials validated successfully. Click &quot;Test Post&quot; to verify posting works.
                            </div>
                          )}
                          
                          {p.lastTestResult && p.lastTestResult.success && (
                            <>
                              <div className="text-sm text-green-800 dark:text-green-200 mb-1">
                                Test post completed successfully!
                              </div>
                              {p.lastTestResult.postUrl && (
                                <a 
                                  href={p.lastTestResult.postUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-sm text-green-700 dark:text-green-300 hover:underline break-all"
                                >
                                  View Post →
                                </a>
                              )}
                              <div className="text-xs text-green-700 dark:text-green-300 mt-1">
                                {new Date(p.lastTestResult.timestamp).toLocaleString()}
                              </div>
                            </>
                          )}
                          
                          {p.lastTestResult && !p.lastTestResult.success && (
                            <>
                              <div className="text-sm text-red-800 dark:text-red-200 mb-2 break-words whitespace-pre-wrap">
                                {p.lastTestResult.error}
                              </div>
                              <div className="text-xs text-red-700 dark:text-red-300">
                                {new Date(p.lastTestResult.timestamp).toLocaleString()}
                              </div>
                              <div className="text-xs text-red-600 dark:text-red-400 mt-2">
                                💡 Tip: Re-validate credentials or check the error details above
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

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

      {/* Post Results Modal */}
      {postResultModal.show && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4"
          onClick={() => setPostResultModal({ show: false })}
        >
          <div 
            className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" />
                Posting Complete!
              </h2>
              {postResultModal.episode?.title && (
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2 break-words">
                  Episode: {postResultModal.episode.title}
                </p>
              )}
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
                <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-lg p-3 sm:p-4">
                  <div className="text-2xl sm:text-3xl font-bold text-green-600">
                    {Object.values(postResultModal.results || {}).filter(r => r.success).length}
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-green-800 dark:text-green-200">Success</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-lg p-3 sm:p-4">
                  <div className="text-2xl sm:text-3xl font-bold text-red-600">
                    {Object.values(postResultModal.results || {}).filter(r => !r.success && !r.skipped).length}
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-red-800 dark:text-red-200">Failed</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 border-2 border-gray-500 rounded-lg p-3 sm:p-4">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-600 dark:text-gray-300">
                    {Object.values(postResultModal.results || {}).filter(r => r.skipped).length}
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Skipped</div>
                </div>
              </div>

              {/* Detailed Results */}
              <div className="space-y-2 sm:space-y-3">
                {Object.entries(postResultModal.results || {}).map(([platform, result]) => (
                  <div 
                    key={platform}
                    className={`p-3 sm:p-4 rounded-lg border-2 ${
                      result.success 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-500' 
                        : result.skipped
                        ? 'bg-gray-50 dark:bg-gray-800 border-gray-500'
                        : 'bg-red-50 dark:bg-red-900/20 border-red-500'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className={`font-semibold text-base sm:text-lg mb-1 capitalize flex items-center gap-2 ${
                          result.success 
                            ? 'text-green-900 dark:text-green-100' 
                            : result.skipped
                            ? ''
                            : 'text-red-900 dark:text-red-100'
                        }`}>
                          {result.success ? (
                            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0" />
                          ) : result.skipped ? (
                            <Square className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 flex-shrink-0" />
                          )}
                          <span className="break-words">{platform}</span>
                        </div>
                        {result.error && (
                          <div className={`text-xs sm:text-sm p-2 sm:p-3 rounded mt-2 break-words overflow-x-auto ${
                            result.success 
                              ? 'bg-white/50 dark:bg-black/30 text-green-900 dark:text-green-100' 
                              : result.skipped
                              ? 'bg-white/50 dark:bg-black/30 '
                              : 'bg-white/50 dark:bg-black/30 text-red-900 dark:text-red-100'
                          }`}>
                            <div className="font-mono text-xs sm:text-sm leading-relaxed">
                              {result.error}
                            </div>
                          </div>
                        )}
                        {result.details && (
                          <div className={`text-xs p-2 sm:p-3 rounded mt-2 break-words overflow-x-auto ${
                            result.success 
                              ? 'bg-white/50 dark:bg-black/30 text-green-800 dark:text-green-200' 
                              : result.skipped
                              ? 'bg-white/50 dark:bg-black/30 text-gray-800 dark:text-gray-200'
                              : 'bg-white/50 dark:bg-black/30 text-red-800 dark:text-red-200'
                          }`}>
                            <div className="font-mono text-xs leading-relaxed">
                              {typeof result.details === 'string' ? result.details : JSON.stringify(result.details, null, 2)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setPostResultModal({ show: false })}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold text-sm sm:text-base transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
