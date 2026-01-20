import { createClient } from '@/lib/supabase/server'
import { requireStaffAuth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
// NOTE: Certificate generation moved to deal-close-handler.ts (triggered at deal close, not on funding)

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
    const { bank_transaction_id, invoice_id, matched_amount, notes } = await req.json()

    if (!bank_transaction_id || !invoice_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createClient()

    const [transactionRes, invoiceRes, existingMatchesRes] = await Promise.all([
      supabase
        .from('bank_transactions')
        .select(`
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
        `)
        .eq('id', bank_transaction_id)
        .single(),
      supabase
        .from('invoices')
        .select(`
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
        `)
        .eq('id', invoice_id)
        .single(),
      supabase
        .from('reconciliation_matches')
        .select('matched_amount')
        .eq('bank_transaction_id', bank_transaction_id)
        .eq('status', 'approved')
    ])

    if (transactionRes.error || !transactionRes.data) {
      return NextResponse.json({ error: 'Bank transaction not found' }, { status: 404 })
    }

    if (invoiceRes.error || !invoiceRes.data) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    if (existingMatchesRes.error) {
      console.error('Manual match: failed to load existing matches', existingMatchesRes.error)
      return NextResponse.json({ error: 'Failed to verify match context' }, { status: 500 })
    }

    const transaction = transactionRes.data
    const invoice = invoiceRes.data
    const existingMatches = existingMatchesRes.data || []

    if ((transaction.currency || 'USD') !== (invoice.currency || 'USD')) {
      return NextResponse.json({ error: 'Currency mismatch between bank transaction and invoice' }, { status: 400 })
    }

    const transactionAmount = toNumber(transaction.amount)
    const totalMatched = existingMatches.reduce((sum, row) => sum + toNumber(row.matched_amount), 0)
    const remainingTransactionAmount = clampCurrency(transactionAmount - totalMatched)

    if (remainingTransactionAmount <= TOLERANCE) {
      return NextResponse.json({ error: 'This bank transaction has no remaining funds to allocate' }, { status: 400 })
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

    let derivedMatchType: 'exact' | 'split' | 'combined' | 'partial' = 'partial'
    if (fullyPaysInvoice && fullyConsumesTransaction) {
      derivedMatchType = 'exact'
    } else if (fullyPaysInvoice) {
      derivedMatchType = 'split'
    } else if (fullyConsumesTransaction) {
      derivedMatchType = 'combined'
    }

    const manualReason = notes?.trim() ? notes.trim() : `Manual match created by ${profile.displayName || 'staff'}`

    const { data: createdMatch, error: insertError } = await supabase
      .from('reconciliation_matches')
      .insert({
        bank_transaction_id,
        invoice_id,
        match_type: 'manual',
        matched_amount: appliedAmount,
        match_confidence: 100,
        match_reason: `${manualReason} (${derivedMatchType})`,
        notes: manualReason,
        status: 'suggested'
      })
      .select()
      .single()

    if (insertError || !createdMatch) {
      console.error('Manual match insert failed', insertError)
      return NextResponse.json({ error: 'Failed to create manual reconciliation match' }, { status: 500 })
    }

    const { error: applyError } = await supabase.rpc('apply_match', {
      p_match_id: createdMatch.id,
      p_approved_by: profile.id
    })

    if (applyError) {
      console.error('apply_match failed for manual match', applyError)
      await supabase.from('reconciliation_matches').delete().eq('id', createdMatch.id)
      return NextResponse.json({ error: 'Failed to apply manual match' }, { status: 500 })
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
        .eq('id', bank_transaction_id)
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
        .eq('id', invoice_id)
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
        .eq('bank_transaction_id', bank_transaction_id)
        .eq('status', 'approved')
    ])

    if (transactionAfterRes.error || invoiceAfterRes.error || approvedMatchesRes.error) {
      console.error('Manual match follow-up fetch failed', {
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

    const desiredInvoiceIds = uniqueIds(approvedMatches.map(match => match.invoice_id))

    if (!transactionAfter || transactionAfter.id !== bank_transaction_id) {
      return NextResponse.json({ error: 'Updated bank transaction not found' }, { status: 500 })
    }

    if (transactionAfter.status !== desiredStatus || !arraysEqual(transactionAfter.matched_invoice_ids, desiredInvoiceIds)) {
      const { data: correctedTransaction, error: fixError } = await supabase
        .from('bank_transactions')
        .update({
          status: desiredStatus,
          matched_invoice_ids: desiredInvoiceIds,
          updated_at: new Date().toISOString()
        })
        .eq('id', bank_transaction_id)
        .select()
        .single()

      if (fixError || !correctedTransaction) {
        console.error('Failed to reconcile manual transaction state', fixError)
        return NextResponse.json({ error: 'Failed to finalize transaction state' }, { status: 500 })
      }

      transactionAfter = correctedTransaction
    }

    await supabase
      .from('suggested_matches')
      .delete()
      .eq('bank_transaction_id', bank_transaction_id)
      .eq('invoice_id', invoice_id)

    if (invoiceAfter?.status === 'paid') {
      // Update fee events to paid status
      await supabase
        .from('fee_events')
        .update({ status: 'paid' })
        .eq('invoice_id', invoice_id)
        .in('status', ['accrued', 'invoiced'])

      // Update subscription funded amount when investment commitment is paid
      // Get fee events for this invoice to find investment commitments
      const { data: feeEvents } = await supabase
        .from('fee_events')
        .select('allocation_id, fee_type, computed_amount')
        .eq('invoice_id', invoice_id)
        .eq('fee_type', 'flat') // 'flat' = investment commitment

      if (feeEvents && feeEvents.length > 0) {
        // Group by subscription (allocation_id)
        const subscriptionPayments = feeEvents.reduce((acc, event) => {
          if (event.allocation_id) {
            acc[event.allocation_id] = (acc[event.allocation_id] || 0) + toNumber(event.computed_amount)
          }
          return acc
        }, {} as Record<string, number>)

        // Update each subscription's funded amount
        for (const [subscriptionId, paidAmount] of Object.entries(subscriptionPayments)) {
          // Get current subscription details
          const { data: subscription } = await supabase
            .from('subscriptions')
            .select('commitment, funded_amount, status, investor_id, vehicle_id, num_shares, units, price_per_share, cost_per_share')
            .eq('id', subscriptionId)
            .single()

          if (subscription) {
            // Validate subscription can receive funding
            const validFundingStatuses = ['pending', 'committed', 'partially_funded', 'funded', 'active']
            if (!validFundingStatuses.includes(subscription.status)) {
              console.warn(`⚠️ Cannot fund subscription ${subscriptionId} with status '${subscription.status}' - skipping`)
              continue // Skip this subscription
            }

            const currentFunded = toNumber(subscription.funded_amount)
            const newFundedAmount = clampCurrency(currentFunded + paidAmount)
            const commitment = toNumber(subscription.commitment)

            // Determine new status based on funded percentage
            let newStatus = subscription.status
            if (commitment > 0) {
              const fundedPercentage = (newFundedAmount / commitment) * 100

              // Update status based on funding level
              // NOTE: Status changes to 'funded' here, NOT 'active'
              // 'active' status + position + certificate are set at DEAL CLOSE (see deal-close-handler.ts)
              if (fundedPercentage >= 99.99) {
                newStatus = 'funded' // Fully funded - awaiting deal close
              } else if (fundedPercentage > 0) {
                newStatus = 'partially_funded'
              }
            }

            // Update subscription
            const { error: subUpdateError } = await supabase
              .from('subscriptions')
              .update({
                funded_amount: newFundedAmount,
                status: newStatus,
                updated_at: new Date().toISOString()
              })
              .eq('id', subscriptionId)

            if (subUpdateError) {
              console.error(`❌ CRITICAL: Failed to update subscription ${subscriptionId} funded amount:`, subUpdateError)
              // This is critical - subscription funding tracking will be incorrect
              throw new Error(`Failed to update subscription funded amount: ${subUpdateError.message}`)
            }

            console.log(`✅ Updated subscription ${subscriptionId}: funded_amount=${newFundedAmount}, status=${newStatus}`)

            // NOTE: Position creation and certificate generation are now handled at DEAL CLOSE
            // See: src/lib/deals/deal-close-handler.ts
            // This ensures certificates/positions are only created after the deal officially closes,
            // not just when funding is received (per Fred's requirements 2024)

            // Audit log for subscription funding update
            await auditLogger.log({
              actor_user_id: profile.id,
              action: AuditActions.UPDATE,
              entity: 'subscriptions' as any,
              entity_id: subscriptionId,
              metadata: {
                invoice_id: invoice_id,
                match_id: createdMatch.id,
                payment_amount: paidAmount,
                previous_funded: currentFunded,
                new_funded: newFundedAmount,
                previous_status: subscription.status,
                new_status: newStatus,
                commitment: commitment,
                manual_match: true
              }
            })
          }
        }
      }
    }

    await auditLogger.log({
      actor_user_id: profile.id,
      action: AuditActions.UPDATE,
      entity: AuditEntities.INVOICES,
      entity_id: invoice_id,
      metadata: {
        match_id: createdMatch.id,
        bank_transaction_id,
        applied_amount: appliedAmount,
        manual: true,
        notes: manualReason
      }
    })

    await auditLogger.log({
      actor_user_id: profile.id,
      action: AuditActions.UPDATE,
      entity: AuditEntities.BANK_TRANSACTIONS,
      entity_id: bank_transaction_id,
      metadata: {
        match_id: createdMatch.id,
        applied_amount: appliedAmount,
        manual: true,
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
    console.error('Manual match error:', error)
    return NextResponse.json({
      error: error?.message || 'Failed to create manual match'
    }, { status: 500 })
  }
}
