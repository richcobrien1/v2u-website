import { NextRequest, NextResponse } from 'next/server'
import { kvStorage } from '@/lib/kv-storage'

interface ScheduleConfig {
  hour: number
  minute: number
  timezone: string
}

// GET - Get current schedule configuration
export async function GET() {
  try {
    // Load from KV storage
    const schedule = await kvStorage.getSchedule()

    if (!schedule) {
      // Return default schedule
      return NextResponse.json({
        hour: 15,
        minute: 30,
        timezone: 'America/Denver'
      })
    }

    return NextResponse.json(schedule)
  } catch (error) {
    console.error('Failed to get schedule:', error)
    return NextResponse.json(
      { error: 'Failed to load schedule' },
      { status: 500 }
    )
  }
}

// PUT - Update schedule configuration
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json() as ScheduleConfig

    // Validate input
    if (
      typeof body.hour !== 'number' ||
      body.hour < 0 ||
      body.hour > 23 ||
      typeof body.minute !== 'number' ||
      body.minute < 0 ||
      body.minute > 59 ||
      !body.timezone
    ) {
      return NextResponse.json(
        { error: 'Invalid schedule format' },
        { status: 400 }
      )
    }

    // Save to KV storage
    await kvStorage.saveSchedule(body)

    console.log('Schedule updated:', body)

    return NextResponse.json({
      success: true,
      schedule: body
    })
  } catch (error) {
    console.error('Failed to update schedule:', error)
    return NextResponse.json(
      { error: 'Failed to save schedule' },
      { status: 500 }
    )
  }
}
