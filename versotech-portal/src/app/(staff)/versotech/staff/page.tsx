import { requireStaffAuth } from '@/lib/auth'
import { EnhancedStaffDashboard } from '@/components/dashboard/enhanced-staff-dashboard'
import { RealtimeStaffDashboard } from '@/components/dashboard/realtime-staff-dashboard'
import { getCachedStaffDashboardData } from '@/lib/staff/dashboard-cache'
import { createClient } from '@/lib/supabase/server'
import { VideoIntroWrapper } from './video-intro-wrapper'

export const dynamic = 'force-dynamic'

export default async function StaffDashboard() {
  const user = await requireStaffAuth()

  // Check if user has seen intro video
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('has_seen_intro_video')
    .eq('id', user.id)
    .single()
  const showIntroVideo = profile?.has_seen_intro_video === false
  const videoUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/public-assets/videos/intro-video.mp4`

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
    <VideoIntroWrapper showIntroVideo={showIntroVideo} videoUrl={videoUrl}>
      <div className="space-y-6">
        {/* Real-time connection and live metrics */}
        <RealtimeStaffDashboard initialData={realtimeMetrics} />

        {/* Main comprehensive dashboard */}
        <EnhancedStaffDashboard initialData={data} />
      </div>
    </VideoIntroWrapper>
  )
}