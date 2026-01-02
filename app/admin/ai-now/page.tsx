'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface AutomationStatus {
  lastRun: string | null
  nextRun: string | null
  status: 'idle' | 'running' | 'error'
  recentActivities: Array<{
    timestamp: string
    action: string
    status: 'success' | 'error' | 'info'
    details?: string
  }>
  stats: {
    totalRuns: number
    successfulRuns: number
    failedRuns: number
    lastSuccess: string | null
  }
}

export default function AINowManagement() {
  const [status, setStatus] = useState<AutomationStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [triggering, setTriggering] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadStatus()
  }, [])

  async function loadStatus() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/ai-now/status')
      if (!res.ok) throw new Error('Failed to fetch status')
      const data = await res.json() as { success: boolean; data: AutomationStatus }
      setStatus(data.data)
      setLoading(false)
    } catch (err) {
      console.error('Failed to load status:', err)
      setError('Failed to load automation status')
      setLoading(false)
    }
  }

  async function triggerManualRun() {
    try {
      setTriggering(true)
      setError(null)

      const res = await fetch('/api/admin/ai-now/trigger', { method: 'POST' })
      if (!res.ok) throw new Error('Failed to trigger run')
      const data = await res.json() as { success: boolean; data: AutomationStatus }

      setStatus(data.data)

      // Reload status after a delay to see the results
      setTimeout(() => {
        loadStatus()
      }, 6000)

      setTriggering(false)
    } catch (err) {
      console.error('Failed to trigger run:', err)
      setError('Failed to trigger manual run')
      setTriggering(false)
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString()
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'success': return 'text-green-600'
      case 'error': return 'text-red-600'
      case 'info': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <main className="min-h-screen">
      <Header isAdmin />

      <div className="p-6 pt-24">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI-Now News Gatherer Management</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Monitor and control your automated AI news generation system</p>
          </div>

        {error && (
          <div className="mb-6 rounded-xl p-4 bg-red-100 text-red-800 border border-red-200">
            {error}
            <button
              onClick={() => setError(null)}
              className="float-right ml-2 text-red-800 hover:text-red-900"
            >
              ×
            </button>
          </div>
        )}

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="rounded-xl bg-[#212121ff] text-white p-6">
            <h3 className="text-lg font-semibold mb-2">System Status</h3>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                status?.status === 'running' ? 'bg-green-500' :
                status?.status === 'error' ? 'bg-red-500' : 'bg-gray-500'
              }`}></div>
              <span className="text-2xl font-bold capitalize">{status?.status || 'Loading...'}</span>
            </div>
          </div>

          <div className="rounded-xl bg-[#212121ff] text-white p-6">
            <h3 className="text-lg font-semibold mb-2">Last Run</h3>
            <p className="text-sm text-gray-300">
              {status?.lastRun ? formatDate(status.lastRun) : 'Never'}
            </p>
          </div>

          <div className="rounded-xl bg-[#212121ff] text-white p-6">
            <h3 className="text-lg font-semibold mb-2">Next Run</h3>
            <p className="text-sm text-gray-300">
              {status?.nextRun ? formatDate(status.nextRun) : 'Not scheduled'}
            </p>
          </div>

          <div className="rounded-xl bg-[#212121ff] text-white p-6">
            <h3 className="text-lg font-semibold mb-2">Success Rate</h3>
            <p className="text-2xl font-bold text-green-400">
              {status ? Math.round((status.stats.successfulRuns / status.stats.totalRuns) * 100) : 0}%
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold  mb-4">Controls</h2>
          <div className="flex gap-4">
            <button
              onClick={triggerManualRun}
              disabled={triggering || status?.status === 'running'}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {triggering ? 'Triggering...' : 'Trigger Manual Run'}
            </button>
            <button
              onClick={loadStatus}
              disabled={loading}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Refreshing...' : 'Refresh Status'}
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold  mb-4">Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{status?.stats.totalRuns || 0}</p>
              <p className="text-sm text-gray-600">Total Runs</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{status?.stats.successfulRuns || 0}</p>
              <p className="text-sm text-gray-600">Successful</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{status?.stats.failedRuns || 0}</p>
              <p className="text-sm text-gray-600">Failed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {status?.stats.lastSuccess ? formatDate(status.stats.lastSuccess) : 'Never'}
              </p>
              <p className="text-sm text-gray-600">Last Success</p>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold  mb-4">Recent Activities</h2>
          {loading ? (
            <p className="text-gray-600">Loading activities...</p>
          ) : (
            <div className="space-y-4">
              {status?.recentActivities.map((activity, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{activity.action}</h3>
                    <span className={`text-sm font-medium ${getStatusColor(activity.status)}`}>
                      {activity.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{activity.details}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(activity.timestamp)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
