import { createClient } from '@/lib/supabase/server'
import { requireStaffAuth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { auditLogger, AuditActions } from '@/lib/audit'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const resolveSchema = z.object({
  status: z.enum(['ignored', 'discrepancy']),
  discrepancy_type: z.enum(['amount_mismatch', 'date_mismatch', 'duplicate', 'unconfirmed', 'other']).optional(),
  notes: z.string().optional()
})

/**
 * POST /api/staff/reconciliation/verifications/[id]/resolve
 *
 * Manually resolve a verification (mark as ignored or discrepancy)
 * This is for cases where staff needs to mark a verification as non-applicable
 * or flag it as a known discrepancy
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const profile = await requireStaffAuth()
  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()

    const validation = resolveSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validation.error.issues
      }, { status: 400 })
    }

    const { status, discrepancy_type, notes } = validation.data

    const supabase = await createClient()

    // Fetch the verification to ensure it exists
    const { data: verification, error: fetchError } = await supabase
      .from('reconciliation_verifications')
      .select('id, status, bank_transaction_id, subscription_id, invoice_id, deal_id')
      .eq('id', id)
      .single()

    if (fetchError || !verification) {
      return NextResponse.json({ error: 'Verification not found' }, { status: 404 })
    }

    // Don't allow re-resolving already verified records
    if (verification.status === 'verified') {
      return NextResponse.json({
        error: 'Cannot modify a verified record. It was already confirmed by a lawyer.'
      }, { status: 400 })
    }

    // Update the verification
    const { data: updated, error: updateError } = await supabase
      .from('reconciliation_verifications')
      .update({
        status,
        discrepancy_type: status === 'discrepancy' ? (discrepancy_type || 'other') : null,
        discrepancy_notes: notes || null,
        verified_by: profile.id,
        verified_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Failed to resolve verification:', updateError)
      return NextResponse.json({ error: 'Failed to resolve verification' }, { status: 500 })
    }

    // Audit log
    await auditLogger.log({
      actor_user_id: profile.id,
      action: AuditActions.UPDATE,
      entity: 'reconciliation_verifications' as any,
      entity_id: id,
      metadata: {
        action: 'manual_resolve',
        new_status: status,
        discrepancy_type,
        notes,
        bank_transaction_id: verification.bank_transaction_id,
        subscription_id: verification.subscription_id,
        invoice_id: verification.invoice_id
      }
    })

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Verification marked as ${status}`
    })
  } catch (error: any) {
    console.error('Resolve verification error:', error)
    return NextResponse.json({
      error: error?.message || 'Failed to resolve verification'
    }, { status: 500 })
  }
}
