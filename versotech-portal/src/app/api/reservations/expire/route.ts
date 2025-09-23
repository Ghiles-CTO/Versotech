import { createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// This endpoint should be called by n8n cron or similar automation
export async function POST(request: NextRequest) {
  try {
    const serviceSupabase = createServiceClient()
    
    // Verify the request is from an authorized source (n8n webhook)
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.CRON_AUTH_TOKEN
    
    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized - invalid cron token' },
        { status: 401 }
      )
    }

    // Call the database function to expire reservations
    const { data: expiredCount, error: expireError } = await serviceSupabase
      .rpc('fn_expire_reservations')

    if (expireError) {
      console.error('Reservation expiry error:', expireError)
      return NextResponse.json(
        { error: expireError.message || 'Failed to expire reservations' },
        { status: 500 }
      )
    }

    // Log the expiry operation
    await auditLogger.log({
      actor_user_id: null, // System operation
      action: AuditActions.UPDATE,
      entity: AuditEntities.RESERVATIONS,
      entity_id: null,
      metadata: {
        operation: 'expire_reservations_cron',
        expired_count: expiredCount,
        timestamp: new Date().toISOString()
      }
    })

    return NextResponse.json({
      success: true,
      expired_count: expiredCount,
      message: `Successfully expired ${expiredCount} reservations and restored inventory`
    })

  } catch (error) {
    console.error('Reservation expiry API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to check expiry status (for monitoring)
export async function GET(request: NextRequest) {
  try {
    const serviceSupabase = createServiceClient()
    
    // Get count of pending reservations that should expire soon
    const { data: expiringReservations, error } = await serviceSupabase
      .from('reservations')
      .select('id, expires_at, deal_id, investor_id')
      .eq('status', 'pending')
      .lt('expires_at', new Date(Date.now() + 5 * 60 * 1000).toISOString()) // Expiring in next 5 minutes
      .order('expires_at', { ascending: true })

    if (error) {
      console.error('Error checking expiring reservations:', error)
      return NextResponse.json(
        { error: 'Failed to check expiring reservations' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      expiring_soon: expiringReservations?.length || 0,
      reservations: expiringReservations || []
    })

  } catch (error) {
    console.error('Reservation expiry check API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}