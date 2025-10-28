import { NextRequest, NextResponse } from 'next/server'
import { requireStaffAuth } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireStaffAuth()
    const { id: alertId } = await context.params

    // In a production app, you'd store dismissed alerts in a database table
    // For now, we'll just return success
    // TODO: Implement persistent alert dismissal storage

    return NextResponse.json({
      message: 'Alert dismissed successfully',
      alert_id: alertId
    })
  } catch (error) {
    console.error('Alert dismiss API error:', error)
    return NextResponse.json(
      { error: 'Failed to dismiss alert' },
      { status: 500 }
    )
  }
}
