'use client'

import { EnhancedStaffDashboard } from '@/components/dashboard/enhanced-staff-dashboard'
import { RealtimeStaffDashboard } from '@/components/dashboard/realtime-staff-dashboard'

interface CEODashboardProps {
  dashboardData: any
  realtimeMetrics: {
    activeLps: number
    pendingKyc: number
    workflowRuns: number
    complianceRate: number
    kycPipeline: number
    ndaInProgress: number
    subscriptionReview: number
    activeDeals: number
    activeRequests: number
    lastUpdated: string
  }
}

/**
 * CEO Dashboard - Full executive dashboard with real-time metrics
 * Wraps the enhanced staff dashboard components for use in the unified portal
 */
export function CEODashboard({ dashboardData, realtimeMetrics }: CEODashboardProps) {
  return (
    <div className="space-y-6">
      {/* Real-time connection and live metrics */}
      <RealtimeStaffDashboard initialData={realtimeMetrics} />

      {/* Main comprehensive dashboard */}
      <EnhancedStaffDashboard initialData={dashboardData} />
    </div>
  )
}
