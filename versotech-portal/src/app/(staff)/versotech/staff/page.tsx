import { requireStaffAuth } from '@/lib/auth'
import { EnhancedStaffDashboard } from '@/components/dashboard/enhanced-staff-dashboard'
import { RealtimeStaffDashboard } from '@/components/dashboard/realtime-staff-dashboard'
import { getCachedStaffDashboardData } from '@/lib/staff/dashboard-cache'

export const dynamic = 'force-dynamic'

export default async function StaffDashboard() {
  await requireStaffAuth()

  // Use cached dashboard data with 5-minute TTL
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

  return (
    <div className="space-y-6">
      {/* Real-time connection and live metrics */}
      <RealtimeStaffDashboard initialData={realtimeMetrics} />

      {/* Main comprehensive dashboard */}
      <EnhancedStaffDashboard initialData={data} />
    </div>
  )
}