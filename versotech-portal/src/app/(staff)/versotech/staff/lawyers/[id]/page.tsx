import { createServiceClient } from '@/lib/supabase/server'
import { requireStaffAuth } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { LawyerDetailClient } from '@/components/staff/lawyers/lawyer-detail-client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type LawyerDetail = {
  id: string
  firm_name: string
  display_name: string
  legal_entity_type: string | null
  registration_number: string | null
  tax_id: string | null
  primary_contact_name: string | null
  primary_contact_email: string | null
  primary_contact_phone: string | null
  street_address: string | null
  city: string | null
  state_province: string | null
  postal_code: string | null
  country: string | null
  specializations: string[] | null
  is_active: boolean
  onboarded_at: string | null
  created_at: string | null
  created_by: string | null
  updated_at: string | null
  logo_url: string | null
  kyc_status: string | null
  kyc_approved_at: string | null
  kyc_approved_by: string | null
  kyc_expires_at: string | null
  kyc_notes: string | null
  assigned_deals: string[] | null
}

type Deal = {
  id: string
  name: string
  status: string
  target_amount: number | null
  created_at: string
}

export default async function LawyerDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  await requireStaffAuth()
  const serviceClient = createServiceClient()

  // Fetch lawyer details
  const { data: lawyer, error } = await serviceClient
    .from('lawyers')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !lawyer) {
    console.error('[LawyerDetailPage] Error:', error)
    notFound()
  }

  // Fetch assigned deals
  const assignedDealIds = lawyer.assigned_deals || []
  let deals: Deal[] = []

  if (assignedDealIds.length > 0) {
    const { data: dealsData } = await serviceClient
      .from('deals')
      .select('id, name, status, target_amount, created_at')
      .in('id', assignedDealIds)
      .order('created_at', { ascending: false })

    deals = (dealsData || []).map(d => ({
      id: d.id,
      name: d.name,
      status: d.status || 'unknown',
      target_amount: d.target_amount,
      created_at: d.created_at
    }))
  }

  // Fetch document count from entity_document_links
  const { count: documentCount } = await serviceClient
    .from('entity_document_links')
    .select('*', { count: 'exact', head: true })
    .eq('entity_type', 'lawyer')
    .eq('entity_id', id)

  // Calculate metrics
  const activeDeals = deals.filter(d =>
    ['draft', 'open', 'allocation_pending', 'in_progress'].includes(d.status)
  ).length

  const metrics = {
    totalDeals: deals.length,
    activeDeals,
    documentCount: documentCount || 0
  }

  const lawyerData = lawyer as LawyerDetail

  return (
    <LawyerDetailClient
      lawyer={lawyerData}
      metrics={metrics}
      deals={deals}
    />
  )
}
