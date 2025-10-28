import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'

export const dynamic = 'force-dynamic'

/**
 * Cron job to automatically revoke expired data room access
 * Runs daily at 2 AM UTC via Vercel Cron
 */
export async function GET(request: NextRequest) {
  // Verify cron authorization
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET || process.env.VERCEL_CRON_SECRET
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const now = new Date().toISOString()
  
  let revokedCount = 0
  let errorCount = 0
  const errors: string[] = []

  try {
    // Find all expired access records that haven't been revoked
    const { data: expiredAccess, error: queryError } = await supabase
      .from('deal_data_room_access')
      .select(`
        id,
        deal_id,
        investor_id,
        expires_at,
        deals (
          id,
          name
        ),
        investors (
          id,
          legal_name
        )
      `)
      .lt('expires_at', now)
      .is('revoked_at', null)

    if (queryError) {
      console.error('Failed to query expired access:', queryError)
      return NextResponse.json(
        { error: 'Failed to query expired access', details: queryError },
        { status: 500 }
      )
    }

    if (!expiredAccess || expiredAccess.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No expired access records found',
        revokedCount: 0
      })
    }

    // Process each expired access record
    for (const access of expiredAccess) {
      try {
        // Revoke access
        const { error: updateError } = await supabase
          .from('deal_data_room_access')
          .update({
            revoked_at: now,
            revoked_by: null, // System revocation
            notes: (access as any).notes
              ? `${(access as any).notes}\n\nAutomatically revoked due to expiration.`
              : 'Automatically revoked due to expiration.'
          })
          .eq('id', access.id)

        if (updateError) {
          errorCount++
          errors.push(`Failed to revoke access ${access.id}: ${updateError.message}`)
          console.error('Failed to revoke access:', access.id, updateError)
          continue
        }

        // Log audit trail
        await auditLogger.log({
          actor_user_id: undefined,
          action: AuditActions.UPDATE,
          entity: AuditEntities.DEALS,
          entity_id: access.deal_id,
          metadata: {
            type: 'data_room_access_auto_revoked',
            access_id: access.id,
            investor_id: access.investor_id,
            expires_at: access.expires_at,
            revoked_at: now
          }
        })

        // Get primary investor user for notification
        const { data: investorUsers } = await supabase
          .from('investor_users')
          .select('user_id')
          .eq('investor_id', access.investor_id)
          .order('created_at', { ascending: true })
          .limit(1)

        const ownerUserId = investorUsers?.[0]?.user_id

        // Create notification with extension CTA
        if (ownerUserId) {
          await supabase.from('investor_notifications').insert({
            user_id: ownerUserId,
            investor_id: access.investor_id,
            title: 'Data room access expired',
            message: `Your access to the data room for ${(access.deals as any)?.[0]?.name || 'the deal'} has expired. Contact the VERSO team if you need an extension.`,
            link: `/versoholdings/data-rooms`,
            metadata: {
              type: 'data_room_expired',
              deal_id: access.deal_id,
              access_id: access.id,
              can_request_extension: true
            }
          })
        }

        const { data: remainingAccess } = await supabase
          .from('deal_data_room_access')
          .select('id')
          .eq('deal_id', access.deal_id)
          .is('revoked_at', null)
          .limit(1)

        if (!remainingAccess || remainingAccess.length === 0) {
          try {
            await supabase
              .from('deal_data_room_documents')
              .update({
                visible_to_investors: false,
                updated_at: now
              })
              .eq('deal_id', access.deal_id)
              .eq('visible_to_investors', true)
          } catch (visibilityError) {
            console.error('Failed to reset document visibility after access expiry', visibilityError)
          }
        }

        revokedCount++
      } catch (error) {
        errorCount++
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        errors.push(`Failed to process access ${access.id}: ${errorMsg}`)
        console.error('Error processing expired access:', access.id, error)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${expiredAccess.length} expired access records`,
      revokedCount,
      errorCount,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('Unexpected error in expiry cron job:', error)
    return NextResponse.json(
      {
        error: 'Unexpected error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

