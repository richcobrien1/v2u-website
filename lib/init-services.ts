// This file initializes services that need to run when the application starts
import cronService from '@/lib/cron-service'

// Initialize cron service - this ensures the service is instantiated
const _cronService = cronService

export { _cronService }