import { NextResponse } from 'next/server';
import { kvStorage } from '@/lib/kv-storage';

export const runtime = 'nodejs';

/**
 * DELETE /api/automation/logs/clear
 * Clear all automation logs (for testing/maintenance)
 */
export async function DELETE() {
  try {
    console.log('🗑️ Clearing all automation logs...');
    
    // Delete logs for the past 14 days (to be thorough)
    const deletedKeys: string[] = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const key = `automation:log:${dateStr}`;
      
      try {
        await kvStorage.delete(key);
        deletedKeys.push(key);
      } catch (error) {
        console.error(`Failed to delete ${key}:`, error);
      }
    }
    
    // Also reset the cleanup marker
    try {
      await kvStorage.delete('automation:log:lastCleanup');
    } catch (error) {
      console.error('Failed to delete lastCleanup marker:', error);
    }
    
    console.log(`✅ Cleared ${deletedKeys.length} log entries`);
    
    return NextResponse.json({
      success: true,
      message: `Cleared ${deletedKeys.length} log days`,
      deletedKeys
    });
    
  } catch (error) {
    console.error('❌ Failed to clear logs:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to clear logs',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
