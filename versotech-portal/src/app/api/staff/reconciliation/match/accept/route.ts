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

    // Delete the suggestion - CRITICAL to prevent duplicate accepts
    const { error: deleteError } = await supabase
      .from('suggested_matches')
      .delete()
      .eq('id', suggested_match_id)

    if (deleteError) {
      return NextResponse.json({
        error: 'Match created but failed to remove suggestion. Please refresh the page.',
        deleteError: deleteError.message
      }, { status: 500 })
    }

    if (invoiceAfter?.status === 'paid') {
      // Update fee events to paid status
      await supabase
        .from('fee_events')
        .update({ status: 'paid' })
        .eq('invoice_id', invoice.id)
        .in('status', ['accrued', 'invoiced'])

      // Update subscription funded amount when investment commitment is paid
      // Get fee events for this invoice to find investment commitments
      const { data: feeEvents } = await supabase
        .from('fee_events')
        .select('allocation_id, fee_type, computed_amount')
        .eq('invoice_id', invoice.id)
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
            .select('commitment, funded_amount, status')
            .eq('id', subscriptionId)
            .single()

          if (subscription) {
            // Validate subscription can receive funding
            const validFundingStatuses = ['pending', 'committed', 'partially_funded', 'active']
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
              if (fundedPercentage >= 99.99) {
                newStatus = 'active' // Fully funded
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

            // AUTO-CREATE POSITION when subscription becomes active
            if (newStatus === 'active' && subscription.status !== 'active') {
              // Fetch full subscription details to get all fields needed for position
              const { data: fullSubscription } = await supabase
                .from('subscriptions')
                .select('investor_id, vehicle_id, num_shares, units, price_per_share, cost_per_share')
                .eq('id', subscriptionId)
                .single()

              if (fullSubscription) {
                // Calculate units: prefer num_shares, fallback to units, or calculate from funded_amount / price
                let positionUnits = fullSubscription.num_shares || fullSubscription.units
                if (!positionUnits && fullSubscription.price_per_share) {
                  positionUnits = newFundedAmount / toNumber(fullSubscription.price_per_share)
                } else if (!positionUnits && fullSubscription.cost_per_share) {
                  positionUnits = newFundedAmount / toNumber(fullSubscription.cost_per_share)
                }

                // Get initial NAV (use price_per_share or cost_per_share as initial valuation)
                const initialNav = fullSubscription.price_per_share || fullSubscription.cost_per_share

                if (positionUnits && positionUnits > 0) {
                  // NOTE: For maximum safety, database should have unique constraint on (investor_id, vehicle_id)
                  // Migration: ALTER TABLE positions ADD CONSTRAINT positions_investor_vehicle_unique UNIQUE (investor_id, vehicle_id);

                  // Try to create position with race condition protection
                  const { data: newPosition, error: positionError } = await supabase
                    .from('positions')
                    .insert({
                      investor_id: fullSubscription.investor_id,
                      vehicle_id: fullSubscription.vehicle_id,
                      units: positionUnits,
                      cost_basis: newFundedAmount,
                      last_nav: initialNav,
                      as_of_date: new Date().toISOString()
                    })
                    .select('id')
                    .single()

                  if (positionError) {
                    // Check if error is due to unique constraint violation (position already exists)
                    if (positionError.code === '23505') {
                      console.log(`ℹ️ Position already exists for subscription ${subscriptionId} (investor: ${fullSubscription.investor_id}, vehicle: ${fullSubscription.vehicle_id})`)
                      // This is OK - another process created it first (race condition handled gracefully)
                    } else {
                      console.error(`❌ Failed to create position for subscription ${subscriptionId}:`, positionError)
                      // Log but don't fail the whole transaction - subscription funding is more critical
                    }
                  } else if (newPosition) {
                      console.log(`✅ Created position for subscription ${subscriptionId}: ${positionUnits} units @ $${initialNav}/unit`)

                      // Audit log for position creation
                      await auditLogger.log({
                        actor_user_id: profile.id,
                        action: AuditActions.CREATE,
                        entity: 'positions' as any,
                        entity_id: subscriptionId, // Link to subscription
                        metadata: {
                          subscription_id: subscriptionId,
                          investor_id: fullSubscription.investor_id,
                          vehicle_id: fullSubscription.vehicle_id,
                          units: positionUnits,
                          cost_basis: newFundedAmount,
                          initial_nav: initialNav,
                          triggered_by: 'subscription_funding'
                        }
                      })
                    }
                } else {
                  console.warn(`⚠️ Could not determine units for subscription ${subscriptionId} - position not created`)
                }
              }
            }

            // Audit log for subscription funding update
            await auditLogger.log({
              actor_user_id: profile.id,
              action: AuditActions.UPDATE,
              entity: 'subscriptions' as any,
              entity_id: subscriptionId,
              metadata: {
                invoice_id: invoice.id,
                match_id: createdMatch.id,
                payment_amount: paidAmount,
                previous_funded: currentFunded,
                new_funded: newFundedAmount,
                previous_status: subscription.status,
                new_status: newStatus,
                commitment: commitment
              }
            })
          }
        }
      }
    } else if (invoiceAfter?.status === 'partially_paid') {
      // Handle partial payment - update subscription funded amount proportionally
      const { data: feeEvents } = await supabase
        .from('fee_events')
        .select('allocation_id, fee_type, computed_amount')
        .eq('invoice_id', invoice.id)
        .eq('fee_type', 'flat') // Investment commitment

      if (feeEvents && feeEvents.length > 0) {
        // Calculate what percentage of the invoice was paid
        const invoiceTotal = toNumber(invoiceAfter.total)
        const invoicePaid = toNumber(invoiceAfter.paid_amount)
        const paidPercentage = invoiceTotal > 0 ? invoicePaid / invoiceTotal : 0

        // Apply proportional payment to each subscription
        const subscriptionPayments = feeEvents.reduce((acc, event) => {
          if (event.allocation_id) {
            const proportionalPayment = toNumber(event.computed_amount) * paidPercentage
            acc[event.allocation_id] = (acc[event.allocation_id] || 0) + proportionalPayment
          }
          return acc
        }, {} as Record<string, number>)

        for (const [subscriptionId, paidAmount] of Object.entries(subscriptionPayments)) {
          // Get current subscription
          const { data: subscription } = await supabase
            .from('subscriptions')
            .select('commitment, funded_amount')
            .eq('id', subscriptionId)
            .single()

          if (subscription) {
            const currentFunded = toNumber(subscription.funded_amount)
            const newFundedAmount = clampCurrency(Math.min(currentFunded + paidAmount, toNumber(subscription.commitment)))

            // Update subscription with partial funding
            const { error: subUpdateError } = await supabase
              .from('subscriptions')
              .update({
                funded_amount: newFundedAmount,
                status: 'partially_funded',
                updated_at: new Date().toISOString()
              })
              .eq('id', subscriptionId)

            if (subUpdateError) {
              console.error(`❌ CRITICAL: Failed to update partially funded subscription ${subscriptionId}:`, subUpdateError)
              // Critical - funding tracking will be incorrect
              throw new Error(`Failed to update subscription partial funding: ${subUpdateError.message}`)
            }

            console.log(`✅ Partially funded subscription ${subscriptionId}: funded_amount=${newFundedAmount}`)
          }
        }
      }
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
