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

/**
 * Recalculate bank transaction state based on remaining approved matches
 */
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

/**
 * Unmatch a bank transaction from its invoices
 *
 * VERIFICATION-ONLY MODE:
 * This route now only:
 * 1. Marks reconciliation_matches as 'reversed'
 * 2. Deletes associated reconciliation_verifications records
 * 3. Updates bank_transaction status
 *
 * It does NOT revert invoice/subscription statuses because those are now
 * only changed by lawyer escrow confirmation.
 */
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

    // Handle single match reversal
    if (match_id) {
      const { data: matchRecord, error: matchError } = await supabase
        .from('reconciliation_matches')
        .select('id, bank_transaction_id, invoice_id, matched_amount, status, match_reason, notes')
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

      // Mark the reconciliation match as reversed
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

      // Delete associated verification record(s)
      const { error: deleteVerificationError } = await supabase
        .from('reconciliation_verifications')
        .delete()
        .eq('bank_transaction_id', bank_transaction_id)
        .eq('invoice_id', matchRecord.invoice_id)

      if (deleteVerificationError) {
        console.warn('Failed to delete verification record:', deleteVerificationError)
        // Non-critical - continue
      }

      // Recalculate bank transaction state
      const updatedTransaction = await recalcTransactionState(supabase, bank_transaction_id)

      // NOTE: We no longer revert invoice payments or subscription statuses
      // Those are only changed by lawyer escrow confirmation, not by reconciliation

      await auditLogger.log({
        actor_user_id: profile.id,
        action: AuditActions.UPDATE,
        entity: AuditEntities.BANK_TRANSACTIONS,
        entity_id: bank_transaction_id,
        metadata: {
          reversed_match_id: match_id,
          amount: matchedAmount,
          status: updatedTransaction?.status,
          matched_invoice_ids: updatedTransaction?.matched_invoice_ids,
          verification_mode: true
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Match reversed successfully',
        bank_transaction: updatedTransaction
      })
    }

    // Handle full transaction unmatch (all matches)
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

    const invoiceIds: string[] = []

    // Reverse all approved matches
    for (const match of approvedMatches) {
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

      if (match.invoice_id) {
        invoiceIds.push(match.invoice_id)
      }
    }

    // Delete all verification records for this bank transaction
    const { error: deleteVerificationsError } = await supabase
      .from('reconciliation_verifications')
      .delete()
      .eq('bank_transaction_id', bank_transaction_id)

    if (deleteVerificationsError) {
      console.warn('Failed to delete verification records:', deleteVerificationsError)
      // Non-critical - continue
    }

    // Recalculate bank transaction state
    const updatedTransaction = await recalcTransactionState(supabase, bank_transaction_id)

    await auditLogger.log({
      actor_user_id: profile.id,
      action: AuditActions.UPDATE,
      entity: AuditEntities.BANK_TRANSACTIONS,
      entity_id: bank_transaction_id,
      metadata: {
        reversed_matches: approvedMatches.length,
        invoice_ids: invoiceIds,
        status: updatedTransaction?.status,
        verification_mode: true
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
