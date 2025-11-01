import { createClient } from '@/lib/supabase/server'
import { requireStaffAuth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

type NumericLike = number | string | null | undefined

const toNumber = (value: NumericLike): number => {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return value
  const parsed = parseFloat(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

export async function GET(req: Request) {
  const profile = await requireStaffAuth()
  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = await createClient()

    const { data: transactions, error } = await supabase
      .from('bank_transactions')
      .select(`
        id,
        account_ref,
        amount,
        currency,
        value_date,
        memo,
        counterparty,
        bank_reference,
        status,
        matched_invoice_ids,
        match_confidence,
        match_notes,
        match_group_id,
        import_batch_id,
        created_at,
        updated_at,
        matches:reconciliation_matches_bank_transaction_id_fkey (
          id,
          invoice_id,
          match_type,
          matched_amount,
          match_confidence,
          match_reason,
          status,
          approved_at,
          approved_by,
          invoices (
            id,
            invoice_number,
            total,
            paid_amount,
            balance_due,
            status,
            match_status,
            currency,
            investor:investor_id (
              id,
              legal_name
            ),
            deal:deal_id (
              id,
              name
            )
          )
        ),
        suggestions:suggested_matches!suggested_matches_bank_transaction_id_fkey (
          id,
          invoice_id,
          confidence,
          match_reason,
          amount_difference,
          created_at,
          invoices (
            id,
            invoice_number,
            total,
            paid_amount,
            balance_due,
            status,
            match_status,
            currency,
            investor:investor_id (
              id,
              legal_name
            ),
            deal:deal_id (
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

    const transactionsWithDerived = (transactions || []).map(tx => {
      const matches = (tx.matches as any[]) || []
      const matchedAmount = matches.reduce((sum, match) => sum + toNumber(match.matched_amount), 0)
      const remaining = Math.max(toNumber(tx.amount) - matchedAmount, 0)
      return {
        ...tx,
        matched_amount_total: matchedAmount,
        remaining_amount: remaining,
      }
    })

    const matchedCount = transactionsWithDerived.filter(t => t.status === 'matched').length
    const partiallyMatchedCount = transactionsWithDerived.filter(t => t.status === 'partially_matched').length
    const unmatchedCount = transactionsWithDerived.filter(t => t.status === 'unmatched').length
    const totalAmount = transactionsWithDerived.reduce((sum, t) => sum + toNumber(t.amount), 0)
    const matchedAmountTotal = transactionsWithDerived.reduce((sum, t) => sum + toNumber(t.matched_amount_total), 0)
    const unmatchedAmountTotal = transactionsWithDerived
      .filter(t => t.status === 'unmatched')
      .reduce((sum, t) => sum + toNumber(t.amount), 0)

    const stats = {
      total: transactionsWithDerived.length,
      matched: matchedCount,
      partiallyMatched: partiallyMatchedCount,
      partially_matched: partiallyMatchedCount,
      unmatched: unmatchedCount,
      totalAmount,
      matchedAmount: matchedAmountTotal,
      unmatchedAmount: unmatchedAmountTotal,
      suggestedMatchesCount: transactionsWithDerived.reduce((sum, t) => sum + (((t.suggestions as any[]) || []).length), 0),
      resolved: 0,
      withDiscrepancies: 0
    }

    return NextResponse.json({
      transactions: transactionsWithDerived,
      stats
    })
  } catch (error: any) {
    console.error('Reconciliation error:', error)
    return NextResponse.json({
      error: error.message || 'Failed to fetch reconciliation data'
    }, { status: 500 })
  }
}
