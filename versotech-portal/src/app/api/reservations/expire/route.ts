import { createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions } from '@/lib/audit'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import crypto from 'crypto'

// Verify webhook signature from n8n
function verifyWebhookSignature(
  body: string,
  signature: string,
  timestamp: string,
  secret: string
): boolean {
  // Check timestamp to prevent replay attacks
  const now = Math.floor(Date.now() / 1000)
  const requestTime = parseInt(timestamp)
  
  if (Math.abs(now - requestTime) > 300) { // 5 minutes tolerance
    return false
  }

  // Verify HMAC signature
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${body}`)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  )
}

export async function POST(request: Request) {
  try {
    const supabase = createServiceClient()
    
    // Get headers for webhook verification
    const headersList = await headers()
    const signature = headersList.get('x-signature')
    const timestamp = headersList.get('x-timestamp')
    
    // For cron jobs, we might want to use a different authentication method
    // For now, we'll verify the webhook signature if provided
    const webhookSecret = process.env.N8N_INBOUND_SECRET
    
    if (webhookSecret && signature && timestamp) {
      const body = await request.text()
      
      if (!verifyWebhookSignature(body, signature, timestamp, webhookSecret)) {
        return NextResponse.json(
          { error: 'Invalid webhook signature' },
          { status: 401 }
        )
      }
    }

    // Run the expiry function
    const { data: expiredCount, error } = await supabase
      .rpc('fn_expire_reservations')

    if (error) {
      console.error('Reservation expiry error:', error)
      return NextResponse.json(
        { error: 'Failed to expire reservations' },
        { status: 500 }
      )
    }

    // Log the operation (use system user for cron jobs)
    await auditLogger.log({
      actor_user_id: null, // System operation
      action: 'EXPIRE_RESERVATIONS',
      entity: 'reservations',
      entity_id: null,
      metadata: {
        endpoint: '/api/reservations/expire',
        expired_count: expiredCount,
        triggered_by: 'cron_job',
        timestamp: new Date().toISOString()
      }
    })

    return NextResponse.json({
      success: true,
      expiredCount,
      message: `Successfully expired ${expiredCount} reservations`
    })

  } catch (error) {
    console.error('API /reservations/expire POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
