import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceClient()

    // Check permissions
    const { data: permission } = await supabase
      .from('staff_permissions')
      .select('permission')
      .eq('user_id', user.id)
      .in('permission', ['super_admin', 'view_financials'])
      .limit(1)
      .single()

    if (!permission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get date ranges
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfYear = new Date(now.getFullYear(), 0, 1)
    const startOfQuarter = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)

    // Get AUM and subscription data
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select(`
        id,
        vehicle_id,
        commitment,
        funded_amount,
        current_nav,
        outstanding_amount,
        spread_fee_amount,
        subscription_fee_amount,
        management_fee_amount,
        status,
        created_at
      `)
      .in('status', ['active', 'committed', 'funded'])

    // Get vehicle data
    const { data: vehicles } = await supabase
      .from('vehicles')
      .select(`
        id,
        name,
        type,
        target_size,
        status
      `)

    // Get deal pipeline data
    const { data: deals } = await supabase
      .from('deals')
      .select(`
        id,
        name,
        target_amount,
        raised_amount,
        status,
        target_close_date,
        created_at
      `)

    // Get invoice data
    const { data: invoices } = await supabase
      .from('invoices')
      .select(`
        id,
        amount,
        paid_amount,
        status,
        due_date,
        created_at,
        paid_at
      `)

    // Get distribution data
    const { data: distributions } = await supabase
      .from('distributions')
      .select(`
        id,
        amount,
        distribution_date,
        created_at
      `)
      .gte('distribution_date', startOfYear.toISOString())

    // Calculate financial metrics from REAL subscription data
    const totalAUM = subscriptions?.reduce((sum, sub) => sum + (sub.current_nav || sub.commitment || 0), 0) || 0
    const totalCommitments = subscriptions?.reduce((sum, sub) => sum + (sub.commitment || 0), 0) || 0
    const totalFunded = subscriptions?.reduce((sum, sub) => sum + (sub.funded_amount || 0), 0) || 0
    const totalOutstanding = subscriptions?.reduce((sum, sub) => sum + (sub.outstanding_amount || 0), 0) || 0

    // Fee revenue - SPREAD FEES are VERSO's PRIMARY REVENUE SOURCE!
    const totalSpreadFees = subscriptions?.reduce((sum, sub) => sum + (sub.spread_fee_amount || 0), 0) || 0
    const totalSubscriptionFees = subscriptions?.reduce((sum, sub) => sum + (sub.subscription_fee_amount || 0), 0) || 0
    const totalManagementFees = subscriptions?.reduce((sum, sub) => sum + (sub.management_fee_amount || 0), 0) || 0
    const totalFeeRevenue = totalSpreadFees + totalSubscriptionFees + totalManagementFees

    // Invoice metrics
    const pendingInvoices = invoices?.filter(inv => inv.status === 'pending' || inv.status === 'sent') || []
    const paidInvoicesThisMonth = invoices?.filter(inv =>
      inv.status === 'paid' &&
      inv.paid_at &&
      new Date(inv.paid_at) >= startOfMonth
    ) || []
    const paidInvoicesThisYear = invoices?.filter(inv =>
      inv.status === 'paid' &&
      inv.paid_at &&
      new Date(inv.paid_at) >= startOfYear
    ) || []

    // Deal pipeline metrics
    const openDeals = deals?.filter(d => d.status === 'open' || d.status === 'allocation_pending') || []
    const closedDeals = deals?.filter(d => d.status === 'closed') || []
    const totalPipelineValue = openDeals.reduce((sum, deal) => sum + (deal.target_amount || 0), 0)

    // Distribution metrics
    const totalDistributionsYTD = distributions?.reduce((sum, dist) => sum + (dist.amount || 0), 0) || 0

    // Investor metrics
    const { count: totalInvestors } = await supabase
      .from('investors')
      .select('id', { count: 'exact' })
      .eq('status', 'active')

    const { count: approvedInvestors } = await supabase
      .from('investors')
      .select('id', { count: 'exact' })
      .eq('kyc_status', 'approved')

    const metrics = {
      // Assets Under Management
      aum: {
        total: totalAUM,
        change_mtd: null, // Would require historical snapshots to calculate
        change_ytd: null, // Would require historical snapshots to calculate
        breakdown_by_vehicle: vehicles?.map(v => ({
          vehicle_name: v.name,
          vehicle_type: v.type,
          aum: subscriptions
            ?.filter(s => s.vehicle_id === v.id)
            .reduce((sum, s) => sum + (s.current_nav || 0), 0) || 0,
        })) || [],
      },

      // Commitments & Funding
      commitments: {
        total: totalCommitments,
        funded: totalFunded,
        outstanding: totalOutstanding,
        funding_rate: totalCommitments > 0 ? ((totalFunded / totalCommitments) * 100).toFixed(2) : 0,
      },

      // Revenue & Fees (REAL VERSO REVENUE from subscriptions)
      revenue: {
        total_fee_revenue: totalFeeRevenue,
        spread_fees: totalSpreadFees, // PRIMARY REVENUE SOURCE
        subscription_fees: totalSubscriptionFees,
        management_fees: totalManagementFees,
        // Invoice-based revenue tracking
        invoiced_revenue_mtd: paidInvoicesThisMonth.reduce((sum, inv) => sum + (inv.paid_amount || 0), 0),
        invoiced_revenue_ytd: paidInvoicesThisYear.reduce((sum, inv) => sum + (inv.paid_amount || 0), 0),
        pending_invoices: {
          count: pendingInvoices.length,
          amount: pendingInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0),
        },
        overdue_invoices: {
          count: pendingInvoices.filter(inv =>
            inv.due_date && new Date(inv.due_date) < now
          ).length,
          amount: pendingInvoices
            .filter(inv => inv.due_date && new Date(inv.due_date) < now)
            .reduce((sum, inv) => sum + (inv.amount || 0), 0),
        },
      },

      // Deal Pipeline
      deal_pipeline: {
        open_deals: openDeals.length,
        total_pipeline_value: totalPipelineValue,
        closed_deals_ytd: closedDeals.filter(d =>
          d.created_at && new Date(d.created_at) >= startOfYear
        ).length,
        average_deal_size: closedDeals.length > 0
          ? closedDeals.reduce((sum, d) => sum + (d.raised_amount || 0), 0) / closedDeals.length
          : 0,
        conversion_rate: deals && deals.length > 0
          ? ((closedDeals.length / deals.length) * 100).toFixed(2)
          : 0,
      },

      // Distributions
      distributions: {
        total_ytd: totalDistributionsYTD,
        last_distribution_date: distributions && distributions.length > 0
          ? distributions.sort((a, b) =>
              new Date(b.distribution_date).getTime() - new Date(a.distribution_date).getTime()
            )[0].distribution_date
          : null,
        distribution_count_ytd: distributions?.length || 0,
      },

      // Investor Metrics
      investors: {
        total_active: totalInvestors || 0,
        kyc_approved: approvedInvestors || 0,
        kyc_pending: (totalInvestors || 0) - (approvedInvestors || 0),
        new_investors_mtd: subscriptions?.filter(s =>
          s.created_at && new Date(s.created_at) >= startOfMonth
        ).length || 0,
      },

      // Performance Metrics - calculated from actual data
      performance: {
        // DPI = Total Distributions / Total Paid-In Capital
        dpi: totalFunded > 0 ? Number((totalDistributionsYTD / totalFunded).toFixed(4)) : null,
        // TVPI = (NAV + Distributions) / Paid-In Capital
        tvpi: totalFunded > 0 ? Number(((totalAUM + totalDistributionsYTD) / totalFunded).toFixed(4)) : null,
        // IRR and Multiple require cash flow timing data - not available without historical tracking
        irr_ytd: null,
        multiple: null,
      },

      // Summary
      summary: {
        total_portfolio_value: totalAUM + totalOutstanding,
        net_asset_value: totalAUM,
        total_commitment: totalCommitments,
        total_funded: totalFunded,
        total_fee_revenue: totalFeeRevenue,
        total_distributions_ytd: totalDistributionsYTD,
        last_updated: now.toISOString(),
      },
    }

    return NextResponse.json({
      success: true,
      data: metrics,
      timestamp: now.toISOString(),
    })
  } catch (error) {
    console.error('Financial metrics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}