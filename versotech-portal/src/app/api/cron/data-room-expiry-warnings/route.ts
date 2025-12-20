import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * Cron job to send warning notifications for data room access expiring soon
 * Runs daily to warn investors 3 days before expiration
 */
export async function GET(request: NextRequest) {
  // Verify cron authorization
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET || process.env.VERCEL_CRON_SECRET
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const now = new Date()
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
  
  let warningCount = 0
  let errorCount = 0
  const errors: string[] = []

  try {
    // Find access expiring in the next 3 days that hasn't been revoked
    const { data: expiringAccess, error: queryError } = await supabase
      .from('deal_data_room_access')
      .select(`
        id,
        deal_id,
        investor_id,
        expires_at,
        last_warning_sent_at,
        deals (
          id,
          name
        ),
        investors (
          id,
          legal_name
        )
      `)
      .gte('expires_at', now.toISOString())
      .lte('expires_at', threeDaysFromNow.toISOString())
      .is('revoked_at', null)

    if (queryError) {
      console.error('Failed to query expiring access:', queryError)
      return NextResponse.json(
        { error: 'Failed to query expiring access', details: queryError },
        { status: 500 }
      )
    }

    if (!expiringAccess || expiringAccess.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No expiring access records found',
        warningCount: 0
      })
    }

    // Process each expiring access record
    for (const access of expiringAccess) {
      try {
        // Skip if warning was sent in the last 24 hours to avoid spam
        if (access.last_warning_sent_at) {
          const lastWarning = new Date(access.last_warning_sent_at)
          const hoursSinceLastWarning = (now.getTime() - lastWarning.getTime()) / (1000 * 60 * 60)
          
          if (hoursSinceLastWarning < 24) {
            continue // Skip - warning sent recently
          }
        }

        // Get primary investor user for notification
        const { data: investorUsers } = await supabase
          .from('investor_users')
          .select('user_id')
          .eq('investor_id', access.investor_id)
          .order('created_at', { ascending: true })
          .limit(1)

        const ownerUserId = investorUsers?.[0]?.user_id

        if (!ownerUserId) {
          errorCount++
          errors.push(`No user found for investor ${access.investor_id}`)
          continue
        }

        // Calculate days until expiry
        const expiryDate = new Date(access.expires_at)
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        // Create warning notification
        await supabase.from('investor_notifications').insert({
          user_id: ownerUserId,
          investor_id: access.investor_id,
          title: 'Data room access expiring soon',
          message: `Your access to the data room for ${(access.deals as any)?.name || 'the deal'} expires in ${daysUntilExpiry} ${daysUntilExpiry === 1 ? 'day' : 'days'}. Request an extension if you need more time.`,
          link: `/versoholdings/data-rooms`,
          metadata: {
            type: 'data_room_expiring',
            deal_id: access.deal_id,
            access_id: access.id,
            expires_at: access.expires_at,
            days_until_expiry: daysUntilExpiry,
            can_request_extension: true
          }
        })

        // Update last_warning_sent_at
        await supabase
          .from('deal_data_room_access')
          .update({ last_warning_sent_at: now.toISOString() })
          .eq('id', access.id)

        warningCount++
      } catch (error) {
        errorCount++
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        errors.push(`Failed to process access ${access.id}: ${errorMsg}`)
        console.error('Error processing expiring access:', access.id, error)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${expiringAccess.length} expiring access records`,
      warningCount,
      errorCount,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('Unexpected error in expiry warning cron job:', error)
    return NextResponse.json(
      {
        error: 'Unexpected error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

