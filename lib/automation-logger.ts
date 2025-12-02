/**
 * Automation Logger
 * Tracks all automation executions with 7-day rotating logs
 */

import { kvStorage } from './kv-storage';

export interface LogEntry {
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

export interface DailyLog {
  date: string; // YYYY-MM-DD
  entries: LogEntry[];
  summary: {
    totalExecutions: number;
    successfulPosts: number;
    failedPosts: number;
    platformBreakdown: Record<string, { success: number; failed: number }>;
  };
}

/**
 * Add a log entry to today's log
 */
export async function addLogEntry(entry: Omit<LogEntry, 'timestamp'>): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const logKey = `automation:log:${today}`;
    
    // Get today's log
    const existingLog = await kvStorage.get<DailyLog>(logKey);
    
    const logEntry: LogEntry = {
      ...entry,
      timestamp: new Date().toISOString()
    };
    
    const updatedLog: DailyLog = existingLog || {
      date: today,
      entries: [],
      summary: {
        totalExecutions: 0,
        successfulPosts: 0,
        failedPosts: 0,
        platformBreakdown: {}
      }
    };
    
    updatedLog.entries.push(logEntry);
    
    // Limit entries to last 100 to prevent KV size limit issues
    if (updatedLog.entries.length > 100) {
      updatedLog.entries = updatedLog.entries.slice(-100);
    }
    
    // Update summary
    if (entry.type === 'check' || entry.type === 'post-latest') {
      updatedLog.summary.totalExecutions++;
    }
    
    if (entry.level === 'success' && entry.details?.platform) {
      updatedLog.summary.successfulPosts++;
      const platform = entry.details.platform;
      if (!updatedLog.summary.platformBreakdown[platform]) {
        updatedLog.summary.platformBreakdown[platform] = { success: 0, failed: 0 };
      }
      updatedLog.summary.platformBreakdown[platform].success++;
    }
    
    if (entry.level === 'error' && entry.details?.platform) {
      updatedLog.summary.failedPosts++;
      const platform = entry.details.platform;
      if (!updatedLog.summary.platformBreakdown[platform]) {
        updatedLog.summary.platformBreakdown[platform] = { success: 0, failed: 0 };
      }
      updatedLog.summary.platformBreakdown[platform].failed++;
    }
    
    // Save updated log
    await kvStorage.set(logKey, updatedLog);
    
    // Only run cleanup once per day (check if we need to run it)
    await cleanupOldLogsIfNeeded();
    
  } catch (error) {
    console.error('Failed to add log entry:', error);
  }
}

/**
 * Get logs for a specific date
 */
export async function getLogForDate(date: string): Promise<DailyLog | null> {
  try {
    const logKey = `automation:log:${date}`;
    return await kvStorage.get<DailyLog>(logKey);
  } catch (error) {
    console.error('Failed to get log:', error);
    return null;
  }
}

/**
 * Get logs for the last N days
 */
export async function getRecentLogs(days: number = 7): Promise<DailyLog[]> {
  try {
    const logs: DailyLog[] = [];
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const log = await getLogForDate(dateStr);
      if (log) {
        logs.push(log);
      }
    }
    
    return logs;
  } catch (error) {
    console.error('Failed to get recent logs:', error);
    return [];
  }
}

/**
 * Clean up logs older than 7 days
 * Only runs once per day at first log entry of the day
 */
async function cleanupOldLogsIfNeeded(): Promise<void> {
  try {
    const lastCleanupKey = 'automation:log:lastCleanup';
    const lastCleanup = await kvStorage.get<string>(lastCleanupKey);
    const today = new Date().toISOString().split('T')[0];
    
    // Only run cleanup once per day
    if (lastCleanup === today) {
      return;
    }
    
    // Delete exactly one log from 8 days ago (the one that just aged out)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 8);
    const oldKey = `automation:log:${cutoffDate.toISOString().split('T')[0]}`;
    
    try {
      await kvStorage.delete(oldKey);
      console.log(`Deleted old log: ${oldKey}`);
    } catch {
      // Key might not exist - that's fine
    }
    
    // Mark cleanup as done for today
    await kvStorage.set(lastCleanupKey, today);
    
  } catch (error) {
    console.error('Failed to cleanup old logs:', error);
  }
}

/**
 * Get summary of all logs
 */
export async function getLogsSummary(): Promise<{
  totalDays: number;
  totalExecutions: number;
  successRate: number;
  mostRecentExecution: string | null;
  platformStats: Record<string, { success: number; failed: number; rate: number }>;
}> {
  try {
    const logs = await getRecentLogs(7);
    
    let totalExecutions = 0;
    let successfulPosts = 0;
    let failedPosts = 0;
    let mostRecent: string | null = null;
    const platformStats: Record<string, { success: number; failed: number; rate: number }> = {};
    
    for (const log of logs) {
      totalExecutions += log.summary.totalExecutions;
      successfulPosts += log.summary.successfulPosts;
      failedPosts += log.summary.failedPosts;
      
      // Find most recent execution
      if (log.entries.length > 0) {
        const lastEntry = log.entries[log.entries.length - 1];
        if (!mostRecent || lastEntry.timestamp > mostRecent) {
          mostRecent = lastEntry.timestamp;
        }
      }
      
      // Aggregate platform stats
      for (const [platform, stats] of Object.entries(log.summary.platformBreakdown)) {
        if (!platformStats[platform]) {
          platformStats[platform] = { success: 0, failed: 0, rate: 0 };
        }
        platformStats[platform].success += stats.success;
        platformStats[platform].failed += stats.failed;
      }
    }
    
    // Calculate success rates
    for (const platform in platformStats) {
      const total = platformStats[platform].success + platformStats[platform].failed;
      platformStats[platform].rate = total > 0 
        ? Math.round((platformStats[platform].success / total) * 100) 
        : 0;
    }
    
    const totalPosts = successfulPosts + failedPosts;
    const successRate = totalPosts > 0 ? Math.round((successfulPosts / totalPosts) * 100) : 0;
    
    return {
      totalDays: logs.length,
      totalExecutions,
      successRate,
      mostRecentExecution: mostRecent,
      platformStats
    };
  } catch (error) {
    console.error('Failed to get logs summary:', error);
    return {
      totalDays: 0,
      totalExecutions: 0,
      successRate: 0,
      mostRecentExecution: null,
      platformStats: {}
    };
  }
}
