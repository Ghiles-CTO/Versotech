import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { CEODashboard } from './ceo-dashboard'
import { PersonaDashboard } from './persona-dashboard'
import { getCachedStaffDashboardData } from '@/lib/staff/dashboard-cache'

export const dynamic = 'force-dynamic'

export default async function UnifiedDashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/versotech_main/login')
  }

  // Check the active persona from cookie (set by client-side persona switcher)
  const cookieStore = await cookies()
  const activePersonaType = cookieStore.get('verso_active_persona_type')?.value

  // CEO users (ceo or staff_admin) get the full executive dashboard
  // UNLESS they've switched to a different persona via the persona switcher
  const isCEOUser = user.role === 'staff_admin' || user.role === 'ceo'
  const isViewingAsCEO = !activePersonaType || activePersonaType === 'ceo' || activePersonaType === 'staff'

  if (isCEOUser && isViewingAsCEO) {
    // Fetch real dashboard data for CEO users viewing as CEO/staff
    const data = await getCachedStaffDashboardData()

    // Transform data for realtime component
    const realtimeMetrics = {
      activeLps: data.kpis.activeLps ?? 0,
      pendingKyc: data.kpis.pendingKyc ?? 0,
      workflowRuns: data.kpis.workflowRunsThisMonth ?? 0,
      complianceRate: data.kpis.complianceRate ?? 0,
      kycPipeline: data.kpis.highPriorityKyc ?? 0,
      ndaInProgress: 0, // Not currently tracked in main data
      subscriptionReview: 0, // Not currently tracked in main data
      activeDeals: data.management.activeDeals ?? 0,
      activeRequests: data.management.activeRequests ?? 0,
      lastUpdated: data.generatedAt
    }

    return <CEODashboard dashboardData={data} realtimeMetrics={realtimeMetrics} />
  }

  // Non-CEO users get the persona-aware dashboard
  return <PersonaDashboard />
}
