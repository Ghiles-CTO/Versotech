import { createClient } from '@/lib/supabase/server'
import { requireStaffAuth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Create a manual match between a bank transaction and subscription
export async function POST(req: Request) {
  const profile = await requireStaffAuth()
  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { bank_transaction_id, subscription_id } = await req.json()

    if (!bank_transaction_id || !subscription_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get the bank transaction and subscription to calculate discrepancy
    const { data: transaction, error: txnError } = await supabase
      .from('bank_transactions')
      .select('amount, currency')
      .eq('id', bank_transaction_id)
      .single()

    if (txnError || !transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('commitment, funded_amount, currency')
      .eq('id', subscription_id)
      .single()

    if (subError || !subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    const txnAmount = transaction.amount
    const commitment = subscription.commitment
    const amountDifference = txnAmount - commitment

    // Update bank transaction with manual match
    const { error: updateError } = await supabase
      .from('bank_transactions')
      .update({
        matched_subscription_id: subscription_id,
        match_confidence: 100, // Manual match = 100% confidence
        status: 'matched',
        discrepancy_amount: amountDifference !== 0 ? amountDifference : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', bank_transaction_id)

    if (updateError) {
      console.error('Failed to update transaction:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Update subscription funded_amount
    const { error: fundingError } = await supabase.rpc('increment_subscription_funding', {
      p_subscription_id: subscription_id,
      p_amount: txnAmount
    })

    if (fundingError) {
      // Fallback to direct update if RPC doesn't exist
      await supabase
        .from('subscriptions')
        .update({
          funded_amount: (subscription.funded_amount || 0) + txnAmount
        })
        .eq('id', subscription_id)
    }

    // Delete any suggested matches for this transaction
    await supabase
      .from('suggested_matches')
      .delete()
      .eq('bank_transaction_id', bank_transaction_id)

    return NextResponse.json({
      success: true,
      message: 'Manual match created successfully'
    })

  } catch (error: any) {
    console.error('Manual match error:', error)
    return NextResponse.json({
      error: error.message || 'Failed to create manual match'
    }, { status: 500 })
  }
}
