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

  // Get all posting activity (source → platform entries only)
  const allPostingActivity = filteredLogs.flatMap(log => 
    log.entries.filter(e => e.details?.source && e.details?.platform)
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-24">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Content Reposting Activity</h1>
          <button
            onClick={loadLogs}
            disabled={loading}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Filters */}
        {(allSources.length > 0 || allPlatforms.length > 0) && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-300">Filter by:</span>
              {(filterSource || filterPlatform) && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-purple-300 hover:text-white"
                >
                  Clear
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
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    filterSource === source
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/20 text-gray-200 hover:bg-white/30'
                  }`}
                >
                  From: {source}
                </button>
              ))}
              {allPlatforms.map(platform => (
                <button
                  key={platform}
                  onClick={() => {
                    setFilterPlatform(filterPlatform === platform ? '' : platform);
                    setFilterSource('');
                  }}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    filterPlatform === platform
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/20 text-gray-200 hover:bg-white/30'
                  }`}
                >
                  To: {platform}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Activity Log - Flat List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <div className="flex items-center gap-4 text-xs font-semibold text-gray-600 uppercase">
              <div className="w-24">Time</div>
              <div className="w-28">Source</div>
              <div className="w-28">Target</div>
              <div className="flex-1">Content</div>
              <div className="w-24 text-right">Status</div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
            {allPostingActivity.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  {loading ? 'Loading...' : 'No reposting activity yet'}
                </p>
              </div>
            ) : (
              allPostingActivity.map((entry, idx) => {
                const isSuccess = entry.level === 'success';
                const postUrl = entry.details?.postUrl as string | undefined;
                const timestamp = new Date(entry.timestamp);
                const today = new Date();
                const isToday = timestamp.toDateString() === today.toDateString();
                
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-4 px-6 py-3 hover:bg-gray-50 transition-colors ${
                      isSuccess ? '' : 'bg-red-50/50'
                    }`}
                  >
                    {/* Timestamp */}
                    <div className="w-24">
                      <div className="text-sm font-mono text-gray-900">
                        {formatTime(entry.timestamp)}
                      </div>
                      {!isToday && (
                        <div className="text-xs text-gray-500">
                          {timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      )}
                    </div>
                    
                    {/* Source */}
                    <div className="w-28">
                      <button
                        onClick={() => {
                          setFilterSource(filterSource === entry.details?.source ? '' : entry.details?.source || '');
                          setFilterPlatform('');
                        }}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          filterSource === entry.details?.source
                            ? 'bg-blue-600 text-white'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                      >
                        {entry.details?.source}
                      </button>
                    </div>
                    
                    {/* Arrow */}
                    <div className="text-gray-400 -mx-2">→</div>
                    
                    {/* Target */}
                    <div className="w-28">
                      <button
                        onClick={() => {
                          setFilterPlatform(filterPlatform === entry.details?.platform ? '' : entry.details?.platform || '');
                          setFilterSource('');
                        }}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          filterPlatform === entry.details?.platform
                            ? 'bg-purple-600 text-white'
                            : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                        }`}
                      >
                        {entry.details?.platform}
                      </button>
                    </div>
                    
                    {/* Content Title */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-900 truncate">
                        {entry.details?.title || 'Untitled'}
                      </div>
                    </div>
                    
                    {/* Status/Link */}
                    <div className="w-24 text-right">
                      {isSuccess && postUrl ? (
                        <a
                          href={postUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium underline"
                        >
                          View
                        </a>
                      ) : isSuccess ? (
                        <span className="text-xs text-green-600 font-medium">✓ Posted</span>
                      ) : (
                        <span 
                          className="text-xs text-red-600 font-medium cursor-help" 
                          title={entry.details?.error as string}
                        >
                          ✗ Failed
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
    </div>
  );
}
