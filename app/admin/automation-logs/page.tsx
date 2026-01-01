'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { useTheme } from '@/components/theme/ThemeContext';
import { Calendar, RefreshCw, CheckCircle, XCircle, AlertCircle, TrendingUp, Activity, Zap, HelpCircle, Download, Lightbulb, BookOpen, Upload, ArrowDownToLine } from 'lucide-react';

interface LogEntry {
  timestamp: string;
  type: 'check' | 'post-latest' | 'manual' | 'system';
  level: 'info' | 'success' | 'warn' | 'error';
  message: string;
  details?: {
    source?: string;
    platform?: string;
    videoId?: string;
    postUrl?: string;
    error?: string;
    duration?: number;
    userAgent?: string;
    trigger?: string;
    title?: string;
    checked?: number;
    newContent?: number;
    posted?: number;
    errors?: number;
    [key: string]: string | number | undefined;
  };
}

interface DailyLog {
  date: string;
  entries: LogEntry[];
  summary: {
    totalExecutions: number;
    successfulPosts: number;
    failedPosts: number;
    platformBreakdown: Record<string, { success: number; failed: number }>;
  };
}

interface LogsSummary {
  totalDays: number;
  totalExecutions: number;
  successRate: number;
  mostRecentExecution: string | null;
  platformStats: Record<string, { success: number; failed: number; rate: number }>;
}

type ViewMode = 'status' | 'activity' | 'errors';

export default function AutomationLogsPage() {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [summary, setSummary] = useState<LogsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('status');
  const [filterSource, setFilterSource] = useState<string>('');
  const [filterPlatform, setFilterPlatform] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [showHelp, setShowHelp] = useState(false);
  const [automationEnabled, setAutomationEnabled] = useState<boolean | null>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  async function checkAutomationStatus() {
    try {
      const response = await fetch('/api/automation/status');
      const data = await response.json() as { running?: boolean };
      setAutomationEnabled(data.running ?? null);
    } catch (error) {
      console.error('Failed to check automation status:', error);
    }
  }

  async function loadLogs() {
    setLoading(true);
    try {
      const response = await fetch('/api/automation/logs');
      const data: {
        success: boolean;
        logs?: DailyLog[];
        summary?: LogsSummary;
      } = await response.json();
      
      if (data.success) {
        setLogs(data.logs || []);
        setSummary(data.summary || null);
        setLastRefresh(new Date());
      }
    } catch (error) {
      console.error('Failed to load logs:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();
    checkAutomationStatus();
    
    // Auto-refresh every 30 seconds if enabled
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadLogs();
        checkAutomationStatus();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  

  // Get all posting activity
  const allPostingActivity = logs.flatMap(log => 
    log.entries.filter(e => e.details?.source && e.details?.platform)
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Filter logs based on selected source or platform  
  const filteredActivity = allPostingActivity.filter(entry => {
    if (filterSource && entry.details?.source !== filterSource) return false;
    if (filterPlatform && entry.details?.platform !== filterPlatform) return false;
    return true;
  });

  // Get unique sources and platforms
  const allSources = Array.from(new Set(
    allPostingActivity.map(e => e.details?.source).filter(Boolean) as string[]
  )).sort();

  const allPlatforms = Array.from(new Set(
    allPostingActivity.map(e => e.details?.platform).filter(Boolean) as string[]
  )).sort();

  // Calculate real-time stats
  const last24h = allPostingActivity.filter(e => {
    const age = Date.now() - new Date(e.timestamp).getTime();
    return age < 24 * 60 * 60 * 1000;
  });

  const errors = allPostingActivity.filter(e => e.level === 'error');
  const last24hErrors = errors.filter(e => {
    const age = Date.now() - new Date(e.timestamp).getTime();
    return age < 24 * 60 * 60 * 1000;
  });

  // Platform health scores
  const platformHealth = Object.entries(summary?.platformStats || {}).map(([name, stats]) => ({
    name,
    success: stats.success,
    failed: stats.failed,
    rate: stats.rate,
    status: stats.rate >= 90 ? 'healthy' : stats.rate >= 70 ? 'degraded' : 'critical'
  })).sort((a, b) => b.rate - a.rate);

  // Source activity breakdown
  const sourceActivity = allSources.map(source => {
    const posts = allPostingActivity.filter(e => e.details?.source === source);
    const successes = posts.filter(e => e.level === 'success').length;
    return {
      name: source,
      total: posts.length,
      success: successes,
      failed: posts.length - successes,
      rate: posts.length > 0 ? Math.round((successes / posts.length) * 100) : 0
    };
  }).sort((a, b) => b.total - a.total);

  // Get most recent 5 activities
  const recentActivity = allPostingActivity.slice(0, 5);

  const clearFilters = () => {
    setFilterSource('');
    setFilterPlatform('');
  };

  const exportLogs = () => {
    const dataStr = JSON.stringify({ logs, summary }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `automation-logs-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const clearAllLogs = async () => {
    if (!confirm('Are you sure you want to clear all automation logs? This cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch('/api/automation/logs/clear', { method: 'DELETE' });
      const data = await response.json() as { success?: boolean; error?: string };
      
      if (data.success) {
        alert('Logs cleared successfully!');
        await loadLogs();
      } else {
        alert('Failed to clear logs: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Error clearing logs: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  return (
    <div className={`min-h-screen ${
      isDark 
        ? 'bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900' 
        : 'bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50'
    }`}>
      <Header isAdmin />
      
      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Automation Logs Help</h2>
                <button
                  onClick={() => setShowHelp(false)}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  Platform Status
                </h3>
                <p className="text-gray-700">View health metrics for all Level 2 platforms. Click any platform to filter activity logs.</p>
                <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
                  <li><span className="text-green-600 font-bold">Green (90%+)</span> - Healthy, operating normally</li>
                  <li><span className="text-yellow-600 font-bold">Yellow (70-89%)</span> - Degraded, some failures</li>
                  <li><span className="text-red-600 font-bold">Red (&lt;70%)</span> - Critical, frequent failures</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Activity Log
                </h3>
                <p className="text-gray-700">Real-time feed of all posting attempts. Filter by source (Level 1) or destination platform (Level 2).</p>
                <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
                  <li><span className="font-bold">Source</span> - Where content originates (YouTube, Spotify, Rumble)</li>
                  <li><span className="font-bold">Platform</span> - Where it&apos;s posted (Twitter, LinkedIn, Facebook, etc)</li>
                  <li><span className="font-bold">View Post</span> - Click to open published content</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  Errors Only
                </h3>
                <p className="text-gray-700">View all failed posting attempts with detailed error messages for debugging.</p>
              </div>
              
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-green-600" />
                  Auto-Refresh
                </h3>
                <p className="text-gray-700">Automatically updates every 30 seconds when enabled. Toggle off to pause updates.</p>
              </div>
              
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
                  <Download className="w-5 h-5 text-indigo-600" />
                  Export
                </h3>
                <p className="text-gray-700">Download all logs and statistics as JSON for analysis or backup.</p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Tips
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Logs are kept for 7 days, then automatically cleaned up</li>
                  <li>• Each day limited to 100 entries to prevent storage overflow</li>
                  <li>• Click platform badges in Activity Log to filter</li>
                  <li>• Hover over failed posts to see error details</li>
                </ul>
              </div>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Full Documentation
                </h4>
                <p className="text-sm text-purple-800">
                  See <code className="bg-purple-100 px-2 py-1 rounded">docs/AUTOMATION_LOGGING_GUIDE.md</code> for complete API reference and integration examples.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 py-24">
        {/* Header with Stats */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">Automation Command Center</h1>
                {automationEnabled !== null && (
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                    automationEnabled 
                      ? 'bg-green-500/20 border border-green-500/50' 
                      : 'bg-red-500/20 border border-red-500/50'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      automationEnabled ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                    }`} />
                    <span className={`text-xs font-bold ${
                      automationEnabled ? 'text-green-200' : 'text-red-200'
                    }`}>
                      {automationEnabled ? 'ACTIVE' : 'PAUSED'}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-purple-200">Real-time monitoring • Platform health • Activity logs</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowHelp(true)}
                className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition-all shadow-lg hover:shadow-xl"
                title="Show help"
              >
                <HelpCircle className="w-5 h-5" />
                Help
              </button>
              <button
                onClick={exportLogs}
                disabled={logs.length === 0}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg disabled:opacity-50 transition-all shadow-lg hover:shadow-xl"
                title="Export logs as JSON"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
              </button>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-lg rounded-lg px-4 py-2">
                <input
                  type="checkbox"
                  id="autoRefresh"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="autoRefresh" className="text-sm text-white cursor-pointer">
                  Auto-refresh (30s)
                </label>
                {autoRefresh && (
                  <span className="text-xs text-purple-200 ml-2">
                    Last: {lastRefresh.toLocaleTimeString()}
                  </span>
                )}
              </div>
              <button
                onClick={loadLogs}
                disabled={loading}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg disabled:opacity-50 transition-all shadow-lg hover:shadow-xl"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 backdrop-blur-lg rounded-xl p-5 border border-green-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-200 text-sm font-medium">Success Rate</span>
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-white">{summary?.successRate || 0}%</div>
              <div className="text-xs text-green-200 mt-1">
                {summary?.platformStats && Object.values(summary.platformStats).reduce((a, b) => a + b.success, 0)} successful posts
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 backdrop-blur-lg rounded-xl p-5 border border-blue-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-200 text-sm font-medium">Last 24 Hours</span>
                <Activity className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-white">{last24h.length}</div>
              <div className="text-xs text-blue-200 mt-1">
                {last24h.filter(e => e.level === 'success').length} posted, {last24hErrors.length} failed
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 backdrop-blur-lg rounded-xl p-5 border border-purple-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-200 text-sm font-medium">Platforms Active</span>
                <Zap className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-3xl font-bold text-white">
                {platformHealth.filter(p => p.status === 'healthy').length}/{platformHealth.length}
              </div>
              <div className="text-xs text-purple-200 mt-1">
                {platformHealth.filter(p => p.status === 'healthy').length} healthy
              </div>
            </div>

            <div className={`bg-gradient-to-br rounded-xl p-5 border backdrop-blur-lg ${
              errors.length === 0 
                ? 'from-gray-500/20 to-gray-600/10 border-gray-500/30' 
                : 'from-red-500/20 to-red-600/10 border-red-500/30'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${errors.length === 0 ? 'text-gray-200' : 'text-red-200'}`}>Total Errors</span>
                {errors.length === 0 ? <CheckCircle className="w-5 h-5 text-gray-400" /> : <AlertCircle className="w-5 h-5 text-red-400" />}
              </div>
              <div className="text-3xl font-bold text-white">{errors.length}</div>
              <div className={`text-xs mt-1 ${errors.length === 0 ? 'text-gray-200' : 'text-red-200'}`}>
                {last24hErrors.length} in last 24h
              </div>
            </div>
          </div>

          {/* Recent Activity Widget */}
          {recentActivity.length > 0 && (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-5 mb-6">
              <h3 className="text-lg font-bold text-white mb-3">Recent Activity</h3>
              <div className="space-y-2">
                {recentActivity.map((entry, idx) => {
                  const isSuccess = entry.level === 'success';
                  const timestamp = new Date(entry.timestamp);
                  const minutesAgo = Math.floor((Date.now() - timestamp.getTime()) / 60000);
                  const timeStr = minutesAgo < 1 ? 'Just now' : minutesAgo < 60 ? `${minutesAgo}m ago` : timestamp.toLocaleTimeString();
                  
                  return (
                    <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg ${isSuccess ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                      {isSuccess ? (
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-blue-200">{entry.details?.source}</span>
                          <span className="text-xs text-gray-400">→</span>
                          <span className="text-xs font-bold text-purple-200">{entry.details?.platform}</span>
                        </div>
                        <div className="text-sm text-white truncate">{entry.details?.title || entry.message}</div>
                      </div>
                      <div className="text-xs text-gray-300 whitespace-nowrap">{timeStr}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* View Mode Tabs */}
          <div className="flex gap-2 bg-white/10 backdrop-blur-lg rounded-xl p-2 mb-6">
            <button
              onClick={() => setViewMode('status')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                viewMode === 'status'
                  ? 'bg-white text-purple-900 shadow-lg'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Platform Status
              </div>
            </button>
            <button
              onClick={() => setViewMode('activity')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                viewMode === 'activity'
                  ? 'bg-white text-purple-900 shadow-lg'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Activity className="w-4 h-4" />
                Activity Log
              </div>
            </button>
            <button
              onClick={() => setViewMode('errors')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                viewMode === 'errors'
                  ? 'bg-white text-purple-900 shadow-lg'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Errors Only
                {errors.length > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {errors.length}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Platform Status View */}
        {viewMode === 'status' && (
          <div className="space-y-6">
            {/* Platform Health */}
            <div className="bg-white rounded-xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white">Platform Health</h2>
                <p className="text-purple-100 text-sm">Performance metrics for all Level 2 platforms</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {platformHealth.map(platform => (
                    <div
                      key={platform.name}
                      onClick={() => {
                        setFilterPlatform(filterPlatform === platform.name ? '' : platform.name);
                        setFilterSource('');
                        setViewMode('activity');
                      }}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg ${
                        platform.status === 'healthy'
                          ? 'bg-green-50 border-green-300 hover:border-green-500'
                          : platform.status === 'degraded'
                          ? 'bg-yellow-50 border-yellow-300 hover:border-yellow-500'
                          : 'bg-red-50 border-red-300 hover:border-red-500'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-gray-900 capitalize">{platform.name}</span>
                        {platform.status === 'healthy' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : platform.status === 'degraded' ? (
                          <AlertCircle className="w-5 h-5 text-yellow-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div className="mb-2">
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold text-gray-900">{platform.rate}%</span>
                          <span className="text-sm text-gray-500">success</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span className="text-green-700">✓ {platform.success}</span>
                        <span className="text-red-700">✗ {platform.failed}</span>
                      </div>
                      <div className="mt-2 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            platform.status === 'healthy' ? 'bg-green-500' : platform.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${platform.rate}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Source Activity */}
            <div className="bg-white rounded-xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white">Content Sources</h2>
                <p className="text-blue-100 text-sm">Activity breakdown by Level 1 platform</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {sourceActivity.map(source => (
                    <div
                      key={source.name}
                      onClick={() => {
                        setFilterSource(filterSource === source.name ? '' : source.name);
                        setFilterPlatform('');
                        setViewMode('activity');
                      }}
                      className="p-4 rounded-lg border-2 border-blue-200 bg-blue-50 hover:border-blue-500 cursor-pointer transition-all hover:shadow-lg"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-gray-900 capitalize">{source.name}</span>
                        <Activity className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="mb-2">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-gray-900">{source.total}</span>
                          <span className="text-sm text-gray-500">posts</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                        <span className="text-green-700 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> {source.success}</span>
                        <span className="text-red-700 flex items-center gap-1"><XCircle className="w-3 h-3" /> {source.failed}</span>
                      </div>
                      <div className="text-xs font-medium text-blue-700">{source.rate}% success rate</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Activity Log View */}
        {viewMode === 'activity' && (
          <div className="space-y-6">
            {/* Filters */}
            {(allSources.length > 0 || allPlatforms.length > 0) && (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-200 font-medium">FILTER BY</span>
                  {(filterSource || filterPlatform) && (
                    <button
                      onClick={clearFilters}
                      className="text-xs text-purple-300 hover:text-white font-medium"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {allSources.map(source => (
                    <button
                      key={source}
                      onClick={() => {
                        setFilterSource(filterSource === source ? '' : source);
                        setFilterPlatform('');
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        filterSource === source
                          ? 'bg-blue-500 text-white shadow-lg ring-2 ring-blue-300'
                          : 'bg-white/20 text-gray-200 hover:bg-white/30'
                      }`}
                    >
                      <Upload className="w-4 h-4 inline-block mr-1" />
                      {source}
                    </button>
                  ))}
                  {allPlatforms.map(platform => (
                    <button
                      key={platform}
                      onClick={() => {
                        setFilterPlatform(filterPlatform === platform ? '' : platform);
                        setFilterSource('');
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        filterPlatform === platform
                          ? 'bg-purple-500 text-white shadow-lg ring-2 ring-purple-300'
                          : 'bg-white/20 text-gray-200 hover:bg-white/30'
                      }`}
                    >
                      <ArrowDownToLine className="w-4 h-4 inline-block mr-1" />
                      {platform}
                    </button>
                  ))}
                </div>
                {(filterSource || filterPlatform) && (
                  <div className="mt-3 text-sm text-purple-200">
                    Showing: {filterSource ? `Content from ${filterSource}` : ''} 
                    {filterSource && filterPlatform ? ' → ' : ''}
                    {filterPlatform ? `Posts to ${filterPlatform}` : filterSource ? ' to all platforms' : `All content to ${filterPlatform}`}
                  </div>
                )}
              </div>
            )}

            {/* Activity Table */}
            <div className="bg-white rounded-xl shadow-xl overflow-hidden">
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <div className="flex items-center gap-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div className="w-24">Time</div>
                  <div className="w-32">From</div>
                  <div className="w-32">To</div>
                  <div className="flex-1">Content</div>
                  <div className="w-24 text-right">Result</div>
                </div>
              </div>
              
              <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                {filteredActivity.length === 0 ? (
                  <div className="p-16 text-center">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg font-medium mb-2">
                      {loading ? 'Loading activity...' : (filterSource || filterPlatform) ? 'No matching activity' : 'No activity yet'}
                    </p>
                    {(filterSource || filterPlatform) && (
                      <button onClick={clearFilters} className="text-purple-600 hover:text-purple-800 text-sm font-medium">
                        Clear filters to see all activity
                      </button>
                    )}
                  </div>
                ) : (
                  filteredActivity.map((entry, idx) => {
                    const isSuccess = entry.level === 'success';
                    const postUrl = entry.details?.postUrl as string | undefined;
                    const timestamp = new Date(entry.timestamp);
                    const today = new Date();
                    const isToday = timestamp.toDateString() === today.toDateString();
                    
                    return (
                      <div
                        key={idx}
                        className={`flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors ${
                          isSuccess ? '' : 'bg-red-50/50 hover:bg-red-50'
                        }`}
                      >
                        <div className="w-24">
                          <div className="text-sm font-mono font-semibold text-gray-900">
                            {formatTime(entry.timestamp)}
                          </div>
                          {!isToday && (
                            <div className="text-xs text-gray-500 font-medium">
                              {timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                          )}
                        </div>
                        
                        <div className="w-32">
                          <button
                            onClick={() => {
                              setFilterSource(filterSource === entry.details?.source ? '' : entry.details?.source || '');
                              setFilterPlatform('');
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                              filterSource === entry.details?.source
                                ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            }`}
                          >
                            <Upload className="w-3 h-3 inline-block mr-1" />
                            {entry.details?.source}
                          </button>
                        </div>
                        
                        <div className="w-32">
                          <button
                            onClick={() => {
                              setFilterPlatform(filterPlatform === entry.details?.platform ? '' : entry.details?.platform || '');
                              setFilterSource('');
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                              filterPlatform === entry.details?.platform
                                ? 'bg-purple-600 text-white ring-2 ring-purple-300'
                                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                            }`}
                          >
                            <ArrowDownToLine className="w-3 h-3 inline-block mr-1" />
                            {entry.details?.platform}
                          </button>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {entry.details?.title || 'Untitled Content'}
                          </div>
                          {entry.details?.videoId && (
                            <div className="text-xs text-gray-500 font-mono">
                              ID: {entry.details.videoId}
                            </div>
                          )}
                        </div>
                        
                        <div className="w-24 text-right">
                          {isSuccess && postUrl ? (
                            <a
                              href={postUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-bold underline"
                            >
                              View Post →
                            </a>
                          ) : isSuccess ? (
                            <span className="inline-flex items-center gap-1 text-xs text-green-600 font-bold">
                              <CheckCircle className="w-4 h-4" /> Posted
                            </span>
                          ) : (
                            <span 
                              className="inline-flex items-center gap-1 text-xs text-red-600 font-bold cursor-help" 
                              title={entry.details?.error as string}
                            >
                              <XCircle className="w-4 h-4" /> Failed
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Errors Only View */}
        {viewMode === 'errors' && (
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-orange-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Error Log</h2>
                  <p className="text-red-100 text-sm">All failed posting attempts</p>
                </div>
                {errors.length > 0 && (
                  <button
                    onClick={clearAllLogs}
                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  >
                    Clear All Logs
                  </button>
                )}
              </div>
            </div>
            <div className="divide-y divide-gray-100 max-h-[700px] overflow-y-auto">
              {errors.length === 0 ? (
                <div className="p-16 text-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-900 text-xl font-bold mb-2">No Errors! 🎉</p>
                  <p className="text-gray-600">All posting attempts have been successful</p>
                </div>
              ) : (
                errors.map((entry, idx) => {
                  const timestamp = new Date(entry.timestamp);
                  const age = Date.now() - timestamp.getTime();
                  const hoursAgo = Math.floor(age / (1000 * 60 * 60));
                  const isRecent = age < 24 * 60 * 60 * 1000;
                  
                  return (
                    <div key={idx} className="p-6 hover:bg-red-50 transition-colors">
                      <div className="flex items-start gap-4">
                        <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded">
                              {entry.details?.source}
                            </span>
                            <span className="text-gray-400">→</span>
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded">
                              {entry.details?.platform}
                            </span>
                            <span className={`text-xs font-medium ml-auto ${isRecent ? 'text-red-600' : 'text-gray-500'}`}>
                              {hoursAgo < 1 ? 'Just now' : hoursAgo < 24 ? `${hoursAgo}h ago` : timestamp.toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-sm font-medium text-gray-900 mb-1">
                            {entry.details?.title || 'Untitled Content'}
                          </div>
                          <div className="bg-red-50 border border-red-200 rounded p-3 mt-2">
                            <div className="text-xs font-semibold text-red-800 mb-1">ERROR:</div>
                            <div className="text-sm text-red-700 font-mono">
                              {entry.details?.error || entry.message}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
