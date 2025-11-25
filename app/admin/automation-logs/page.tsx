'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { Calendar, RefreshCw, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

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

export default function AutomationLogsPage() {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [summary, setSummary] = useState<LogsSummary | null>(null);
  const [loading, setLoading] = useState(true);
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

  // Filter logs based on selected source or platform
  const getFilteredLogs = () => {
    if (!filterSource && !filterPlatform) return logs;
    
    return logs.map(dailyLog => ({
      ...dailyLog,
      entries: dailyLog.entries.filter(entry => {
        if (filterSource && entry.details?.source !== filterSource) return false;
        if (filterPlatform && entry.details?.platform !== filterPlatform) return false;
        return true;
      })
    })).filter(dailyLog => dailyLog.entries.length > 0);
  };

  const filteredLogs = getFilteredLogs();

  // Get unique sources and platforms from all logs
  const allSources = Array.from(new Set(
    logs.flatMap(log => log.entries
      .map(e => e.details?.source)
      .filter(Boolean) as string[])
  )).sort();

  const allPlatforms = Array.from(new Set(
    logs.flatMap(log => log.entries
      .map(e => e.details?.platform)
      .filter(Boolean) as string[])
  )).sort();

  const clearFilters = () => {
    setFilterSource('');
    setFilterPlatform('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-24">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Automation Logs</h1>
            <p className="text-gray-300">7-day rotating execution history</p>
          </div>
          <button
            onClick={loadLogs}
            disabled={loading}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <div className="text-gray-300 text-sm mb-1">Total Executions</div>
              <div className="text-3xl font-bold text-white">{summary.totalExecutions}</div>
              <div className="text-xs text-gray-400 mt-1">{summary.totalDays} days</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <div className="text-gray-300 text-sm mb-1">Success Rate</div>
              <div className="text-3xl font-bold text-green-400">{summary.successRate}%</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <div className="text-gray-300 text-sm mb-1">Last Execution</div>
              <div className="text-sm font-semibold text-white">
                {summary.mostRecentExecution 
                  ? formatTime(summary.mostRecentExecution)
                  : 'Never'}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {summary.mostRecentExecution 
                  ? formatDate(summary.mostRecentExecution)
                  : ''}
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <div className="text-gray-300 text-sm mb-1">Top Platform</div>
              <div className="text-sm font-semibold text-white">
                {Object.entries(summary.platformStats)
                  .sort((a, b) => b[1].success - a[1].success)[0]?.[0] || 'None'}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {Object.entries(summary.platformStats)
                  .sort((a, b) => b[1].success - a[1].success)[0]?.[1].success || 0} posts
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Filters</h2>
            {(filterSource || filterPlatform) && (
              <button
                onClick={clearFilters}
                className="text-sm text-purple-300 hover:text-white"
              >
                Clear filters
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Level 1 Sources (where content comes FROM) */}
            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-3">
                📤 Level 1 Sources
                <span className="text-xs text-gray-400 ml-2">(Content Origin)</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {allSources.map(source => (
                  <button
                    key={source}
                    onClick={() => {
                      setFilterSource(filterSource === source ? '' : source);
                      setFilterPlatform('');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      filterSource === source
                        ? 'bg-blue-500 text-white'
                        : 'bg-white/20 text-gray-200 hover:bg-white/30'
                    }`}
                  >
                    {source}
                  </button>
                ))}
              </div>
            </div>

            {/* Level 2 Targets (where content goes TO) */}
            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-3">
                📥 Level 2 Targets
                <span className="text-xs text-gray-400 ml-2">(Repost Destination)</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {allPlatforms.map(platform => (
                  <button
                    key={platform}
                    onClick={() => {
                      setFilterPlatform(filterPlatform === platform ? '' : platform);
                      setFilterSource('');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      filterPlatform === platform
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/20 text-gray-200 hover:bg-white/30'
                    }`}
                  >
                    {platform}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active Filter Display */}
          {(filterSource || filterPlatform) && (
            <div className="mt-4 p-3 bg-white/10 rounded-lg">
              <div className="text-sm text-gray-300">
                {filterSource && (
                  <div>
                    <strong className="text-white">Showing:</strong> Content from{' '}
                    <span className="text-blue-400 font-semibold">{filterSource}</span> reposted to all platforms
                  </div>
                )}
                {filterPlatform && (
                  <div>
                    <strong className="text-white">Showing:</strong> Content reposted to{' '}
                    <span className="text-purple-400 font-semibold">{filterPlatform}</span> from all sources
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Platform Stats */}
        {summary && Object.keys(summary.platformStats).length > 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Platform Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Object.entries(summary.platformStats)
                .sort((a, b) => b[1].rate - a[1].rate)
                .map(([platform, stats]) => (
                  <button
                    key={platform}
                    onClick={() => {
                      setFilterPlatform(filterPlatform === platform ? '' : platform);
                      setFilterSource('');
                    }}
                    className={`text-center p-3 rounded-lg transition-colors ${
                      filterPlatform === platform
                        ? 'bg-purple-500/30 ring-2 ring-purple-400'
                        : 'hover:bg-white/10'
                    }`}
                  >
                    <div className="text-gray-300 text-sm capitalize mb-1">{platform}</div>
                    <div className="text-2xl font-bold text-white">{stats.rate}%</div>
                    <div className="text-xs text-gray-400">
                      {stats.success}/{stats.success + stats.failed}
                    </div>
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Daily Logs */}
        <div className="space-y-6">
          {filteredLogs.map((dailyLog) => (
            <div key={dailyLog.date} className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-purple-400" />
                  <h3 className="text-xl font-bold text-white">{formatDate(dailyLog.date)}</h3>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-300">
                    {dailyLog.summary.totalExecutions} executions
                  </span>
                  <span className="text-green-400">
                    ✓ {dailyLog.summary.successfulPosts}
                  </span>
                  <span className="text-red-400">
                    ✗ {dailyLog.summary.failedPosts}
                  </span>
                </div>
              </div>

              {/* Log Entries - Simple A → B Format */}
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {dailyLog.entries
                  .filter(entry => entry.details?.source && entry.details?.platform)
                  .map((entry, idx) => {
                    const isSuccess = entry.level === 'success';
                    const postUrl = entry.details?.postUrl as string | undefined;
                    
                    return (
                      <div
                        key={idx}
                        className={`flex items-center gap-3 px-3 py-2 rounded ${
                          isSuccess ? 'bg-green-50/50 hover:bg-green-50' : 'bg-red-50/50 hover:bg-red-50'
                        }`}
                      >
                        {/* Timestamp */}
                        <span className="text-xs text-gray-500 font-mono w-20 flex-shrink-0">
                          {formatTime(entry.timestamp)}
                        </span>
                        
                        {/* Source → Target */}
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <button
                            onClick={() => {
                              setFilterSource(filterSource === entry.details?.source ? '' : entry.details?.source || '');
                              setFilterPlatform('');
                            }}
                            className={`text-xs px-2 py-1 rounded font-medium transition-colors ${
                              filterSource === entry.details?.source
                                ? 'bg-blue-500 text-white'
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            }`}
                          >
                            {entry.details?.source}
                          </button>
                          
                          <span className="text-gray-400">→</span>
                          
                          <button
                            onClick={() => {
                              setFilterPlatform(filterPlatform === entry.details?.platform ? '' : entry.details?.platform || '');
                              setFilterSource('');
                            }}
                            className={`text-xs px-2 py-1 rounded font-medium transition-colors ${
                              filterPlatform === entry.details?.platform
                                ? 'bg-purple-500 text-white'
                                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                            }`}
                          >
                            {entry.details?.platform}
                          </button>
                          
                          {/* Content Title (truncated) */}
                          {entry.details?.title && (
                            <span className="text-xs text-gray-600 truncate max-w-md">
                              &ldquo;{entry.details.title}&rdquo;
                            </span>
                          )}
                        </div>
                        
                        {/* Result: Link or Error */}
                        <div className="flex-shrink-0">
                          {isSuccess && postUrl ? (
                            <a
                              href={postUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-800 underline"
                            >
                              View Post
                            </a>
                          ) : isSuccess ? (
                            <span className="text-xs text-green-600">✓ Posted</span>
                          ) : (
                            <span className="text-xs text-red-600" title={entry.details?.error as string}>
                              ✗ {entry.details?.error ? 'Error' : 'Failed'}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>

        {filteredLogs.length === 0 && !loading && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {logs.length === 0 ? 'No logs yet' : 'No matching logs'}
            </h3>
            <p className="text-gray-300">
              {logs.length === 0 
                ? 'Automation logs will appear here once the cron jobs start running.'
                : 'Try adjusting your filters to see more results.'}
            </p>
            {(filterSource || filterPlatform) && (
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
