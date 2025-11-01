import { createClient } from '@/lib/supabase/server'
import { requireStaffAuth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'

export const dynamic = 'force-dynamic'

type NumericLike = number | string | null | undefined

const TOLERANCE = 0.01

const toNumber = (value: NumericLike): number => {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return value
  const parsed = parseFloat(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

const nearlyEqual = (a: number, b: number, tolerance: number = TOLERANCE) => Math.abs(a - b) <= tolerance

const clampCurrency = (value: number) => Math.round(value * 100) / 100

const uniqueIds = (ids: (string | null | undefined)[]) => Array.from(new Set(ids.filter((id): id is string => !!id)))

const arraysEqual = (a: string[] | null | undefined, b: string[]) => {
  const arrA = (a ?? []).slice().sort()
  const arrB = b.slice().sort()
  if (arrA.length !== arrB.length) return false
  return arrA.every((value, index) => value === arrB[index])
}

export async function POST(req: Request) {
  const profile = await requireStaffAuth()
  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { suggested_match_id, matched_amount } = await req.json()

    if (!suggested_match_id) {
      return NextResponse.json({ error: 'Missing suggested_match_id' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: suggestedMatch, error: matchError } = await supabase
      .from('suggested_matches')
      .select(`
        id,
        bank_transaction_id,
        invoice_id,
        confidence,
        match_reason,
        amount_difference,
        created_at,
        bank_transactions!inner (
          id,
          amount,
          currency,
          status,
          matched_invoice_ids,
          match_confidence,
          match_notes,
          value_date,
          counterparty,
          memo
        ),
        invoices!inner (
          id,
          invoice_number,
          total,
          paid_amount,
          balance_due,
          currency,
          status,
          match_status,
          paid_at,
          investor:investor_id (
            id,
            legal_name
          ),
          deal:deal_id (
            id,
            name
          )
        )
      `)
      .eq('id', suggested_match_id)
      .single()

    if (matchError || !suggestedMatch) {
      return NextResponse.json({ error: 'Suggested match not found' }, { status: 404 })
    }

    const transaction = suggestedMatch.bank_transactions as any
    const invoice = suggestedMatch.invoices as any

    if (!transaction || !invoice) {
      return NextResponse.json({ error: 'Related invoice or transaction missing' }, { status: 404 })
    }

    if ((transaction.currency || 'USD') !== (invoice.currency || 'USD')) {
      return NextResponse.json({
        error: 'Currency mismatch between bank transaction and invoice'
      }, { status: 400 })
    }

    const [{ data: existingMatches, error: matchesError }] = await Promise.all([
      supabase
        .from('reconciliation_matches')
        .select('matched_amount')
        .eq('bank_transaction_id', transaction.id)
        .eq('status', 'approved')
    ])

    if (matchesError) {
      console.error('Failed to load existing matches', matchesError)
      return NextResponse.json({ error: 'Failed to verify match context' }, { status: 500 })
    }

    const totalMatched = (existingMatches || []).reduce((sum, row) => sum + toNumber(row.matched_amount), 0)
    const transactionAmount = toNumber(transaction.amount)
    const remainingTransactionAmount = clampCurrency(transactionAmount - totalMatched)

    if (remainingTransactionAmount <= TOLERANCE) {
      return NextResponse.json({ error: 'This bank transaction has already been fully allocated' }, { status: 400 })
    }

    const invoiceTotal = toNumber(invoice.total)
    const invoicePaid = toNumber(invoice.paid_amount)
    const invoiceBalance = invoice.balance_due !== undefined && invoice.balance_due !== null
      ? toNumber(invoice.balance_due)
      : clampCurrency(Math.max(invoiceTotal - invoicePaid, 0))

    if (invoiceBalance <= TOLERANCE) {
      return NextResponse.json({ error: 'Invoice is already fully paid' }, { status: 400 })
    }

    const requestedAmount = matched_amount !== undefined ? clampCurrency(toNumber(matched_amount)) : null
    let appliedAmount = Math.min(invoiceBalance, remainingTransactionAmount)
    if (requestedAmount !== null && requestedAmount > 0) {
      appliedAmount = Math.min(appliedAmount, requestedAmount)
    }

    appliedAmount = clampCurrency(appliedAmount)

    if (appliedAmount <= 0 || appliedAmount <= TOLERANCE) {
      return NextResponse.json({ error: 'Match amount must be greater than zero' }, { status: 400 })
    }

    const newTotalMatched = clampCurrency(totalMatched + appliedAmount)
    const fullyPaysInvoice = nearlyEqual(appliedAmount, invoiceBalance)
    const fullyConsumesTransaction = nearlyEqual(newTotalMatched, transactionAmount)

    let matchType: 'exact' | 'split' | 'combined' | 'partial' = 'partial'
    if (fullyPaysInvoice && fullyConsumesTransaction) {
      matchType = 'exact'
    } else if (fullyPaysInvoice) {
      matchType = 'split'
    } else if (fullyConsumesTransaction) {
      matchType = 'combined'
    }

    const matchReason = suggestedMatch.match_reason || `${matchType === 'exact' ? 'Exact' : 'Partial'} match from reconciliation engine`

    const { data: createdMatch, error: insertError } = await supabase
      .from('reconciliation_matches')
      .insert({
        bank_transaction_id: transaction.id,
        invoice_id: invoice.id,
        match_type: matchType,
        matched_amount: appliedAmount,
        match_confidence: suggestedMatch.confidence ?? null,
        match_reason: matchReason,
        status: 'suggested'
      })
      .select()
      .single()

    if (insertError || !createdMatch) {
      console.error('Failed to create reconciliation match', insertError)
      return NextResponse.json({ error: 'Failed to create reconciliation match' }, { status: 500 })
    }

    const { error: applyError } = await supabase.rpc('apply_match', {
      p_match_id: createdMatch.id,
      p_approved_by: profile.id
    })

    if (applyError) {
      console.error('apply_match failed', applyError)
      await supabase.from('reconciliation_matches').delete().eq('id', createdMatch.id)
      return NextResponse.json({ error: 'Failed to apply reconciliation match' }, { status: 500 })
    }

    const [transactionAfterRes, invoiceAfterRes, approvedMatchesRes] = await Promise.all([
      supabase
        .from('bank_transactions')
        .select(`
          id,
          amount,
          currency,
          status,
          match_confidence,
          match_notes,
          matched_invoice_ids,
          value_date,
          counterparty,
          memo,
          updated_at
        `)
        .eq('id', transaction.id)
        .single(),
      supabase
        .from('invoices')
        .select(`
          id,
          invoice_number,
          total,
          paid_amount,
          balance_due,
          status,
          match_status,
          currency,
          paid_at,
          investor:investor_id (
            id,
            legal_name
          ),
          deal:deal_id (
            id,
            name
          )
        `)
        .eq('id', invoice.id)
        .single(),
      supabase
        .from('reconciliation_matches')
        .select(`
          id,
          bank_transaction_id,
          invoice_id,
          matched_amount,
          match_type,
          match_reason,
          match_confidence,
          status,
          approved_at,
          invoices:invoice_id (
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
        `)
        .eq('bank_transaction_id', transaction.id)
        .eq('status', 'approved')
    ])

    if (transactionAfterRes.error || invoiceAfterRes.error || approvedMatchesRes.error) {
      console.error('Post-apply fetch failed', {
        transactionError: transactionAfterRes.error,
        invoiceError: invoiceAfterRes.error,
        matchesError: approvedMatchesRes.error
      })
      return NextResponse.json({ error: 'Failed to load updated reconciliation data' }, { status: 500 })
    }

    let transactionAfter = transactionAfterRes.data
    const invoiceAfter = invoiceAfterRes.data
    const approvedMatches = approvedMatchesRes.data ?? []

    const updatedTotalMatched = approvedMatches.reduce((sum, row) => sum + toNumber(row.matched_amount), 0)
    const desiredStatus = updatedTotalMatched <= TOLERANCE
      ? 'unmatched'
      : nearlyEqual(updatedTotalMatched, transactionAmount)
      ? 'matched'
      : 'partially_matched'

    const desiredInvoiceIds = uniqueIds([...(approvedMatches.map(match => match.invoice_id)), invoice.id])

    if (!transactionAfter || transactionAfter.id !== transaction.id) {
      return NextResponse.json({ error: 'Updated transaction not found' }, { status: 500 })
    }

    if (transactionAfter.status !== desiredStatus || !arraysEqual(transactionAfter.matched_invoice_ids, desiredInvoiceIds)) {
      const { data: correctedTransaction, error: fixError } = await supabase
        .from('bank_transactions')
        .update({
          status: desiredStatus,
          matched_invoice_ids: desiredInvoiceIds,
          updated_at: new Date().toISOString()
        })
        .eq('id', transaction.id)
        .select()
        .single()

      if (fixError || !correctedTransaction) {
        console.error('Failed to reconcile bank transaction state', fixError)
        return NextResponse.json({ error: 'Failed to finalize bank transaction state' }, { status: 500 })
      }

      transactionAfter = correctedTransaction
    }

    await supabase
      .from('suggested_matches')
      .delete()
      .eq('id', suggested_match_id)

    if (invoiceAfter?.status === 'paid') {
      await supabase
        .from('fee_events')
        .update({ status: 'paid' })
        .eq('invoice_id', invoice.id)
        .in('status', ['accrued', 'invoiced'])
    }

    await auditLogger.log({
      actor_user_id: profile.id,
      action: AuditActions.UPDATE,
      entity: AuditEntities.INVOICES,
      entity_id: invoice.id,
      metadata: {
        match_id: createdMatch.id,
        bank_transaction_id: transaction.id,
        applied_amount: appliedAmount,
        previous_paid_amount: invoicePaid,
        new_paid_amount: invoiceAfter?.paid_amount
      }
    })

    await auditLogger.log({
      actor_user_id: profile.id,
      action: AuditActions.UPDATE,
      entity: AuditEntities.BANK_TRANSACTIONS,
      entity_id: transaction.id,
      metadata: {
        match_id: createdMatch.id,
        applied_amount: appliedAmount,
        status: transactionAfter.status,
        matched_invoice_ids: transactionAfter.matched_invoice_ids
      }
    })

    return NextResponse.json({
      success: true,
      match_id: createdMatch.id,
      applied_amount: appliedAmount,
      bank_transaction: transactionAfter,
      invoice: invoiceAfter,
      matches: approvedMatches,
      total_matched_amount: updatedTotalMatched
    })
  } catch (error: any) {
    console.error('Accept match error:', error)
    return NextResponse.json({
      error: error?.message || 'Failed to accept match'
    }, { status: 500 })
  }
}
