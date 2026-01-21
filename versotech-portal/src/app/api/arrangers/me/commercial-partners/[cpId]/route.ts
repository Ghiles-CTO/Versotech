/**
 * Arranger Commercial Partner Detail API
 * GET /api/arrangers/me/commercial-partners/[cpId] - Get CP details with fee plans, commissions, agreements
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

/**
 * GET /api/arrangers/me/commercial-partners/[cpId]
 * Returns commercial partner details including:
 * - Basic CP info
 * - Fee plans assigned to this CP
 * - Commission summary (accrued, invoiced, paid)
 * - Placement agreements
 * - Deals involved
 * - Recent referrals
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cpId: string }> }
) {
  try {
    const { cpId } = await params
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

    // 1. Fetch commercial partner basic info
    const { data: cp, error: cpError } = await serviceSupabase
      .from('commercial_partners')
      .select('*')
      .eq('id', cpId)
      .single()

    if (cpError || !cp) {
      return NextResponse.json({ error: 'Commercial partner not found' }, { status: 404 })
    }

    // 2. Verify this CP has referrals on arranger's deals (establishes relationship)
    const { data: arrangerDeals } = await serviceSupabase
      .from('deals')
      .select('id')
      .eq('arranger_entity_id', arrangerId)

    const dealIds = (arrangerDeals || []).map(d => d.id)

    if (dealIds.length > 0) {
      const { data: cpReferrals } = await serviceSupabase
        .from('deal_memberships')
        .select('id')
        .in('deal_id', dealIds)
        .eq('referred_by_entity_type', 'commercial_partner')
        .eq('referred_by_entity_id', cpId)
        .limit(1)

      if (!cpReferrals || cpReferrals.length === 0) {
        // Also check if there's a placement agreement linking them
        const { data: hasAgreement } = await serviceSupabase
          .from('placement_agreements')
          .select('id')
          .eq('commercial_partner_id', cpId)
          .eq('arranger_id', arrangerId)
          .limit(1)

        if (!hasAgreement || hasAgreement.length === 0) {
          return NextResponse.json(
            { error: 'Commercial partner not in your network' },
            { status: 403 }
          )
        }
      }
    }

    // 3. Fetch fee plans assigned to this CP (created by this arranger)
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
      .eq('commercial_partner_id', cpId)
      .eq('created_by_arranger_id', arrangerId)
      .order('created_at', { ascending: false })

    // 4. Fetch commission summary for this CP
    const { data: commissions } = await serviceSupabase
      .from('commercial_partner_commissions')
      .select('status, accrual_amount, currency')
      .eq('commercial_partner_id', cpId)
      .eq('arranger_id', arrangerId)

    // Calculate commission totals by status
    const commissionSummary = {
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

    // 5. Fetch placement agreements for this CP (created by this arranger)
    const { data: agreements } = await serviceSupabase
      .from('placement_agreements')
      .select(`
        id,
        agreement_type,
        default_commission_bps,
        commission_cap_amount,
        territory,
        exclusivity_level,
        effective_date,
        expiry_date,
        status,
        created_at
      `)
      .eq('commercial_partner_id', cpId)
      .eq('arranger_id', arrangerId)
      .order('created_at', { ascending: false })

    // 6. Fetch deals this CP has referrals on (for this arranger)
    const { data: dealsWithReferrals } = await serviceSupabase
      .from('deal_memberships')
      .select(`
        deal_id,
        deal:deals(id, name, company_name, status, currency)
      `)
      .in('deal_id', dealIds)
      .eq('referred_by_entity_type', 'commercial_partner')
      .eq('referred_by_entity_id', cpId)

    // Deduplicate deals
    const uniqueDeals = new Map()
    ;(dealsWithReferrals || []).forEach((dm: any) => {
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
        deal_id,
        investor:investors(id, legal_name),
        deal:deals(id, name, company_name)
      `)
      .in('deal_id', dealIds)
      .eq('referred_by_entity_type', 'commercial_partner')
      .eq('referred_by_entity_id', cpId)
      .order('created_at', { ascending: false })
      .limit(10)

    // Transform referrals
    const transformedReferrals = (recentReferrals || []).map((ref: any) => {
      const investor = Array.isArray(ref.investor) ? ref.investor[0] : ref.investor
      const deal = Array.isArray(ref.deal) ? ref.deal[0] : ref.deal
      return {
        id: ref.id,
        created_at: ref.created_at,
        investor: investor ? { id: investor.id, name: investor.legal_name } : null,
        deal: deal ? { id: deal.id, name: deal.name, company_name: deal.company_name } : null,
      }
    })

    // 8. Return combined response
    return NextResponse.json({
      data: {
        commercial_partner: {
          id: cp.id,
          name: cp.name || cp.legal_name,
          legal_name: cp.legal_name,
          cp_type: cp.cp_type,
          status: cp.status,
          regulatory_status: cp.regulatory_status,
          jurisdiction: cp.jurisdiction,
          contact_name: cp.contact_name,
          contact_email: cp.contact_email,
          contact_phone: cp.contact_phone,
          country: cp.country,
          logo_url: cp.logo_url,
          kyc_status: cp.kyc_status,
          contract_end_date: cp.contract_end_date,
          created_at: cp.created_at,
        },
        fee_plans: feePlans || [],
        commission_summary: commissionSummary,
        placement_agreements: agreements || [],
        deals: Array.from(uniqueDeals.values()),
        recent_referrals: transformedReferrals,
        stats: {
          total_deals: uniqueDeals.size,
          total_referrals: (recentReferrals || []).length,
          active_fee_plans: (feePlans || []).filter((fp: any) => fp.is_active).length,
          active_agreements: (agreements || []).filter((a: any) => a.status === 'active').length,
        },
      },
    })
  } catch (error) {
    console.error('[arranger/commercial-partners/[cpId]] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
