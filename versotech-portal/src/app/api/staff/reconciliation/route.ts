import { createClient } from '@/lib/supabase/server'
import { requireStaffAuth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Get all bank transactions with subscription/investor/vehicle details
export async function GET(req: Request) {
  const profile = await requireStaffAuth()
  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = await createClient()

    // Fetch all bank transactions with related data
    const { data: transactions, error } = await supabase
      .from('bank_transactions')
      .select(`
        *,
        subscriptions:matched_subscription_id (
          id,
          commitment,
          funded_amount,
          currency,
          status,
          investors (
            id,
            legal_name
          ),
          vehicles (
            id,
            name,
            vehicle_type
          )
        ),
        suggested_matches!suggested_matches_bank_transaction_id_fkey (
          id,
          subscription_id,
          confidence,
          match_reason,
          amount_difference,
          subscriptions (
            id,
            commitment,
            funded_amount,
            currency,
            investors (
              id,
              legal_name
            ),
            vehicles (
              id,
              name
            )
          )
        )
      `)
      .order('value_date', { ascending: false })

    if (error) {
      console.error('Failed to fetch transactions:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Calculate summary stats
    const stats = {
      total: transactions.length,
      matched: transactions.filter(t => t.status === 'matched').length,
      unmatched: transactions.filter(t => t.status === 'unmatched').length,
      resolved: transactions.filter(t => t.status === 'resolved').length,
      withDiscrepancies: transactions.filter(t => t.discrepancy_amount && t.discrepancy_amount !== 0).length,
      totalAmount: transactions.reduce((sum, t) => sum + Number(t.amount || 0), 0),
      matchedAmount: transactions.filter(t => t.status === 'matched').reduce((sum, t) => sum + Number(t.amount || 0), 0),
      unmatchedAmount: transactions.filter(t => t.status === 'unmatched').reduce((sum, t) => sum + Number(t.amount || 0), 0),
      suggestedMatchesCount: transactions.reduce((sum, t) => sum + ((t.suggested_matches as any)?.length || 0), 0)
    }

    return NextResponse.json({
      transactions,
      stats
    })

  } catch (error: any) {
    console.error('Reconciliation error:', error)
    return NextResponse.json({
      error: error.message || 'Failed to fetch reconciliation data'
    }, { status: 500 })
  }
}
