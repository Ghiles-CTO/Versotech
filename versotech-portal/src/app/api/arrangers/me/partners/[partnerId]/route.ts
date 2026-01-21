/**
 * Arranger Partner Detail API
 * GET /api/arrangers/me/partners/[partnerId] - Get partner details with fee plans and commissions
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

/**
 * GET /api/arrangers/me/partners/[partnerId]
 * Returns partner details including:
 * - Basic partner info
 * - Fee plans assigned to this partner
 * - Commission summary (accrued, invoiced, paid)
 * - Deals involved
 * - Recent referrals
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ partnerId: string }> }
) {
  try {
    const { partnerId } = await params
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

    // 1. Fetch partner basic info
    const { data: partner, error: partnerError } = await serviceSupabase
      .from('partners')
      .select('*')
      .eq('id', partnerId)
      .single()

    if (partnerError || !partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
    }

    // 2. Verify this partner is assigned to arranger's deals via fee_plans
    // Partners are linked to deals when CEO dispatches with a fee model
    const { data: arrangerDeals } = await serviceSupabase
      .from('deals')
      .select('id')
      .eq('arranger_entity_id', arrangerId)

    const dealIds = (arrangerDeals || []).map(d => d.id)

    if (dealIds.length > 0) {
      // CORRECT: Check fee_plans for partner assignment (not deal_memberships referrals)
      const { data: partnerFeePlans } = await serviceSupabase
        .from('fee_plans')
        .select('id')
        .in('deal_id', dealIds)
        .eq('partner_id', partnerId)
        .limit(1)

      if (!partnerFeePlans || partnerFeePlans.length === 0) {
        return NextResponse.json(
          { error: 'Partner not assigned to any of your deals' },
          { status: 403 }
        )
      }
    } else {
      // No deals means no partners
      return NextResponse.json(
        { error: 'No deals found for your entity' },
        { status: 403 }
      )
    }

    // 3. Fetch fee plans assigned to this partner (created by this arranger)
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
      .eq('partner_id', partnerId)
      .eq('created_by_arranger_id', arrangerId)
      .order('created_at', { ascending: false })

    // 4. Fetch commission summary for this partner
    const { data: commissions } = await serviceSupabase
      .from('partner_commissions')
      .select('status, accrual_amount, currency')
      .eq('partner_id', partnerId)
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

    // 5. Fetch deals this partner is assigned to via fee_plans
    const { data: partnerDealFeePlans } = await serviceSupabase
      .from('fee_plans')
      .select(`
        deal_id,
        deal:deals(id, name, company_name, status, currency)
      `)
      .in('deal_id', dealIds)
      .eq('partner_id', partnerId)

    // Deduplicate deals
    const uniqueDeals = new Map()
    ;(partnerDealFeePlans || []).forEach((fp: any) => {
      const deal = Array.isArray(fp.deal) ? fp.deal[0] : fp.deal
      if (deal && !uniqueDeals.has(deal.id)) {
        uniqueDeals.set(deal.id, deal)
      }
    })

    // 6. Recent activity - fee plans created for this partner (last 10)
    // Note: Referral tracking via deal_memberships is a separate feature
    const { data: recentFeePlans } = await serviceSupabase
      .from('fee_plans')
      .select(`
        id,
        name,
        created_at,
        deal_id,
        deal:deals(id, name, company_name)
      `)
      .in('deal_id', dealIds)
      .eq('partner_id', partnerId)
      .order('created_at', { ascending: false })
      .limit(10)

    // Transform to activity items
    const transformedReferrals = (recentFeePlans || []).map((fp: any) => {
      const deal = Array.isArray(fp.deal) ? fp.deal[0] : fp.deal
      return {
        id: fp.id,
        created_at: fp.created_at,
        investor: null, // Fee plans don't have investors directly
        deal: deal ? { id: deal.id, name: deal.name, company_name: deal.company_name } : null,
      }
    })

    // 7. Return combined response
    return NextResponse.json({
      data: {
        partner: {
          id: partner.id,
          name: partner.name,
          legal_name: partner.legal_name,
          partner_type: partner.partner_type,
          status: partner.status,
          contact_name: partner.contact_name,
          contact_email: partner.contact_email,
          contact_phone: partner.contact_phone,
          country: partner.country,
          logo_url: partner.logo_url,
          kyc_status: partner.kyc_status,
          created_at: partner.created_at,
        },
        fee_plans: feePlans || [],
        commission_summary: commissionSummary,
        deals: Array.from(uniqueDeals.values()),
        recent_referrals: transformedReferrals,
        stats: {
          total_deals: uniqueDeals.size,
          total_referrals: (recentFeePlans || []).length, // Fee plan assignments
          active_fee_plans: (feePlans || []).filter((fp: any) => fp.is_active).length,
        },
      },
    })
  } catch (error) {
    console.error('[arranger/partners/[partnerId]] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
