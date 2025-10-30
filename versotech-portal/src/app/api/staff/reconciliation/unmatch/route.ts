import { createClient } from '@/lib/supabase/server'
import { requireStaffAuth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Unmatch a bank transaction from its subscription
export async function POST(req: Request) {
  const profile = await requireStaffAuth()
  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { bank_transaction_id } = await req.json()

    if (!bank_transaction_id) {
      return NextResponse.json({ error: 'Missing bank_transaction_id' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get current transaction to reverse funded_amount
    const { data: transaction, error: txnError } = await supabase
      .from('bank_transactions')
      .select('matched_subscription_id, amount')
      .eq('id', bank_transaction_id)
      .single()

    if (txnError || !transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    if (!transaction.matched_subscription_id) {
      return NextResponse.json({ error: 'Transaction is not matched' }, { status: 400 })
    }

    const subscriptionId = transaction.matched_subscription_id
    const txnAmount = transaction.amount

    // Update transaction to unmatched status
    const { error: updateError } = await supabase
      .from('bank_transactions')
      .update({
        matched_subscription_id: null,
        match_confidence: null,
        status: 'unmatched',
        discrepancy_amount: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', bank_transaction_id)

    if (updateError) {
      console.error('Failed to unmatch transaction:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Reverse the funded_amount on subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('funded_amount')
      .eq('id', subscriptionId)
      .single()

    if (subscription) {
      await supabase
        .from('subscriptions')
        .update({
          funded_amount: Math.max(0, (subscription.funded_amount || 0) - txnAmount)
        })
        .eq('id', subscriptionId)
    }

    return NextResponse.json({
      success: true,
      message: 'Transaction unmatched successfully'
    })

  } catch (error: any) {
    console.error('Unmatch error:', error)
    return NextResponse.json({
      error: error.message || 'Failed to unmatch transaction'
    }, { status: 500 })
  }
}
