/**
 * Arranger Introducer Commission Detail API
 * GET /api/arrangers/me/introducer-commissions/[id] - Get commission details
 * PATCH /api/arrangers/me/introducer-commissions/[id] - Update commission
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Schema for updating a commission
const updateCommissionSchema = z.object({
  status: z.enum(['accrued', 'invoice_requested', 'invoice_submitted', 'invoiced', 'paid', 'cancelled', 'rejected']).optional(),
  invoice_id: z.string().uuid().optional(),
  payment_reference: z.string().optional(),
  payment_due_date: z.string().optional(),
  notes: z.string().optional(),
})

/**
 * GET /api/arrangers/me/introducer-commissions/[id]
 * Get details of a specific commission
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const serviceSupabase = createServiceClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is an arranger
    const { data: arrangerUser, error: arrangerError } = await serviceSupabase
      .from('arranger_users')
      .select('arranger_id')
      .eq('user_id', user.id)
      .single()

    if (arrangerError || !arrangerUser) {
      return NextResponse.json({ error: 'Not an arranger' }, { status: 403 })
    }

    const arrangerId = arrangerUser.arranger_id

    // Fetch commission with related data
    const { data: commission, error } = await serviceSupabase
      .from('introducer_commissions')
      .select(`
        *,
        introducer:introducers(id, legal_name, email, contact_name),
        deal:deals(id, name, company_name, currency),
        investor:investors(id, legal_name, display_name)
      `)
      .eq('id', id)
      .eq('arranger_id', arrangerId)
      .single()

    if (error || !commission) {
      return NextResponse.json({ error: 'Commission not found' }, { status: 404 })
    }

    // Transform response
    const transformed = {
      ...commission,
      introducer: Array.isArray(commission.introducer) ? commission.introducer[0] : commission.introducer,
      deal: Array.isArray(commission.deal) ? commission.deal[0] : commission.deal,
      investor: Array.isArray(commission.investor) ? commission.investor[0] : commission.investor,
    }

    return NextResponse.json({ data: transformed })
  } catch (error) {
    console.error('[arranger/introducer-commissions/[id]] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/arrangers/me/introducer-commissions/[id]
 * Update a commission (status, notes, etc.)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const serviceSupabase = createServiceClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is an arranger
    const { data: arrangerUser, error: arrangerError } = await serviceSupabase
      .from('arranger_users')
      .select('arranger_id')
      .eq('user_id', user.id)
      .single()

    if (arrangerError || !arrangerUser) {
      return NextResponse.json({ error: 'Not an arranger' }, { status: 403 })
    }

    const arrangerId = arrangerUser.arranger_id

    // Verify commission exists and belongs to this arranger
    const { data: existingCommission, error: fetchError } = await serviceSupabase
      .from('introducer_commissions')
      .select('id, status, arranger_id')
      .eq('id', id)
      .eq('arranger_id', arrangerId)
      .single()

    if (fetchError || !existingCommission) {
      return NextResponse.json({ error: 'Commission not found' }, { status: 404 })
    }

    // Parse and validate body
    const body = await request.json()
    const validation = updateCommissionSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      )
    }

    const data = validation.data

    // Validate status transitions
    if (data.status) {
      const validTransitions: Record<string, string[]> = {
        accrued: ['invoice_requested', 'cancelled'],
        invoice_requested: ['invoice_submitted', 'cancelled'],
        invoice_submitted: ['invoiced', 'rejected'],
        invoiced: ['paid', 'cancelled'],
        rejected: ['invoice_submitted', 'cancelled'],
        paid: [], // Cannot transition from paid
        cancelled: [], // Cannot transition from cancelled
      }

      const currentStatus = existingCommission.status
      const newStatus = data.status

      if (currentStatus !== newStatus && !validTransitions[currentStatus]?.includes(newStatus)) {
        return NextResponse.json(
          { error: `Cannot transition from '${currentStatus}' to '${newStatus}'` },
          { status: 400 }
        )
      }
    }

    // Build update object
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    if (data.status) updateData.status = data.status
    if (data.invoice_id) updateData.invoice_id = data.invoice_id
    if (data.payment_reference !== undefined) updateData.payment_reference = data.payment_reference
    if (data.payment_due_date !== undefined) updateData.payment_due_date = data.payment_due_date
    if (data.notes !== undefined) updateData.notes = data.notes

    // If marking as paid, set paid_at
    if (data.status === 'paid') {
      updateData.paid_at = new Date().toISOString()
    }

    // Update commission
    const { data: updatedCommission, error: updateError } = await serviceSupabase
      .from('introducer_commissions')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        introducer:introducers(id, legal_name, email),
        deal:deals(id, name, currency)
      `)
      .single()

    if (updateError) {
      console.error('[arranger/introducer-commissions/[id]] Error updating:', updateError)
      return NextResponse.json({ error: 'Failed to update commission' }, { status: 500 })
    }

    // When marking as paid, create an introduction record
    let createdIntroductionId: string | null = null
    if (data.status === 'paid') {
      try {
        // Fetch commission details for introduction creation
        const { data: commissionDetails } = await serviceSupabase
          .from('introducer_commissions')
          .select('introducer_id, deal_id, investor_id, fee_plan_id, rate_bps')
          .eq('id', id)
          .single()

        if (commissionDetails) {
          // Get investor email
          const { data: investor } = await serviceSupabase
            .from('investors')
            .select('email')
            .eq('id', commissionDetails.investor_id)
            .single()

          const investorEmail = investor?.email || null

          // Check if introduction already exists - must check BOTH:
          // 1. By (prospect_email, deal_id) - matches unique constraint
          // 2. By (prospect_investor_id, deal_id) - for linked investors
          let existingIntro: { id: string } | null = null

          // First check by email (matches unique constraint)
          if (investorEmail) {
            const { data: byEmail } = await serviceSupabase
              .from('introductions')
              .select('id')
              .eq('prospect_email', investorEmail)
              .eq('deal_id', commissionDetails.deal_id)
              .maybeSingle()
            existingIntro = byEmail
          }

          // If not found by email, check by investor_id
          if (!existingIntro) {
            const { data: byInvestor } = await serviceSupabase
              .from('introductions')
              .select('id')
              .eq('prospect_investor_id', commissionDetails.investor_id)
              .eq('deal_id', commissionDetails.deal_id)
              .maybeSingle()
            existingIntro = byInvestor
          }

          if (!existingIntro) {
            // Create introduction record
            // Note: If investor has no email, we need a placeholder to satisfy the unique constraint
            const emailForInsert = investorEmail || `investor-${commissionDetails.investor_id}@placeholder.local`

            const { data: introduction, error: introError } = await serviceSupabase
              .from('introductions')
              .insert({
                introducer_id: commissionDetails.introducer_id,
                prospect_email: emailForInsert,
                prospect_investor_id: commissionDetails.investor_id,
                deal_id: commissionDetails.deal_id,
                status: 'allocated',
                introduced_at: new Date().toISOString().split('T')[0],
                commission_rate_override_bps: commissionDetails.rate_bps,
                created_by: user.id,
              })
              .select('id')
              .single()

            if (introduction && !introError) {
              createdIntroductionId = introduction.id
              // Link commission to introduction
              await serviceSupabase
                .from('introducer_commissions')
                .update({ introduction_id: introduction.id })
                .eq('id', id)

              console.log(`[arranger/introducer-commissions] Created introduction ${introduction.id} for commission ${id}`)
            } else if (introError) {
              // Check if it's a unique constraint violation - might be a race condition
              if (introError.code === '23505') {
                // Unique constraint violation - try to find and link existing
                const { data: existing } = await serviceSupabase
                  .from('introductions')
                  .select('id')
                  .eq('prospect_email', emailForInsert)
                  .eq('deal_id', commissionDetails.deal_id)
                  .maybeSingle()

                if (existing) {
                  createdIntroductionId = existing.id
                  await serviceSupabase
                    .from('introducer_commissions')
                    .update({ introduction_id: existing.id })
                    .eq('id', id)
                  console.log(`[arranger/introducer-commissions] Linked to existing introduction ${existing.id} after constraint conflict`)
                }
              } else {
                console.error('[arranger/introducer-commissions] Error creating introduction:', introError)
              }
              // Don't fail the payment - introduction is secondary
            }
          } else {
            // Link to existing introduction if not already linked
            createdIntroductionId = existingIntro.id

            // Also update the introduction with investor_id if not set
            await serviceSupabase
              .from('introductions')
              .update({
                prospect_investor_id: commissionDetails.investor_id,
                status: 'allocated' // Ensure status is updated
              })
              .eq('id', existingIntro.id)
              .is('prospect_investor_id', null) // Only if not already set

            await serviceSupabase
              .from('introducer_commissions')
              .update({ introduction_id: existingIntro.id })
              .eq('id', id)

            console.log(`[arranger/introducer-commissions] Linked commission ${id} to existing introduction ${existingIntro.id}`)
          }
        }
      } catch (introErr) {
        console.error('[arranger/introducer-commissions] Error in introduction creation:', introErr)
        // Don't fail the payment marking - introduction is a secondary concern
      }
    }

    // Transform response
    const transformed = {
      ...updatedCommission,
      introducer: Array.isArray(updatedCommission.introducer) ? updatedCommission.introducer[0] : updatedCommission.introducer,
      deal: Array.isArray(updatedCommission.deal) ? updatedCommission.deal[0] : updatedCommission.deal,
      // Include the created introduction_id if payment was processed
      ...(createdIntroductionId && { introduction_id: createdIntroductionId }),
    }

    return NextResponse.json({ data: transformed })
  } catch (error) {
    console.error('[arranger/introducer-commissions/[id]] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
