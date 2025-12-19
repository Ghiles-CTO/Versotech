import { createServiceClient } from '@/lib/supabase/server'

type NullableString = string | null

export type MetricError = {
  metric: string
  message: string
  code?: string
}

export type StaffDashboardData = {
  generatedAt: string
  kpis: {
    activeLps: number | null
    pendingKyc: number | null
    highPriorityKyc: number | null
    workflowRunsThisMonth: number | null
    complianceRate: number | null
  }
  processCenter: {
    activeWorkflows: number | null
  }
  management: {
    activeDeals: number | null
    activeRequests: number | null
    complianceRate: number | null
    activeInvestors: number | null
  }
  recentActivity: Array<{
    id: string
    title: string
    description: NullableString
    activityType: 'fee' | 'subscription' | 'investor' | 'other'
    createdAt: string
    amount?: number
    status?: string
  }>
  charts: {
    fees: Array<{
      date: string
      amount: number
      type: string
    }>
    subscriptions: Array<{
      date: string
      amount: number
      status: string
    }>
  }
  errors?: MetricError[]
}

const startOfMonthISO = () => {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString()
}

const twelveMonthsAgoISO = () => {
  const now = new Date()
  now.setFullYear(now.getFullYear() - 1)
  return now.toISOString()
}

type CountResult = { count: number | null; error: string | null }

type CountPromise = Promise<{ count: number | null; error: { message: string; code?: string } | null }>

async function fetchCount(queryPromise: CountPromise, metricName: string): Promise<CountResult> {
  try {
    const { count, error } = await queryPromise
    if (error) {
      console.error(`[dashboard-data] Error fetching ${metricName}:`, error.message)
      return { count: null, error: error.message }
    }
    return { count: count ?? 0, error: null }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    console.error(`[dashboard-data] Exception fetching ${metricName}:`, errorMsg)
    return {
      count: null,
      error: errorMsg
    }
  }
}

// SQL-based aggregation for fee events (replaces JavaScript aggregation)
async function getFeeChartData(supabase: any, startDate: string) {
  const { data, error } = await supabase.rpc('aggregate_fee_events_by_date', {
    start_date: startDate
  })

  if (error) {
    console.error('[dashboard-data] Error fetching aggregated fee data:', error)
    // Fallback to manual aggregation if RPC doesn't exist
    return { data: null, error }
  }

  return { data, error: null }
}

// SQL-based aggregation for subscriptions (replaces JavaScript aggregation)
async function getSubscriptionChartData(supabase: any, startDate: string) {
  const { data, error } = await supabase.rpc('aggregate_subscriptions_by_date', {
    start_date: startDate
  })

  if (error) {
    console.error('[dashboard-data] Error fetching aggregated subscription data:', error)
    // Fallback to manual aggregation if RPC doesn't exist
    return { data: null, error }
  }

  return { data, error: null }
}

// Fallback: Helper to aggregate data by date if SQL aggregation fails
function aggregateByDate(data: any[], dateKey: string, amountKey: string) {
  const map = new Map<string, { date: string, amount: number }>()

  data.forEach((item) => {
    if (!item[dateKey]) return
    // Ensure we use the date part only, handling potential timezones by taking the ISO date string directly
    const date = new Date(item[dateKey]).toISOString().split('T')[0]
    const amount = Number(item[amountKey]) || 0

    if (!map.has(date)) {
      map.set(date, {
        date,
        amount: 0
      })
    }

    const entry = map.get(date)!
    entry.amount += amount
  })

  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date))
}

export type DateRangeFilter = {
  from?: Date | string
  to?: Date | string
}

export async function getStaffDashboardData(
  dateRangeFilter?: DateRangeFilter
): Promise<StaffDashboardData> {
  // Note: Auth validation is handled in the page component before calling this function
  // Use service role client here because:
  // 1. This function is called within unstable_cache() which cannot access cookies
  // 2. Auth is already validated in the page component
  // 3. Dashboard data is not user-specific - it shows all data for staff admins
  const supabase = createServiceClient()
  const errors: MetricError[] = []

  const startOfMonth = startOfMonthISO()
  // Use provided date range or default to 12 months ago
  const chartStartDate = dateRangeFilter?.from
    ? new Date(dateRangeFilter.from).toISOString()
    : twelveMonthsAgoISO()

  const [
    activeLpsRes,
    pendingKycRes,
    highPriorityKycRes,
    workflowRunsRes,
    totalInvestorsRes,
    compliantInvestorsRes,
    workflowsRes,
    dealsRes,
    requestsRes,
    // Replaced generic activity feed with specific business logic queries
    latestFeesRes,
    latestSubscriptionsRes,
    latestInvestorsRes,
    feesRes,
    subscriptionsRes
  ] = await Promise.all([
    fetchCount(
      supabase
        .from('investors')
        .select('id', { head: true, count: 'exact' })
        .eq('status', 'active') as any,
      'Active LPs'
    ),
    fetchCount(
      supabase
        .from('investors')
        .select('id', { head: true, count: 'exact' })
        .in('kyc_status', ['pending', 'review', 'completed']) as any,
      'Pending KYC'
    ),
    fetchCount(
      supabase
        .from('tasks')
        .select('id', { head: true, count: 'exact' })
        .in('kind', ['kyc_individual', 'kyc_entity', 'kyc_aml_check', 'onboarding_profile', 'compliance_tax_forms'])
        .in('status', ['pending', 'in_progress'])
        .eq('priority', 'high') as any,
      'High Priority KYC'
    ),
    fetchCount(
      supabase
        .from('workflow_runs')
        .select('id', { head: true, count: 'exact' })
        .gte('created_at', startOfMonth) as any,
      'Workflow Runs (MTD)'
    ),
    fetchCount(
      supabase.from('investors').select('id', { head: true, count: 'exact' }) as any,
      'Total Investors'
    ),
    fetchCount(
      supabase
        .from('investors')
        .select('id', { head: true, count: 'exact' })
        .eq('kyc_status', 'approved') as any,
      'Compliant Investors'
    ),
    fetchCount(
      supabase
        .from('workflows')
        .select('id', { head: true, count: 'exact' })
        .eq('is_active', true) as any,
      'Active Workflows'
    ),
    fetchCount(
      supabase
        .from('deals')
        .select('id', { head: true, count: 'exact' })
        .in('status', ['open', 'allocation_pending', 'draft']) as any,
      'Active Deals'
    ),
    fetchCount(
      supabase
        .from('request_tickets')
        .select('id', { head: true, count: 'exact' })
        .in('status', ['open', 'assigned', 'in_progress']) as any,
      'Active Requests'
    ),
    // 1. Latest Fees
    supabase
        .from('fee_events')
        .select('id, computed_amount, fee_type, created_at')
        .order('created_at', { ascending: false })
        .limit(5),
    // 2. Latest Subscriptions
    supabase
        .from('subscriptions')
        .select('id, commitment, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5),
    // 3. Latest Investors (e.g. newly approved)
    supabase
        .from('investors')
        .select('id, status, kyc_status, created_at')
        .order('created_at', { ascending: false })
        .limit(5),

    // Chart Data - Try SQL aggregation first, fallback to full data fetch
    getFeeChartData(supabase, chartStartDate),
    getSubscriptionChartData(supabase, chartStartDate)
  ])

  // Collect errors with specific metric names
  if (latestFeesRes.error) {
    errors.push({ metric: 'Latest Fees', message: latestFeesRes.error.message })
  }
  if (latestSubscriptionsRes.error) {
    errors.push({ metric: 'Latest Subscriptions', message: latestSubscriptionsRes.error.message })
  }
  if (latestInvestorsRes.error) {
    errors.push({ metric: 'Latest Investors', message: latestInvestorsRes.error.message })
  }

  const totalInvestors = totalInvestorsRes.count ?? 0
  const compliantInvestors = compliantInvestorsRes.count ?? 0
  const complianceRate = totalInvestors > 0 ? (compliantInvestors / totalInvestors) * 100 : null

  // Process chart data with fallback
  let aggregatedFees: any[] = []
  let aggregatedSubscriptions: any[] = []

  // Fees chart data
  if (feesRes.error) {
    errors.push({ metric: 'Fee Chart Data', message: feesRes.error.message })
    // Try fallback: fetch raw data and aggregate in JavaScript
    const fallbackFees = await supabase
      .from('fee_events')
      .select('computed_amount, created_at, fee_type')
      .gte('created_at', chartStartDate)
      .order('created_at', { ascending: true })

    if (!fallbackFees.error && fallbackFees.data) {
      aggregatedFees = aggregateByDate(fallbackFees.data, 'created_at', 'computed_amount')
    }
  } else {
    aggregatedFees = feesRes.data ?? []
  }

  // Subscriptions chart data
  if (subscriptionsRes.error) {
    errors.push({ metric: 'Subscription Chart Data', message: subscriptionsRes.error.message })
    // Try fallback: fetch raw data and aggregate in JavaScript
    const fallbackSubs = await supabase
      .from('subscriptions')
      .select('commitment, created_at, status')
      .gte('created_at', chartStartDate)
      .order('created_at', { ascending: true })

    if (!fallbackSubs.error && fallbackSubs.data) {
      aggregatedSubscriptions = aggregateByDate(fallbackSubs.data, 'created_at', 'commitment')
    }
  } else {
    aggregatedSubscriptions = subscriptionsRes.data ?? []
  }

  // Build Recent Activity
  const activities: StaffDashboardData['recentActivity'] = []

  // Add Fees
  latestFeesRes.data?.forEach(fee => {
    activities.push({
        id: fee.id,
        title: 'Fee Calculated',
        description: `${fee.fee_type} fee of $${fee.computed_amount?.toLocaleString()}`,
        activityType: 'fee',
        createdAt: fee.created_at,
        amount: fee.computed_amount,
        status: 'processed'
    })
  })

  // Add Subscriptions
  latestSubscriptionsRes.data?.forEach(sub => {
    activities.push({
        id: sub.id,
        title: 'New Subscription',
        description: `Commitment: $${sub.commitment?.toLocaleString() ?? '0'}`,
        activityType: 'subscription',
        createdAt: sub.created_at,
        amount: sub.commitment,
        status: sub.status
    })
  })

  // Add Investors
  latestInvestorsRes.data?.forEach(inv => {
    activities.push({
        id: inv.id,
        title: 'Investor Update',
        description: `Status: ${inv.status}, KYC: ${inv.kyc_status}`,
        activityType: 'investor',
        createdAt: inv.created_at,
        status: inv.kyc_status
    })
  })

  // Sort and limit to top 10 most recent
  activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  const recentActivity = activities.slice(0, 10)

  // Collect errors from count queries
  const countResults = [
    { name: 'Active LPs', result: activeLpsRes },
    { name: 'Pending KYC', result: pendingKycRes },
    { name: 'High Priority KYC', result: highPriorityKycRes },
    { name: 'Workflow Runs (MTD)', result: workflowRunsRes },
    { name: 'Total Investors', result: totalInvestorsRes },
    { name: 'Compliant Investors', result: compliantInvestorsRes },
    { name: 'Active Workflows', result: workflowsRes },
    { name: 'Active Deals', result: dealsRes },
    { name: 'Active Requests', result: requestsRes }
  ]

  countResults.forEach(({ name, result }) => {
    if (result.error) {
      errors.push({ metric: name, message: result.error })
    }
  })

  const data: StaffDashboardData = {
    generatedAt: new Date().toISOString(),
    kpis: {
      activeLps: activeLpsRes.count,
      pendingKyc: pendingKycRes.count,
      highPriorityKyc: highPriorityKycRes.count,
      workflowRunsThisMonth: workflowRunsRes.count,
      complianceRate: complianceRate
    },
    processCenter: {
      activeWorkflows: workflowsRes.count
    },
    management: {
      activeDeals: dealsRes.count,
      activeRequests: requestsRes.count,
      complianceRate: complianceRate,
      activeInvestors: activeLpsRes.count
    },
    recentActivity,
    charts: {
      fees: aggregatedFees.map((fee: any) => ({ ...fee, type: fee.type || 'total' })),
      subscriptions: aggregatedSubscriptions.map((sub: any) => ({ ...sub, status: sub.status || 'active' }))
    }
  }

  if (errors.length > 0) {
    data.errors = errors
  }

  return data
}
