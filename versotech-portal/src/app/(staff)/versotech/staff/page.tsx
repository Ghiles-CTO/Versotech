import { requireStaffAuth } from '@/lib/auth'
import { EnhancedStaffDashboard } from '@/components/dashboard/enhanced-staff-dashboard'
import { getCachedStaffDashboardData } from '@/lib/staff/dashboard-cache'

export const dynamic = 'force-dynamic'

export default async function StaffDashboard() {
  await requireStaffAuth()

  // Use cached dashboard data with 5-minute TTL
  const data = await getCachedStaffDashboardData()

  return <EnhancedStaffDashboard initialData={data} />
}