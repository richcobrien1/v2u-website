'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { Calendar, RefreshCw, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

interface LogEntry {
  timestamp: string;
  type: 'check' | 'post-latest' | 'manual' | 'system';
  level: 'info' | 'success' | 'warn' | 'error';
  message: string;
  details?: Record<string, unknown>;
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
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  async function loadLogs() {
    setLoading(true);
    try {
      const response = await fetch('/api/automation/logs');
      const data = await response.json();
      
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

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warn':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getLevelBg = (level: string) => {
    switch (level) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warn':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

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

        {/* Platform Stats */}
        {summary && Object.keys(summary.platformStats).length > 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Platform Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Object.entries(summary.platformStats)
                .sort((a, b) => b[1].rate - a[1].rate)
                .map(([platform, stats]) => (
                  <div key={platform} className="text-center">
                    <div className="text-gray-300 text-sm capitalize mb-1">{platform}</div>
                    <div className="text-2xl font-bold text-white">{stats.rate}%</div>
                    <div className="text-xs text-gray-400">
                      {stats.success}/{stats.success + stats.failed}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Daily Logs */}
        <div className="space-y-6">
          {logs.map((dailyLog) => (
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

              {/* Log Entries */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {dailyLog.entries.map((entry, idx) => (
                  <div
                    key={idx}
                    className={`border rounded-lg p-3 ${getLevelBg(entry.level)}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{getLevelIcon(entry.level)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-500 font-mono">
                            {formatTime(entry.timestamp)}
                          </span>
                          <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">
                            {entry.type}
                          </span>
                          {entry.details?.platform && (
                            <span className="text-xs bg-purple-200 px-2 py-0.5 rounded">
                              {entry.details.platform as string}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-800 font-medium">{entry.message}</div>
                        {entry.details && Object.keys(entry.details).length > 1 && (
                          <details className="mt-2">
                            <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-800">
                              View details
                            </summary>
                            <pre className="text-xs bg-white/50 p-2 rounded mt-1 overflow-x-auto">
                              {JSON.stringify(entry.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {logs.length === 0 && !loading && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No logs yet</h3>
            <p className="text-gray-300">
              Automation logs will appear here once the cron jobs start running.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
