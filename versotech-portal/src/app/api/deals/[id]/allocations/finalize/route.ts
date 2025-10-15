import { NextRequest, NextResponse } from 'next/server'

/**
 * DEPRECATED: Reservation-based allocation finalization
 * 
 * This endpoint has been replaced by the new interest -> subscription workflow.
 * Reservations are no longer part of the deal flow.
 * 
 * See:
 * - /api/deals/[id]/interests for interest submissions
 * - /api/deals/[id]/subscriptions for subscription submissions
 * - /api/automation/nda-complete for NDA completion
 * - /api/automation/subscription-complete for subscription completion
 */

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return NextResponse.json(
    {
      error: 'Endpoint deprecated',
      message: 'Reservation-based allocations have been replaced by the interest and subscription workflow',
      see: {
        interests: '/api/deals/[id]/interests',
        subscriptions: '/api/deals/[id]/subscriptions'
      }
    },
    { status: 410 } // 410 Gone
  )
}
