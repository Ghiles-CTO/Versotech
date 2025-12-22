import { createServiceClient } from '@/lib/supabase/server'
import { requireStaffAuth } from '@/lib/auth'
import { LawyersDashboard } from '@/components/staff/lawyers/lawyers-dashboard'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function LawyersPage() {
  await requireStaffAuth()
  const serviceClient = createServiceClient()

  // Fetch all lawyers
  const { data: lawyers, error } = await serviceClient
    .from('lawyers')
    .select('*')
    .order('firm_name', { ascending: true })

  if (error) {
    console.error('[LawyersPage] Error fetching lawyers:', error)
  }

  const lawyersList = lawyers || []

  // Calculate summary stats
  const summary = {
    totalLawyers: lawyersList.length,
    activeLawyers: lawyersList.filter(l => l.is_active).length,
    kycApproved: lawyersList.filter(l => l.kyc_status === 'approved').length,
    kycPending: lawyersList.filter(l => l.kyc_status === 'pending').length,
  }

  // Map to dashboard format
  const dashboardLawyers = lawyersList.map(l => ({
    id: l.id,
    firmName: l.firm_name,
    displayName: l.display_name,
    primaryContactName: l.primary_contact_name,
    primaryContactEmail: l.primary_contact_email,
    country: l.country,
    specializations: l.specializations,
    isActive: l.is_active,
    kycStatus: l.kyc_status,
    assignedDealsCount: l.assigned_deals?.length || 0,
    createdAt: l.created_at,
  }))

  return (
    <LawyersDashboard
      summary={summary}
      lawyers={dashboardLawyers}
    />
  )
}
