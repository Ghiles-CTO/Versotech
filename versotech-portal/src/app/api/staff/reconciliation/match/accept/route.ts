import { createClient } from '@/lib/supabase/server'
import { requireStaffAuth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Accept a suggested match
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

    // Get the suggested match
    const { data: match, error: matchError } = await supabase
      .from('suggested_matches')
      .select('*, bank_transactions!inner(*)')
      .eq('id', suggested_match_id)
      .single()

    if (matchError || !match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    const transaction = match.bank_transactions as any
    const txnAmount = transaction.amount

    // Update bank transaction
    const { error: txnError } = await supabase
      .from('bank_transactions')
      .update({
        matched_subscription_id: match.subscription_id,
        match_confidence: match.confidence,
        status: 'matched',
        discrepancy_amount: match.amount_difference,
        updated_at: new Date().toISOString()
      })
      .eq('id', match.bank_transaction_id)

    if (txnError) {
      console.error('Failed to update transaction:', txnError)
      return NextResponse.json({ error: txnError.message }, { status: 500 })
    }

    // Update subscription funded_amount
    const { error: subError } = await supabase.rpc('increment_subscription_funding', {
      p_subscription_id: match.subscription_id,
      p_amount: txnAmount
    })

    if (subError) {
      // Fallback to direct update if RPC doesn't exist
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('funded_amount')
        .eq('id', match.subscription_id)
        .single()

      await supabase
        .from('subscriptions')
        .update({
          funded_amount: (sub?.funded_amount || 0) + txnAmount
        })
        .eq('id', match.subscription_id)
    }

    // Delete the suggested match (it's been accepted)
    await supabase
      .from('suggested_matches')
      .delete()
      .eq('id', suggested_match_id)

    return NextResponse.json({
      success: true,
      message: 'Match accepted and applied'
    })

  } catch (error: any) {
    console.error('Accept match error:', error)
    return NextResponse.json({
      error: error.message || 'Failed to accept match'
    }, { status: 500 })
  }
}
