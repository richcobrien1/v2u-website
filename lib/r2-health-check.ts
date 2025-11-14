// website/lib/r2-health-check.ts
// R2 Connection Health Check - Validates credentials on startup

import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3'

export async function validateR2Credentials(): Promise<{
  valid: boolean
  error?: string
  credentials: {
    hasAccessKey: boolean
    hasSecretKey: boolean
    hasEndpoint: boolean
  }
}> {
  const credentials = {
    hasAccessKey: !!process.env.R2_ACCESS_KEY,
    hasSecretKey: !!process.env.R2_SECRET_KEY,
    hasEndpoint: !!process.env.R2_ENDPOINT,
  }

  if (!credentials.hasAccessKey || !credentials.hasSecretKey || !credentials.hasEndpoint) {
    return {
      valid: false,
      error: 'Missing R2 credentials in environment variables',
      credentials,
    }
  }

  try {
    const r2Client = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY!,
        secretAccessKey: process.env.R2_SECRET_KEY!,
      },
    })

    // Test the connection by listing buckets
    await r2Client.send(new ListBucketsCommand({}))

    return {
      valid: true,
      credentials,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return {
      valid: false,
      error: `R2 connection failed: ${errorMessage}`,
      credentials,
    }
  }
}

// Auto-run validation on module load (server-side only)
if (typeof window === 'undefined') {
  validateR2Credentials().then((result) => {
    if (!result.valid) {
      console.error('❌ R2 CREDENTIAL VALIDATION FAILED:', result.error)
      console.error('   Credentials status:', result.credentials)
      console.error('   ⚠️  The /api/admin/r2/* endpoints will NOT work!')
      console.error('   ⚠️  Run: npm run sync:r2-credentials')
    } else {
      console.log('✅ R2 credentials validated successfully')
    }
  }).catch((err) => {
    console.error('❌ R2 validation check crashed:', err)
  })
}

export default validateR2Credentials
