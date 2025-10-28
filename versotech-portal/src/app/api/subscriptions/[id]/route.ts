import { createClient } from '@/lib/supabase/server'
import { requireStaffAuth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireStaffAuth()
    const { id } = await params
    const supabase = await createClient()

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select(
        `
          *,
          investor:investors (
            id,
            legal_name,
            display_name,
            type,
            country,
            email,
            phone,
            kyc_status,
            status,
            aml_risk_rating,
            is_pep,
            primary_rm,
            primary_rm_profile:profiles!investors_primary_rm_fkey (
              id,
              display_name,
              email
            )
          ),
          vehicle:vehicles (
            id,
            name,
            entity_code,
            type,
            currency,
            status,
            domicile,
            formation_date
          )
        `
      )
      .eq('id', id)
      .single()

    if (error || !subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    // Fetch capital activity (cashflows)
    const { data: cashflows } = await supabase
      .from('cashflows')
      .select('*')
      .eq('investor_id', subscription.investor_id)
      .eq('vehicle_id', subscription.vehicle_id)
      .order('date', { ascending: false })

    // Fetch capital calls related to this vehicle
    const { data: capitalCalls } = await supabase
      .from('capital_calls')
      .select('*')
      .eq('vehicle_id', subscription.vehicle_id)
      .order('due_date', { ascending: false })

    // Fetch distributions related to this vehicle
    const { data: distributions } = await supabase
      .from('distributions')
      .select('*')
      .eq('vehicle_id', subscription.vehicle_id)
      .order('date', { ascending: false })

    // Calculate metrics
    const contributions = cashflows?.filter((cf) => cf.type === 'contribution') || []
    const distributionsFlow = cashflows?.filter((cf) => cf.type === 'distribution') || []

    const total_contributed = contributions.reduce((sum, cf) => sum + Number(cf.amount), 0)
    const total_distributed = distributionsFlow.reduce((sum, cf) => sum + Number(cf.amount), 0)
    const unfunded_commitment = Number(subscription.commitment) - total_contributed
    const current_nav = total_contributed - total_distributed

    const metrics = {
      total_commitment: Number(subscription.commitment),
      total_contributed,
      total_distributed,
      unfunded_commitment,
      current_nav,
      total_calls: capitalCalls?.length || 0,
      pending_calls: capitalCalls?.filter((cc) => cc.status === 'pending')?.length || 0,
    }

    return NextResponse.json({
      subscription,
      cashflows: cashflows || [],
      capitalCalls: capitalCalls || [],
      distributions: distributions || [],
      metrics,
    })
  } catch (error) {
    console.error('[Subscription Detail API] Exception:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireStaffAuth()
    const { id } = await params
    const supabase = await createClient()

    const body = await request.json()

    // Build updates object from all allowed fields
    const updates: any = {}

    // Core fields
    if (body.status !== undefined) updates.status = body.status
    if (body.commitment !== undefined) updates.commitment = body.commitment
    if (body.currency !== undefined) updates.currency = body.currency

    // Date fields
    if (body.effective_date !== undefined) updates.effective_date = body.effective_date
    if (body.funding_due_at !== undefined) updates.funding_due_at = body.funding_due_at
    if (body.committed_at !== undefined) updates.committed_at = body.committed_at
    if (body.contract_date !== undefined) updates.contract_date = body.contract_date

    // Share/Unit fields
    if (body.price_per_share !== undefined) updates.price_per_share = body.price_per_share
    if (body.cost_per_share !== undefined) updates.cost_per_share = body.cost_per_share
    if (body.num_shares !== undefined) updates.num_shares = body.num_shares
    if (body.units !== undefined) updates.units = body.units
    if (body.spread_per_share !== undefined) updates.spread_per_share = body.spread_per_share

    // Fee fields
    if (body.spread_fee_amount !== undefined) updates.spread_fee_amount = body.spread_fee_amount
    if (body.subscription_fee_percent !== undefined) updates.subscription_fee_percent = body.subscription_fee_percent
    if (body.subscription_fee_amount !== undefined) updates.subscription_fee_amount = body.subscription_fee_amount
    if (body.bd_fee_percent !== undefined) updates.bd_fee_percent = body.bd_fee_percent
    if (body.bd_fee_amount !== undefined) updates.bd_fee_amount = body.bd_fee_amount
    if (body.finra_fee_amount !== undefined) updates.finra_fee_amount = body.finra_fee_amount
    if (body.performance_fee_tier1_percent !== undefined) updates.performance_fee_tier1_percent = body.performance_fee_tier1_percent
    if (body.performance_fee_tier1_threshold !== undefined) updates.performance_fee_tier1_threshold = body.performance_fee_tier1_threshold
    if (body.performance_fee_tier2_percent !== undefined) updates.performance_fee_tier2_percent = body.performance_fee_tier2_percent
    if (body.performance_fee_tier2_threshold !== undefined) updates.performance_fee_tier2_threshold = body.performance_fee_tier2_threshold

    // Financial tracking fields
    if (body.funded_amount !== undefined) updates.funded_amount = body.funded_amount
    if (body.outstanding_amount !== undefined) updates.outstanding_amount = body.outstanding_amount
    if (body.capital_calls_total !== undefined) updates.capital_calls_total = body.capital_calls_total
    if (body.distributions_total !== undefined) updates.distributions_total = body.distributions_total
    if (body.current_nav !== undefined) updates.current_nav = body.current_nav

    // Business context fields
    if (body.signed_doc_id !== undefined) updates.signed_doc_id = body.signed_doc_id
    if (body.acknowledgement_notes !== undefined) updates.acknowledgement_notes = body.acknowledgement_notes
    if (body.opportunity_name !== undefined) updates.opportunity_name = body.opportunity_name
    if (body.sourcing_contract_ref !== undefined) updates.sourcing_contract_ref = body.sourcing_contract_ref
    if (body.introducer_id !== undefined) updates.introducer_id = body.introducer_id
    if (body.introduction_id !== undefined) updates.introduction_id = body.introduction_id

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[Subscription Update API] Error:', error)
      return NextResponse.json(
        { error: 'Failed to update subscription', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      subscription: data,
    })
  } catch (error) {
    console.error('[Subscription Update API] Exception:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireStaffAuth()
    const { id } = await params
    const supabase = await createClient()

    // Soft delete by setting status to cancelled
    const { error } = await supabase
      .from('subscriptions')
      .update({ status: 'cancelled' })
      .eq('id', id)

    if (error) {
      console.error('[Subscription Delete API] Error:', error)
      return NextResponse.json(
        { error: 'Failed to cancel subscription', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled successfully',
    })
  } catch (error) {
    console.error('[Subscription Delete API] Exception:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
