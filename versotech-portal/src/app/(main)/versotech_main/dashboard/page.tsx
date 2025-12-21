import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { CEODashboard } from './ceo-dashboard'
import { PersonaDashboard } from './persona-dashboard'
import { getCachedStaffDashboardData } from '@/lib/staff/dashboard-cache'

export const dynamic = 'force-dynamic'

export default async function UnifiedDashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/versotech_main/login')
  }

  // CEO users (staff_admin or ceo role) get the full executive dashboard
  const isCEO = user.role === 'staff_admin' || user.role === 'ceo' ||
                user.role === 'staff_ops' || user.role === 'staff_rm'

  if (isCEO) {
    // Fetch real dashboard data for CEO users
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
