import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServiceClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
        commitment_amount,
        funded_amount,
        current_nav,
        outstanding_amount,
        management_fee_amount,
        status,
        created_at
      `)
      .eq('status', 'active')

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

    // Calculate financial metrics
    const totalAUM = subscriptions?.reduce((sum, sub) => sum + (sub.current_nav || 0), 0) || 0
    const totalCommitments = subscriptions?.reduce((sum, sub) => sum + (sub.commitment_amount || 0), 0) || 0
    const totalFunded = subscriptions?.reduce((sum, sub) => sum + (sub.funded_amount || 0), 0) || 0
    const totalOutstanding = subscriptions?.reduce((sum, sub) => sum + (sub.outstanding_amount || 0), 0) || 0
    const totalManagementFees = subscriptions?.reduce((sum, sub) => sum + (sub.management_fee_amount || 0), 0) || 0

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
        change_mtd: 2.3, // % change - would calculate from historical data
        change_ytd: 8.7,
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

      // Revenue & Fees
      revenue: {
        management_fees_total: totalManagementFees,
        revenue_mtd: paidInvoicesThisMonth.reduce((sum, inv) => sum + (inv.paid_amount || 0), 0),
        revenue_ytd: paidInvoicesThisYear.reduce((sum, inv) => sum + (inv.paid_amount || 0), 0),
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

      // Performance Metrics
      performance: {
        irr_ytd: 12.4, // Would calculate from actual returns
        multiple: 1.24, // Would calculate from actual returns
        dpi: 0.32, // Distributions to Paid-In capital
        tvpi: 1.56, // Total Value to Paid-In capital
      },

      // Summary
      summary: {
        total_portfolio_value: totalAUM + totalOutstanding,
        net_asset_value: totalAUM,
        total_distributions_ytd: totalDistributionsYTD,
        total_revenue_ytd: paidInvoicesThisYear.reduce((sum, inv) => sum + (inv.paid_amount || 0), 0),
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