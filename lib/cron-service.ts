// Note: node-cron is disabled in Edge Runtime (Vercel). Use Vercel Cron or external service instead.
// import * as cron from 'node-cron'
// import { aiNewsAutomation } from './ai-news-automation'

class CronService {
  private isInitialized = false
  // private scheduledJob: cron.ScheduledTask | null = null

  constructor() {
    // Cron scheduling disabled in Edge Runtime
    // Use Vercel Cron Jobs (vercel.json) or external cron service
    this.isInitialized = true
    console.log('Cron service initialized (scheduling disabled in Edge Runtime - use Vercel Cron instead)')
  }

  private initializeCronJobs() {
    // Disabled - use Vercel Cron Jobs or external service
    // try {
    //   this.scheduledJob = cron.schedule('0 14 * * *', async () => {
    //     console.log('Running scheduled AI News automation...')
    //     try {
    //       const result = await aiNewsAutomation.runAutomation()
    //       if (result.success) {
    //         console.log(`Scheduled automation completed successfully: ${result.details}`)
    //       } else {
    //         console.error(`Scheduled automation failed: ${result.errors?.join(', ')}`)
    //       }
    //     } catch (error) {
    //       console.error('Scheduled automation error:', error)
    //     }
    //   }, {
    //     timezone: 'America/New_York'
    //   })
    //   this.isInitialized = true
    //   console.log('Cron service initialized - AI News automation scheduled for daily 9 AM EST')
    // } catch (error) {
    //   console.error('Failed to initialize cron service:', error)
    // }
  }

  isRunning(): boolean {
    return this.isInitialized
  }

  // Method to manually trigger automation (for testing)
  async runNow(): Promise<void> {
    throw new Error('Manual cron trigger disabled in Edge Runtime - call automation API directly')
  }

  // Stop method (no-op in Edge Runtime)
  stop(): void {
    console.log('Cron service stop called (no-op in Edge Runtime)')
  }

  // Get next run time (returns null in Edge Runtime)
  getNextRun(): Date | null {
    return null
  }
}

// Export singleton instance
export const cronService = new CronService()
export default cronService