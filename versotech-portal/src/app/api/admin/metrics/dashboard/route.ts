import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'
import { currencyTotalsEntries, getSingleCurrency, normalizeCurrencyCode } from '@/lib/currency-totals'

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const days = Math.min(Math.max(parseInt(searchParams.get('days') || '30', 10), 7), 90)

    const supabase = createServiceClient()

    // Check if user is super admin
    const { data: permission } = await supabase
      .from('staff_permissions')
      .select('permission')
      .eq('user_id', user.id)
      .eq('permission', 'super_admin')
      .single()

    if (!permission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch all data in parallel
    const [
      subscriptionsResult,
      investorResult,
      dealResult,
      pendingResult,
      feeEventsResult,
      pipelineResult,
      investorDistResult,
      alertsResult,
      // Admin-only metrics
      securityMetrics,
      staffActivityResult,
      approvalQueueResult,
      workflowTrendResult,
      complianceForecastResult,
      userActivityTrendResult,
    ] = await Promise.all([
      // Subscriptions for AUM and Revenue metrics (limit to prevent billing spikes)
      supabase
        .from('subscriptions')
        .select('id, commitment, funded_amount, current_nav, spread_fee_amount, subscription_fee_amount, management_fee_amount, currency, status, subscription_date')
        .in('status', ['active', 'committed', 'funded'])
        .limit(50000),

      // Investor stats (limit to prevent billing spikes)
      supabase
        .from('investors')
        .select('id, status, created_at, kyc_status, type, country', { count: 'exact' })
        .eq('status', 'active')
        .limit(50000),

      // Deal pipeline (limit to prevent billing spikes)
      supabase.from('deals').select('id, status, target_amount, raised_amount').limit(5000),

      // Pending items
      Promise.all([
        supabase.from('approvals').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('tasks').select('id', { count: 'exact' }).in('status', ['pending', 'overdue']),
        supabase
          .from('investors')
          .select('id', { count: 'exact' })
          .eq('kyc_status', 'pending'),
      ]),

      // Fee events for revenue by month chart (limit to prevent billing spikes)
      supabase
        .from('fee_events')
        .select('id, fee_type, computed_amount, created_at')
        .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())
        .limit(10000),

      // Subscription pipeline
      Promise.all([
        supabase.from('investor_deal_interest').select('id', { count: 'exact', head: true }),
        supabase.from('deal_data_room_access').select('id', { count: 'exact', head: true }).is('revoked_at', null),
        supabase
          .from('deal_subscription_submissions')
          .select('id', { count: 'exact', head: true })
          .in('status', ['pending_review', 'approved', 'pending']),
        supabase
          .from('subscriptions')
          .select('id', { count: 'exact', head: true })
          .gt('funded_amount', 0),
      ]),

      // Investor distribution (limit to prevent billing spikes)
      supabase.from('investors').select('type, kyc_status, country').eq('status', 'active').limit(50000),

      // Compliance alerts
      supabase
        .from('investors')
        .select('id, legal_name, kyc_expiry_date, kyc_status')
        .eq('status', 'active')
        .not('kyc_expiry_date', 'is', null)
        .gte('kyc_expiry_date', new Date().toISOString().split('T')[0])
        .lte(
          'kyc_expiry_date',
          new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        ),

      // Admin-only: Security metrics (failed logins, new accounts)
      fetchSecurityMetrics(supabase),

      // Admin-only: Staff activity from audit_logs
      fetchStaffActivity(supabase),

      // Admin-only: Approval queue age distribution
      fetchApprovalQueueHealth(supabase),

      // Admin-only: Workflow success trend over past 30 days
      fetchWorkflowTrend(supabase),

      // Admin-only: KYC expiry forecast
      fetchComplianceForecast(supabase),

      // Admin-only: User activity trend for the specified time period
      fetchUserActivityTrend(supabase, days),
    ])

    // Calculate AUM and Revenue from ACTUAL subscription data
    const subscriptions = subscriptionsResult.data || []
    const totalAum = subscriptions.reduce((sum, s) => sum + (s.current_nav || s.commitment || 0), 0)
    const totalCommitment = subscriptions.reduce((sum, s) => sum + (s.commitment || 0), 0)
    const totalFunded = subscriptions.reduce((sum, s) => sum + (s.funded_amount || 0), 0)
    const fundingRate = totalCommitment > 0 ? Math.round((totalFunded / totalCommitment) * 100) : 0

    const aumByCurrency: Record<string, { value: number; commitment: number; funded: number; funding_rate: number }> = {}
    subscriptions.forEach((sub) => {
      const currency = normalizeCurrencyCode(sub.currency)
      if (!aumByCurrency[currency]) {
        aumByCurrency[currency] = { value: 0, commitment: 0, funded: 0, funding_rate: 0 }
      }
      aumByCurrency[currency].value += sub.current_nav || sub.commitment || 0
      aumByCurrency[currency].commitment += sub.commitment || 0
      aumByCurrency[currency].funded += sub.funded_amount || 0
    })
    Object.values(aumByCurrency).forEach((entry) => {
      entry.funding_rate =
        entry.commitment > 0 ? Math.round((entry.funded / entry.commitment) * 100) : 0
    })
    const aumCurrencyEntries = currencyTotalsEntries(
      Object.fromEntries(Object.entries(aumByCurrency).map(([k, v]) => [k, v.value]))
    )
    const aumDefaultCurrency = getSingleCurrency(
      Object.fromEntries(Object.entries(aumByCurrency).map(([k, v]) => [k, v.value]))
    ) || aumCurrencyEntries[0]?.[0] || 'USD'
    const aumCurrencyMode = aumCurrencyEntries.length > 1 ? 'mixed' : 'single'

    // VERSO's PRIMARY REVENUE - Spread fees
    const spreadFeeRevenue = subscriptions.reduce((sum, s) => sum + (s.spread_fee_amount || 0), 0)
    const subscriptionFeeRevenue = subscriptions.reduce((sum, s) => sum + (s.subscription_fee_amount || 0), 0)
    const managementFeeRevenue = subscriptions.reduce((sum, s) => sum + (s.management_fee_amount || 0), 0)
    const totalRevenue = spreadFeeRevenue + subscriptionFeeRevenue + managementFeeRevenue

    const revenueByCurrency: Record<
      string,
      { total: number; spread_fees: number; subscription_fees: number; management_fees: number }
    > = {}
    subscriptions.forEach((sub) => {
      const currency = normalizeCurrencyCode(sub.currency)
      if (!revenueByCurrency[currency]) {
        revenueByCurrency[currency] = {
          total: 0,
          spread_fees: 0,
          subscription_fees: 0,
          management_fees: 0,
        }
      }
      revenueByCurrency[currency].spread_fees += sub.spread_fee_amount || 0
      revenueByCurrency[currency].subscription_fees += sub.subscription_fee_amount || 0
      revenueByCurrency[currency].management_fees += sub.management_fee_amount || 0
      revenueByCurrency[currency].total =
        revenueByCurrency[currency].spread_fees +
        revenueByCurrency[currency].subscription_fees +
        revenueByCurrency[currency].management_fees
    })
    const revenueCurrencyEntries = currencyTotalsEntries(
      Object.fromEntries(Object.entries(revenueByCurrency).map(([k, v]) => [k, v.total]))
    )
    const revenueDefaultCurrency = getSingleCurrency(
      Object.fromEntries(Object.entries(revenueByCurrency).map(([k, v]) => [k, v.total]))
    ) || revenueCurrencyEntries[0]?.[0] || 'USD'
    const revenueCurrencyMode = revenueCurrencyEntries.length > 1 ? 'mixed' : 'single'

    // Calculate investor metrics
    const investors = investorResult.data || []
    const totalInvestors = investorResult.count || 0
    const newInvestorsMtd = investors.filter((i) => {
      const createdDate = new Date(i.created_at)
      const now = new Date()
      return (
        createdDate.getMonth() === now.getMonth() &&
        createdDate.getFullYear() === now.getFullYear()
      )
    }).length

    // Calculate deal metrics
    const deals = dealResult.data || []
    const openDeals = deals.filter(
      (d) => d.status === 'open' || d.status === 'allocation_pending'
    ).length
    const pipelineValue = deals
      .filter((d) => d.status === 'open' || d.status === 'allocation_pending')
      .reduce((sum, d) => sum + (d.target_amount || 0), 0)

    // Pending items
    const [approvalsRes, tasksRes, kycRes] = pendingResult
    const pendingApprovals = approvalsRes.count || 0
    const pendingTasks = tasksRes.count || 0
    const pendingKyc = kycRes.count || 0

    // Revenue by month from fee_events
    const feeEvents = feeEventsResult.data || []
    const revenueByMonth: Record<string, { month: string; subscription_fees: number; management_fees: number; performance_fees: number; spread_fees: number; total: number }> = {}

    feeEvents.forEach((fe) => {
      const date = new Date(fe.created_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (!revenueByMonth[monthKey]) {
        revenueByMonth[monthKey] = {
          month: monthKey,
          subscription_fees: 0,
          management_fees: 0,
          performance_fees: 0,
          spread_fees: 0,
          total: 0,
        }
      }

      const amount = fe.computed_amount || 0
      if (fe.fee_type === 'subscription') revenueByMonth[monthKey].subscription_fees += amount
      else if (fe.fee_type === 'management') revenueByMonth[monthKey].management_fees += amount
      else if (fe.fee_type === 'performance') revenueByMonth[monthKey].performance_fees += amount
      else if (fe.fee_type === 'spread') revenueByMonth[monthKey].spread_fees += amount
      revenueByMonth[monthKey].total += amount
    })

    const revenueByMonthArray = Object.values(revenueByMonth).sort((a, b) => a.month.localeCompare(b.month))

    // Subscription pipeline
    const [interestRes, ndaRes, submittedRes, fundedRes] = pipelineResult
    const subscriptionPipeline = {
      interest: interestRes.count || 0,
      nda_signed: ndaRes.count || 0,
      submitted: submittedRes.count || 0,
      funded: fundedRes.count || 0,
    }

    // Deal pipeline by status
    const dealsByStatus = {
      draft: { count: 0, value: 0 },
      open: { count: 0, value: 0 },
      allocation_pending: { count: 0, value: 0 },
      closed: { count: 0, value: 0 },
      cancelled: { count: 0, value: 0 },
    }
    deals.forEach((d) => {
      const status = d.status as keyof typeof dealsByStatus
      if (dealsByStatus[status]) {
        dealsByStatus[status].count++
        dealsByStatus[status].value += d.target_amount || 0
      }
    })

    // Investor distribution
    const investorDist = investorDistResult.data || []
    const byType: Record<string, number> = {}
    const byKyc: Record<string, number> = {}
    const byCountry: Record<string, number> = {}

    investorDist.forEach((i) => {
      const type = i.type || 'Unknown'
      byType[type] = (byType[type] || 0) + 1

      const kyc = i.kyc_status || 'not_started'
      byKyc[kyc] = (byKyc[kyc] || 0) + 1

      const country = i.country || 'Unknown'
      byCountry[country] = (byCountry[country] || 0) + 1
    })

    // Format investor distribution for charts
    const investorsByType = Object.entries(byType).map(([type, count]) => ({ type, count }))
    const investorsByKyc = Object.entries(byKyc).map(([status, count]) => ({ status, count }))
    const investorsByCountry = Object.entries(byCountry)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Compliance alerts
    const kycAlerts = (alertsResult.data || []).map((i) => {
      const expiryDate = new Date(i.kyc_expiry_date)
      const today = new Date()
      const daysUntil = Math.ceil(
        (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      )
      let severity: 'critical' | 'high' | 'medium' = 'medium'
      if (daysUntil <= 7) severity = 'critical'
      else if (daysUntil <= 30) severity = 'high'

      return {
        id: i.id,
        type: 'kyc_expiry' as const,
        severity,
        investor_id: i.id,
        investor_name: i.legal_name,
        details: `KYC expires in ${daysUntil} days`,
        due_date: i.kyc_expiry_date,
        days_until_due: daysUntil,
        created_at: new Date().toISOString(),
      }
    })

    // Build action items from alerts
    const criticalAlerts = kycAlerts.filter((a) => a.severity === 'critical')
    const highAlerts = kycAlerts.filter((a) => a.severity === 'high')
    const mediumAlerts = kycAlerts.filter((a) => a.severity === 'medium')

    const actionItems = {
      critical:
        criticalAlerts.length > 0
          ? [
              {
                id: 'kyc-critical',
                category: 'kyc',
                title: 'KYC Expiring (Critical)',
                description: `${criticalAlerts.length} investors with KYC expiring within 7 days`,
                count: criticalAlerts.length,
                link: '/versotech/staff/investors?kyc_status=expiring',
              },
            ]
          : [],
      high: [
        ...(pendingApprovals > 0
          ? [
              {
                id: 'approvals',
                category: 'approval',
                title: 'Pending Approvals',
                description: `${pendingApprovals} approvals waiting for review`,
                count: pendingApprovals,
                link: '/versotech/staff/approvals',
              },
            ]
          : []),
        ...(highAlerts.length > 0
          ? [
              {
                id: 'kyc-high',
                category: 'kyc',
                title: 'KYC Expiring Soon',
                description: `${highAlerts.length} investors with KYC expiring within 30 days`,
                count: highAlerts.length,
                link: '/versotech/staff/investors?kyc_status=expiring',
              },
            ]
          : []),
      ],
      medium: [
        ...(pendingTasks > 0
          ? [
              {
                id: 'tasks',
                category: 'task',
                title: 'Pending Tasks',
                description: `${pendingTasks} tasks requiring attention`,
                count: pendingTasks,
                link: '/versotech/staff/tasks',
              },
            ]
          : []),
        ...(mediumAlerts.length > 0
          ? [
              {
                id: 'kyc-medium',
                category: 'kyc',
                title: 'KYC Expiring (90 days)',
                description: `${mediumAlerts.length} investors with KYC expiring within 90 days`,
                count: mediumAlerts.length,
                link: '/versotech/staff/investors?kyc_status=expiring',
              },
            ]
          : []),
      ],
    }

    return NextResponse.json({
      success: true,
      data: {
        kpis: {
          aum: {
            value: totalAum,
            commitment: totalCommitment,
            funded: totalFunded,
            funding_rate: fundingRate,
            change_mtd: null, // Requires historical snapshots to calculate
            trend: null, // Requires historical snapshots to calculate
            default_currency: aumDefaultCurrency,
            currency_mode: aumCurrencyMode,
            by_currency: aumByCurrency,
          },
          revenue: {
            total: totalRevenue,
            spread_fees: spreadFeeRevenue,
            subscription_fees: subscriptionFeeRevenue,
            management_fees: managementFeeRevenue,
            default_currency: revenueDefaultCurrency,
            currency_mode: revenueCurrencyMode,
            by_currency: revenueByCurrency,
          },
          investors: {
            active: totalInvestors,
            new_mtd: newInvestorsMtd,
            trend: newInvestorsMtd > 0 ? 'up' : null,
          },
          deals: {
            open: openDeals,
            pipeline_value: pipelineValue,
            trend: null, // Requires historical snapshots to calculate
          },
          pending: {
            approvals: pendingApprovals,
            tasks: pendingTasks,
            kyc: pendingKyc,
          },
        },
        charts: {
          revenueByMonth: revenueByMonthArray,
          subscriptionPipeline,
          dealsByStatus,
          investorsByType,
          investorsByKyc,
          investorsByCountry,
        },
        alerts: actionItems,
        // Admin-only metrics
        adminMetrics: {
          security: securityMetrics,
          staffActivity: staffActivityResult,
          approvalQueue: approvalQueueResult,
          workflowTrend: workflowTrendResult,
          complianceForecast: complianceForecastResult,
          userActivityTrend: userActivityTrendResult,
        },
      },
    })
  } catch (error) {
    console.error('Dashboard metrics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard metrics' },
      { status: 500 }
    )
  }
}

// Helper functions for admin-only metrics

async function fetchSecurityMetrics(supabase: any) {
  const now = new Date()
  const day24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
  const day7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

  // Failed logins from audit_logs (limit to prevent billing spikes during attacks)
  const { data: loginAttempts } = await supabase
    .from('audit_logs')
    .select('created_at')
    .eq('action', 'failed_login_attempt')
    .gte('created_at', day7d)
    .limit(10000)

  const failed24h = loginAttempts?.filter(
    (l: any) => new Date(l.created_at) >= new Date(day24h)
  ).length || 0
  const failed7d = loginAttempts?.length || 0

  // New accounts created in past 7 days
  const { count: newAccounts } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', day7d)

  // Pending approvals count
  const { count: pendingApprovals } = await supabase
    .from('approvals')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  return {
    failed_logins_24h: failed24h,
    failed_logins_7d: failed7d,
    new_accounts_7d: newAccounts || 0,
    pending_approvals: pendingApprovals || 0,
  }
}

async function fetchStaffActivity(supabase: any) {
  const day7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  // Get staff profiles first
  const { data: staffProfiles } = await supabase
    .from('profiles')
    .select('id, display_name, email')
    .in('role', ['staff_admin', 'staff_ops', 'staff_rm', 'ceo'])

  if (!staffProfiles?.length) {
    return []
  }

  const staffIds = staffProfiles.map((p: any) => p.id)

  // Get audit log counts grouped by staff (limit to prevent billing spikes)
  const { data: activityLogs } = await supabase
    .from('audit_logs')
    .select('actor_id, action, created_at')
    .in('actor_id', staffIds)
    .gte('created_at', day7d)
    .limit(50000)

  // Aggregate by staff
  const activityMap: Record<string, { count: number; lastAction: string | null }> = {}
  staffIds.forEach((id: string) => {
    activityMap[id] = { count: 0, lastAction: null }
  })

  activityLogs?.forEach((log: any) => {
    const entry = activityMap[log.actor_id]
    if (entry) {
      entry.count++
      if (!entry.lastAction || log.created_at > entry.lastAction) {
        entry.lastAction = log.created_at
      }
    }
  })

  // Map to staff with names
  const staffActivity = staffProfiles.map((staff: any) => ({
    staff_id: staff.id,
    name: staff.display_name || staff.email?.split('@')[0] || 'Unknown',
    action_count: activityMap[staff.id]?.count || 0,
    last_action: activityMap[staff.id]?.lastAction,
  }))

  // Sort by action count descending
  return staffActivity.sort((a: any, b: any) => b.action_count - a.action_count)
}

async function fetchApprovalQueueHealth(supabase: any) {
  const now = new Date()
  const day1 = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
  const day3 = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
  const day7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const { data: pendingApprovals } = await supabase
    .from('approvals')
    .select('created_at')
    .eq('status', 'pending')
    .limit(10000)

  let under_1_day = 0
  let days_1_to_3 = 0
  let days_3_to_7 = 0
  let over_7_days = 0

  pendingApprovals?.forEach((approval: any) => {
    const createdAt = new Date(approval.created_at)
    if (createdAt >= day1) {
      under_1_day++
    } else if (createdAt >= day3) {
      days_1_to_3++
    } else if (createdAt >= day7) {
      days_3_to_7++
    } else {
      over_7_days++
    }
  })

  return {
    under_1_day,
    days_1_to_3,
    days_3_to_7,
    over_7_days,
    total: pendingApprovals?.length || 0,
  }
}

async function fetchWorkflowTrend(supabase: any) {
  const day30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const { data: runs } = await supabase
    .from('workflow_runs')
    .select('status, created_at')
    .gte('created_at', day30)
    .order('created_at', { ascending: true })
    .limit(50000)

  // Group by date
  const byDate: Record<string, { total: number; completed: number; failed: number }> = {}

  runs?.forEach((run: any) => {
    const date = run.created_at.split('T')[0]
    if (!byDate[date]) {
      byDate[date] = { total: 0, completed: 0, failed: 0 }
    }
    byDate[date].total++
    if (run.status === 'completed') {
      byDate[date].completed++
    } else if (run.status === 'failed') {
      byDate[date].failed++
    }
  })

  // Convert to array with success rate
  return Object.entries(byDate).map(([date, stats]) => ({
    date,
    total_runs: stats.total,
    completed: stats.completed,
    failed: stats.failed,
    success_rate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
  }))
}

async function fetchComplianceForecast(supabase: any) {
  const now = new Date()
  const day7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
  const day30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
  const day90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString()

  const { data: investors } = await supabase
    .from('investors')
    .select('kyc_expiry_date')
    .not('kyc_expiry_date', 'is', null)
    .gte('kyc_expiry_date', now.toISOString())
    .lte('kyc_expiry_date', day90)

  let next_7_days = 0
  let next_30_days = 0
  let next_90_days = 0

  investors?.forEach((inv: any) => {
    const expiry = new Date(inv.kyc_expiry_date)
    if (expiry <= new Date(day7)) {
      next_7_days++
    } else if (expiry <= new Date(day30)) {
      next_30_days++
    } else {
      next_90_days++
    }
  })

  return {
    next_7_days,
    next_30_days,
    next_90_days,
    total: investors?.length || 0,
  }
}

async function fetchUserActivityTrend(supabase: any, days: number) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  // Get audit logs grouped by date and count unique users per day
  const { data: activityLogs } = await supabase
    .from('audit_logs')
    .select('actor_id, created_at')
    .gte('created_at', startDate)
    .not('actor_id', 'is', null)
    .order('created_at', { ascending: true })
    .limit(100000)

  // Group by date and count unique users
  const byDate: Record<string, Set<string>> = {}

  // Initialize all dates in range with empty sets
  for (let i = 0; i < days; i++) {
    const date = new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000)
    const dateKey = date.toISOString().split('T')[0]
    byDate[dateKey] = new Set()
  }

  // Populate with actual data
  activityLogs?.forEach((log: any) => {
    const dateKey = log.created_at.split('T')[0]
    if (byDate[dateKey] && log.actor_id) {
      byDate[dateKey].add(log.actor_id)
    }
  })

  // Convert to array format for the chart
  return Object.entries(byDate).map(([date, userSet]) => ({
    date,
    activeUsers: userSet.size,
    // Format date for display (e.g., "Jan 15")
    label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }))
}
