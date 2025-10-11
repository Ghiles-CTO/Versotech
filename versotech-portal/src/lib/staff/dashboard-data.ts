import { createClient } from '@/lib/supabase/server'

type NullableString = string | null

export type StaffDashboardData = {
  generatedAt: string
  kpis: {
    activeLps: number
    pendingKyc: number
    highPriorityKyc: number
    workflowRunsThisMonth: number
    complianceRate: number
  }
  pipeline: {
    kycPending: number
    ndaInProgress: number
    subscriptionReview: number
    nextCapitalCall?: {
      name: string
      dueDate: string
    }
  }
  processCenter: {
    activeWorkflows: number
  }
  management: {
    activeDeals: number
    activeRequests: number
    complianceRate: number
    activeInvestors: number
  }
  recentActivity: Array<{
    id: string
    title: string
    description: NullableString
    activityType: NullableString
    createdAt: string
  }>
  errors?: string[]
}

const startOfMonthISO = () => {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString()
}

type CountResult = { count: number; error: string | null }

type CountPromise = Promise<{ count: number | null; error: { message: string } | null }>

async function fetchCount(queryPromise: CountPromise): Promise<CountResult> {
  try {
    const { count, error } = await queryPromise
    if (error) {
      return { count: 0, error: error.message }
    }
    return { count: count ?? 0, error: null }
  } catch (error) {
    return {
      count: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function getStaffDashboardData(): Promise<StaffDashboardData> {
  const supabase = await createClient()
  const errors: string[] = []

  const startOfMonth = startOfMonthISO()
  const todayIso = new Date().toISOString()

  const [
    activeLpsRes,
    pendingKycRes,
    highPriorityKycRes,
    workflowRunsRes,
    totalInvestorsRes,
    compliantInvestorsRes,
    kycPipelineRes,
    ndaPipelineRes,
    subscriptionPipelineRes,
    capitalCallRes,
    workflowsRes,
    dealsRes,
    requestsRes,
    activityRes
  ] = await Promise.all([
    fetchCount(
      supabase
        .from('investors')
        .select('id', { head: true, count: 'exact' })
        .eq('status', 'active')
    ),
    fetchCount(
      supabase
        .from('investors')
        .select('id', { head: true, count: 'exact' })
        .in('kyc_status', ['pending', 'review'])
    ),
    fetchCount(
      supabase
        .from('tasks')
        .select('id', { head: true, count: 'exact' })
        .in('kind', ['kyc_individual', 'kyc_entity', 'kyc_aml_check'])
        .in('status', ['pending', 'in_progress'])
        .eq('priority', 'high')
    ),
    fetchCount(
      supabase
        .from('workflow_runs')
        .select('id', { head: true, count: 'exact' })
        .gte('created_at', startOfMonth)
    ),
    fetchCount(
      supabase.from('investors').select('id', { head: true, count: 'exact' })
    ),
    fetchCount(
      supabase
        .from('investors')
        .select('id', { head: true, count: 'exact' })
        .eq('kyc_status', 'approved')
    ),
    fetchCount(
      supabase
        .from('tasks')
        .select('id', { head: true, count: 'exact' })
        .in('kind', ['kyc_individual', 'kyc_entity', 'kyc_aml_check'])
        .in('status', ['pending', 'in_progress'])
    ),
    fetchCount(
      supabase
        .from('tasks')
        .select('id', { head: true, count: 'exact' })
        .eq('kind', 'compliance_nda')
        .in('status', ['pending', 'in_progress'])
    ),
    fetchCount(
      supabase
        .from('tasks')
        .select('id', { head: true, count: 'exact' })
        .eq('kind', 'compliance_subscription_agreement')
        .in('status', ['pending', 'in_progress'])
    ),
    supabase
      .from('capital_calls')
      .select('id, name, due_date', { count: 'exact' })
      .gte('due_date', todayIso.substring(0, 10))
      .order('due_date', { ascending: true })
      .limit(1),
    fetchCount(
      supabase
        .from('workflows')
        .select('id', { head: true, count: 'exact' })
        .eq('is_active', true)
    ),
    fetchCount(
      supabase
        .from('deals')
        .select('id', { head: true, count: 'exact' })
        .in('status', ['open', 'allocation_pending'])
    ),
    fetchCount(
      supabase
        .from('request_tickets')
        .select('id', { head: true, count: 'exact' })
        .in('status', ['open', 'assigned', 'in_progress'])
    ),
    supabase
      .from('activity_feed')
      .select('id, title, description, activity_type, created_at')
      .order('created_at', { ascending: false })
      .limit(4)
  ])

  const capitalCallData = capitalCallRes.error ? null : capitalCallRes.data?.[0] ?? null
  if (capitalCallRes.error) {
    errors.push(capitalCallRes.error.message)
  }

  if (activityRes.error) {
    errors.push(activityRes.error.message)
  }

  const totalInvestors = totalInvestorsRes.count
  const compliantInvestors = compliantInvestorsRes.count

  const complianceRate = totalInvestors > 0 ? (compliantInvestors / totalInvestors) * 100 : 0

  const data: StaffDashboardData = {
    generatedAt: new Date().toISOString(),
    kpis: {
      activeLps: activeLpsRes.count,
      pendingKyc: pendingKycRes.count,
      highPriorityKyc: highPriorityKycRes.count,
      workflowRunsThisMonth: workflowRunsRes.count,
      complianceRate: Number.isFinite(complianceRate) ? complianceRate : 0
    },
    pipeline: {
      kycPending: kycPipelineRes.count,
      ndaInProgress: ndaPipelineRes.count,
      subscriptionReview: subscriptionPipelineRes.count,
      nextCapitalCall: capitalCallData
        ? {
            name: capitalCallData.name ?? 'Capital Call',
            dueDate: capitalCallData.due_date
          }
        : undefined
    },
    processCenter: {
      activeWorkflows: workflowsRes.count
    },
    management: {
      activeDeals: dealsRes.count,
      activeRequests: requestsRes.count,
      complianceRate: Number.isFinite(complianceRate) ? complianceRate : 0,
      activeInvestors: activeLpsRes.count
    },
    recentActivity: (activityRes.data ?? []).map((item) => ({
      id: item.id,
      title: item.title ?? 'Activity',
      description: item.description ?? null,
      activityType: item.activity_type ?? null,
      createdAt: item.created_at
    }))
  }

  const countResults = [
    activeLpsRes,
    pendingKycRes,
    highPriorityKycRes,
    workflowRunsRes,
    totalInvestorsRes,
    compliantInvestorsRes,
    kycPipelineRes,
    ndaPipelineRes,
    subscriptionPipelineRes,
    workflowsRes,
    dealsRes,
    requestsRes
  ]

  countResults.forEach((result) => {
    if (result.error) {
      errors.push(result.error)
    }
  })

  if (errors.length > 0) {
    data.errors = errors
  }

  return data
}


