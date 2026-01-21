/**
 * Arranger Introducer Detail API
 * GET /api/arrangers/me/introducers/[introducerId] - Get introducer details with fee plans and commissions
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import type { IntroducerData, CommissionSummary } from '@/types/introducers'

/**
 * GET /api/arrangers/me/introducers/[introducerId]
 * Returns introducer details including:
 * - Basic introducer info
 * - Fee plans assigned to this introducer
 * - Commission summary (accrued, invoiced, paid)
 * - Deals where this introducer has referrals
 * - Recent referrals
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ introducerId: string }> }
) {
  try {
    const { introducerId } = await params
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

    // 1. Fetch introducer basic info
    const { data: introducer, error: introducerError } = await serviceSupabase
      .from('introducers')
      .select('*')
      .eq('id', introducerId)
      .single()

    if (introducerError || !introducer) {
      return NextResponse.json({ error: 'Introducer not found' }, { status: 404 })
    }

    // 2. Get arranger's deals
    const { data: arrangerDeals } = await serviceSupabase
      .from('deals')
      .select('id')
      .eq('arranger_entity_id', arrangerId)

    const dealIds = (arrangerDeals || []).map(d => d.id)

    // 3. Verify this introducer has referrals on arranger's deals
    if (dealIds.length > 0) {
      const { data: introducerReferrals } = await serviceSupabase
        .from('deal_memberships')
        .select('id')
        .in('deal_id', dealIds)
        .eq('referred_by_entity_type', 'introducer')
        .eq('referred_by_entity_id', introducerId)
        .limit(1)

      if (!introducerReferrals || introducerReferrals.length === 0) {
        return NextResponse.json(
          { error: 'Introducer has no referrals on your deals' },
          { status: 403 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'No deals found for your entity' },
        { status: 403 }
      )
    }

    // 4. Fetch fee plans assigned to this introducer (created by this arranger)
    const { data: feePlans } = await serviceSupabase
      .from('fee_plans')
      .select(`
        id,
        name,
        description,
        is_active,
        effective_from,
        effective_until,
        deal_id,
        vehicle_id,
        created_at,
        components:fee_components(*)
      `)
      .eq('introducer_id', introducerId)
      .eq('created_by_arranger_id', arrangerId)
      .order('created_at', { ascending: false })

    // 5. Fetch commission summary for this introducer
    const { data: commissions } = await serviceSupabase
      .from('introducer_commissions')
      .select('status, accrual_amount, currency')
      .eq('introducer_id', introducerId)
      .eq('arranger_id', arrangerId)

    // Calculate commission totals by status
    const commissionSummary: CommissionSummary = {
      accrued: 0,
      invoice_requested: 0,
      invoiced: 0,
      paid: 0,
      cancelled: 0,
      total_owed: 0,
      currency: 'USD',
    }

    ;(commissions || []).forEach((c: any) => {
      const amount = Number(c.accrual_amount) || 0
      if (c.status === 'accrued') commissionSummary.accrued += amount
      else if (c.status === 'invoice_requested') commissionSummary.invoice_requested += amount
      else if (c.status === 'invoice_submitted') commissionSummary.invoice_requested += amount
      else if (c.status === 'invoiced') commissionSummary.invoiced += amount
      else if (c.status === 'paid') commissionSummary.paid += amount
      else if (c.status === 'cancelled') commissionSummary.cancelled += amount

      // Total owed = accrued + invoice_requested + invoiced (not yet paid)
      if (['accrued', 'invoice_requested', 'invoice_submitted', 'invoiced'].includes(c.status)) {
        commissionSummary.total_owed += amount
      }

      if (c.currency) commissionSummary.currency = c.currency
    })

    // 6. Fetch deals where this introducer has referrals
    const { data: introducerDealMemberships } = await serviceSupabase
      .from('deal_memberships')
      .select(`
        deal_id,
        deal:deals(id, name, company_name, status, currency)
      `)
      .in('deal_id', dealIds)
      .eq('referred_by_entity_type', 'introducer')
      .eq('referred_by_entity_id', introducerId)

    // Deduplicate deals
    const uniqueDeals = new Map()
    ;(introducerDealMemberships || []).forEach((dm: any) => {
      const deal = Array.isArray(dm.deal) ? dm.deal[0] : dm.deal
      if (deal && !uniqueDeals.has(deal.id)) {
        uniqueDeals.set(deal.id, deal)
      }
    })

    // 7. Fetch recent referrals (last 10)
    const { data: recentReferrals } = await serviceSupabase
      .from('deal_memberships')
      .select(`
        id,
        created_at,
        investor_id,
        investor:investors(id, legal_name, display_name),
        deal_id,
        deal:deals(id, name, company_name)
      `)
      .in('deal_id', dealIds)
      .eq('referred_by_entity_type', 'introducer')
      .eq('referred_by_entity_id', introducerId)
      .order('created_at', { ascending: false })
      .limit(10)

    // Transform referrals to the expected format
    const transformedReferrals = (recentReferrals || []).map((ref: any) => {
      const investor = Array.isArray(ref.investor) ? ref.investor[0] : ref.investor
      const deal = Array.isArray(ref.deal) ? ref.deal[0] : ref.deal
      return {
        id: ref.id,
        created_at: ref.created_at,
        investor: investor ? {
          id: investor.id,
          name: investor.display_name || investor.legal_name || 'Unknown Investor',
        } : null,
        deal: deal ? {
          id: deal.id,
          name: deal.name,
          company_name: deal.company_name,
        } : null,
      }
    })

    // 8. Return combined response
    const responseData: IntroducerData = {
      introducer: {
        id: introducer.id,
        legal_name: introducer.legal_name,
        contact_name: introducer.contact_name,
        email: introducer.email,
        status: introducer.status || 'active',
        default_commission_bps: introducer.default_commission_bps,
        commission_cap_amount: introducer.commission_cap_amount ? Number(introducer.commission_cap_amount) : null,
        payment_terms: introducer.payment_terms,
        agreement_expiry_date: introducer.agreement_expiry_date,
        logo_url: introducer.logo_url,
        notes: introducer.notes,
        created_at: introducer.created_at,
      },
      fee_plans: feePlans || [],
      commission_summary: commissionSummary,
      deals: Array.from(uniqueDeals.values()),
      recent_referrals: transformedReferrals,
      stats: {
        total_deals: uniqueDeals.size,
        total_referrals: transformedReferrals.length,
        active_fee_plans: (feePlans || []).filter((fp: any) => fp.is_active).length,
      },
    }

    return NextResponse.json({ data: responseData })
  } catch (error) {
    console.error('[arranger/introducers/[introducerId]] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
