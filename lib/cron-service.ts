import * as cron from 'node-cron'
import { aiNewsAutomation } from './ai-news-automation'

class CronService {
  private isInitialized = false
  private scheduledJob: cron.ScheduledTask | null = null

  constructor() {
    this.initializeCronJobs()
  }

  private initializeCronJobs() {
    try {
      // Schedule daily AI news automation at 9 AM EST (1 PM UTC)
      // Cron format: "0 14 * * *" = At 14:00 (2 PM UTC) every day
      // Adjust to 9 AM EST = 2 PM UTC
      this.scheduledJob = cron.schedule('0 14 * * *', async () => {
        console.log('Running scheduled AI News automation...')

        try {
          const result = await aiNewsAutomation.runAutomation()

          if (result.success) {
            console.log(`Scheduled automation completed successfully: ${result.details}`)
          } else {
            console.error(`Scheduled automation failed: ${result.errors?.join(', ')}`)
          }
        } catch (error) {
          console.error('Scheduled automation error:', error)
        }
      }, {
        timezone: 'America/New_York' // Run in EST timezone
      })

      this.isInitialized = true
      console.log('Cron service initialized - AI News automation scheduled for daily 9 AM EST')

    } catch (error) {
      console.error('Failed to initialize cron service:', error)
    }
  }

  isRunning(): boolean {
    return this.isInitialized && this.scheduledJob !== null
  }

  // Method to manually trigger the cron job (for testing)
  async runNow(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Cron service not initialized')
    }

    console.log('Manually triggering scheduled automation...')
    await aiNewsAutomation.runAutomation()
  }

  // Stop the cron job
  stop(): void {
    if (this.scheduledJob) {
      this.scheduledJob.stop()
      this.scheduledJob = null
      console.log('Cron service stopped')
    }
  }

  // Get next run time
  getNextRun(): Date | null {
    if (!this.scheduledJob) return null

    // This is a simplified calculation - in production you might want more sophisticated scheduling
    const now = new Date()
    const nextRun = new Date(now)
    nextRun.setHours(14, 0, 0, 0) // 2 PM UTC

    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1)
    }

    return nextRun
  }
}

// Export singleton instance
export const cronService = new CronService()
export default cronService