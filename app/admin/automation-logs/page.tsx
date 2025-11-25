'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { Calendar, RefreshCw, CheckCircle, XCircle, AlertCircle, Info, TrendingUp, TrendingDown, Activity, Zap } from 'lucide-react';

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
      }
    } catch (error) {
      console.error('Failed to load logs:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();
  }, []);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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

  const clearFilters = () => {
    setFilterSource('');
    setFilterPlatform('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-24">
        {/* Header with Stats */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Automation Command Center</h1>
              <p className="text-purple-200">Real-time monitoring • Platform health • Activity logs</p>
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
                        <span className="text-green-700">✓ {source.success}</span>
                        <span className="text-red-700">✗ {source.failed}</span>
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
                      📤 {source}
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
                      📥 {platform}
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
                            📤 {entry.details?.source}
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
                            📥 {entry.details?.platform}
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
              <h2 className="text-xl font-bold text-white">Error Log</h2>
              <p className="text-red-100 text-sm">All failed posting attempts</p>
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
