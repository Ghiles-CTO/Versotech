import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'

export const dynamic = 'force-dynamic'

/**
 * Cron job to automatically cleanup stale signature workflow locks
 *
 * Runs every 5 minutes to detect and release locks that are older than 10 minutes.
 * This prevents workflows from being permanently blocked when a signature process crashes.
 *
 * Vercel Cron Schedule: "* /5 * * * *" (every 5 minutes)
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
  const staleThresholdMinutes = 10
  const staleThreshold = new Date(now.getTime() - staleThresholdMinutes * 60 * 1000).toISOString()

  let cleanedCount = 0
  let errorCount = 0
  const errors: string[] = []

  try {
    // Find all stale locks (locks older than 10 minutes)
    const { data: staleLocks, error: queryError } = await supabase
      .from('workflow_runs')
      .select(`
        id,
        signing_in_progress,
        signing_locked_by,
        signing_locked_at,
        workflow_key
      `)
      .eq('signing_in_progress', true)
      .lt('signing_locked_at', staleThreshold)

    if (queryError) {
      console.error('Failed to query stale locks:', queryError)
      return NextResponse.json(
        { error: 'Failed to query stale locks', details: queryError },
        { status: 500 }
      )
    }

    if (!staleLocks || staleLocks.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No stale locks found',
        cleanedCount: 0
      })
    }

    console.log(`🧹 [CRON] Found ${staleLocks.length} stale signature locks to clean up`)

    // Process each stale lock
    for (const lock of staleLocks) {
      try {
        // Release the lock
        const { error: updateError } = await supabase
          .from('workflow_runs')
          .update({
            signing_in_progress: null,
            signing_locked_by: null,
            signing_locked_at: null
          })
          .eq('id', lock.id)

        if (updateError) {
          errorCount++
          errors.push(`Failed to release lock for workflow ${lock.id}: ${updateError.message}`)
          console.error('Failed to release lock:', lock.id, updateError)
          continue
        }

        // Log audit trail
        await auditLogger.log({
          actor_user_id: undefined,
          action: AuditActions.UPDATE,
          entity: AuditEntities.DOCUMENTS,
          entity_id: lock.id,
          metadata: {
            type: 'stale_signature_lock_cleaned',
            workflow_run_id: lock.id,
            workflow_key: lock.workflow_key,
            signing_locked_by: lock.signing_locked_by,
            signing_locked_at: lock.signing_locked_at,
            lock_age_minutes: Math.round((now.getTime() - new Date(lock.signing_locked_at).getTime()) / (60 * 1000)),
            cleaned_at: now.toISOString()
          }
        })

        console.log(`✅ [CRON] Cleaned stale lock for workflow ${lock.id} (locked ${lock.signing_locked_at})`)
        cleanedCount++
      } catch (error) {
        errorCount++
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        errors.push(`Failed to process lock for workflow ${lock.id}: ${errorMsg}`)
        console.error('Error processing stale lock:', lock.id, error)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${staleLocks.length} stale locks`,
      cleanedCount,
      errorCount,
      staleLocks: staleLocks.map(l => ({
        workflow_id: l.id,
        workflow_key: l.workflow_key,
        locked_at: l.signing_locked_at,
        age_minutes: Math.round((now.getTime() - new Date(l.signing_locked_at).getTime()) / (60 * 1000))
      })),
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('Unexpected error in stale lock cleanup cron job:', error)
    return NextResponse.json(
      {
        error: 'Unexpected error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
