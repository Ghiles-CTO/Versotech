import { createClient } from '@/lib/supabase/server'
import { requireStaffAuth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'

export const dynamic = 'force-dynamic'

// Reject a suggested match
export async function POST(req: Request) {
  const profile = await requireStaffAuth()
  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { suggested_match_id } = await req.json()

    if (!suggested_match_id) {
      return NextResponse.json({ error: 'Missing suggested_match_id' }, { status: 400 })
    }

    const supabase = await createClient()

    // First verify the suggestion exists and get details for audit
    const { data: suggestion, error: fetchError } = await supabase
      .from('suggested_matches')
      .select('id, bank_transaction_id, invoice_id')
      .eq('id', suggested_match_id)
      .single()

    if (fetchError || !suggestion) {
      return NextResponse.json({ error: 'Suggestion not found' }, { status: 404 })
    }

    // Delete the suggested match
    const { error } = await supabase
      .from('suggested_matches')
      .delete()
      .eq('id', suggested_match_id)

    if (error) {
      console.error('Failed to reject match:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await auditLogger.log({
      actor_user_id: profile.id,
      action: AuditActions.DELETE,
      entity: AuditEntities.BANK_TRANSACTIONS,
      entity_id: suggestion.bank_transaction_id,
      metadata: {
        action: 'rejected_suggestion',
        suggestion_id: suggested_match_id,
        invoice_id: suggestion.invoice_id
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Suggestion rejected successfully'
    })

  } catch (error: any) {
    console.error('Reject match error:', error)
    return NextResponse.json({
      error: error.message || 'Failed to reject match'
    }, { status: 500 })
  }
}
