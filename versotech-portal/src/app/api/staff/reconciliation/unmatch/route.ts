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

async function recalcTransactionState(supabase: any, bankTransactionId: string) {
  const [{ data: transaction }, { data: approvedMatches }] = await Promise.all([
    supabase
      .from('bank_transactions')
      .select('id, amount, currency, match_confidence, match_notes, matched_invoice_ids')
      .eq('id', bankTransactionId)
      .single(),
    supabase
      .from('reconciliation_matches')
      .select('invoice_id, matched_amount')
      .eq('bank_transaction_id', bankTransactionId)
      .eq('status', 'approved')
  ])

  if (!transaction) {
    throw new Error('Bank transaction not found for recalculation')
  }

  const approved = approvedMatches || []
  const totalMatched = approved.reduce((sum: number, match: any) => sum + toNumber(match.matched_amount), 0)
  const transactionAmount = toNumber(transaction.amount)

  const desiredStatus = totalMatched <= TOLERANCE
    ? 'unmatched'
    : Math.abs(totalMatched - transactionAmount) <= TOLERANCE
    ? 'matched'
    : 'partially_matched'

  const invoiceIds = Array.from(new Set(approved.map((match: any) => match.invoice_id)))

  const updatePayload: Record<string, any> = {
    status: desiredStatus,
    matched_invoice_ids: invoiceIds,
    updated_at: new Date().toISOString()
  }

  if (desiredStatus === 'unmatched') {
    updatePayload.match_confidence = null
    updatePayload.match_notes = null
  }

  const { error: updateError, data: updatedTransaction } = await supabase
    .from('bank_transactions')
    .update(updatePayload)
    .eq('id', bankTransactionId)
    .select()
    .single()

  if (updateError) {
    throw updateError
  }

  return updatedTransaction
}

async function revertInvoicePayment(
  supabase: any,
  invoiceId: string,
  amount: number
) {
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('id, total, paid_amount, status, match_status, paid_at')
    .eq('id', invoiceId)
    .single()

  if (invoiceError || !invoice) {
    throw new Error('Invoice not found while reversing match')
  }

  const currentPaid = toNumber(invoice.paid_amount)
  const total = toNumber(invoice.total)
  const newPaid = Math.max(currentPaid - amount, 0)

  let newStatus = invoice.status
  if (newPaid <= TOLERANCE) {
    newStatus = 'sent'
  } else if (newPaid >= total - TOLERANCE) {
    newStatus = 'paid'
  } else {
    newStatus = 'partially_paid'
  }

  const newMatchStatus = newPaid <= TOLERANCE
    ? 'unmatched'
    : newPaid >= total - TOLERANCE
    ? 'matched'
    : 'partially_matched'

  const { error: updateError, data: updatedInvoice } = await supabase
    .from('invoices')
    .update({
      paid_amount: newPaid,
      status: newStatus,
      match_status: newMatchStatus,
      paid_at: newStatus === 'paid' ? invoice.paid_at : null
    })
    .eq('id', invoiceId)
    .select()
    .single()

  if (updateError) {
    throw updateError
  }

  if (newStatus !== 'paid') {
    await supabase
      .from('fee_events')
      .update({ status: 'invoiced' })
      .eq('invoice_id', invoiceId)
      .eq('status', 'paid')
  }

  return updatedInvoice
}

// Unmatch a bank transaction from its invoices
export async function POST(req: Request) {
  const profile = await requireStaffAuth()
  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { bank_transaction_id, match_id } = await req.json()

    if (!bank_transaction_id) {
      return NextResponse.json({ error: 'Missing bank_transaction_id' }, { status: 400 })
    }

    const supabase = await createClient()

    if (match_id) {
      const { data: matchRecord, error: matchError } = await supabase
        .from('reconciliation_matches')
        .select('id, bank_transaction_id, invoice_id, matched_amount, status, match_reason, notes, invoices ( id, total, paid_amount, status, match_status, paid_at )')
        .eq('id', match_id)
        .single()

      if (matchError || !matchRecord) {
        return NextResponse.json({ error: 'Match not found' }, { status: 404 })
      }

      if (matchRecord.bank_transaction_id !== bank_transaction_id) {
        return NextResponse.json({ error: 'Match does not belong to the specified transaction' }, { status: 400 })
      }

      if (matchRecord.status !== 'approved') {
        return NextResponse.json({ error: 'Only approved matches can be reversed' }, { status: 400 })
      }

      const matchedAmount = toNumber(matchRecord.matched_amount)

      const timestamp = new Date().toISOString()
      const { error: reverseError } = await supabase
        .from('reconciliation_matches')
        .update({
          status: 'reversed',
          match_reason: `${matchRecord.match_reason || 'Match'} • reversed ${timestamp}`,
          notes: `${matchRecord.notes ? matchRecord.notes + ' | ' : ''}Reversed on ${timestamp}`
        })
        .eq('id', match_id)

      if (reverseError) {
        console.error('Failed to mark match reversed', reverseError)
        return NextResponse.json({ error: 'Failed to reverse match' }, { status: 500 })
      }

      const updatedInvoice = await revertInvoicePayment(supabase, matchRecord.invoice_id, matchedAmount)
      const updatedTransaction = await recalcTransactionState(supabase, bank_transaction_id)

      await auditLogger.log({
        actor_user_id: profile.id,
        action: AuditActions.UPDATE,
        entity: AuditEntities.INVOICES,
        entity_id: matchRecord.invoice_id,
        metadata: {
          reversed_match_id: match_id,
          amount: matchedAmount,
          new_paid_amount: updatedInvoice?.paid_amount
        }
      })

      await auditLogger.log({
        actor_user_id: profile.id,
        action: AuditActions.UPDATE,
        entity: AuditEntities.BANK_TRANSACTIONS,
        entity_id: bank_transaction_id,
        metadata: {
          reversed_match_id: match_id,
          amount: matchedAmount,
          status: updatedTransaction?.status,
          matched_invoice_ids: updatedTransaction?.matched_invoice_ids
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Match reversed successfully',
        invoice: updatedInvoice,
        bank_transaction: updatedTransaction
      })
    }

    const { data: matches, error: matchesError } = await supabase
      .from('reconciliation_matches')
      .select('id, invoice_id, matched_amount, status, match_reason, notes')
      .eq('bank_transaction_id', bank_transaction_id)
      .eq('status', 'approved')

    if (matchesError) {
      console.error('Failed to fetch matches for transaction', matchesError)
      return NextResponse.json({ error: 'Failed to load matches for transaction' }, { status: 500 })
    }

    const approvedMatches = matches || []

    if (approvedMatches.length === 0) {
      return NextResponse.json({ success: true, message: 'No approved matches to reverse' })
    }

    for (const match of approvedMatches) {
      const matchedAmount = toNumber(match.matched_amount)

      const timestamp = new Date().toISOString()
      const { error: reverseError } = await supabase
        .from('reconciliation_matches')
        .update({
          status: 'reversed',
          match_reason: `${match.match_reason || 'Match'} • reversed ${timestamp}`,
          notes: `${match.notes ? match.notes + ' | ' : ''}Reversed on ${timestamp}`
        })
        .eq('id', match.id)

      if (reverseError) {
        console.error('Failed to reverse match', reverseError)
        return NextResponse.json({ error: 'Failed to reverse matches' }, { status: 500 })
      }

      await revertInvoicePayment(supabase, match.invoice_id, matchedAmount)
    }

    const updatedTransaction = await recalcTransactionState(supabase, bank_transaction_id)

    await auditLogger.log({
      actor_user_id: profile.id,
      action: AuditActions.UPDATE,
      entity: AuditEntities.BANK_TRANSACTIONS,
      entity_id: bank_transaction_id,
      metadata: {
        reversed_matches: approvedMatches.length,
        status: updatedTransaction?.status
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Transaction unmatched successfully',
      bank_transaction: updatedTransaction
    })
  } catch (error: any) {
    console.error('Unmatch error:', error)
    return NextResponse.json({
      error: error?.message || 'Failed to unmatch transaction'
    }, { status: 500 })
  }
}
