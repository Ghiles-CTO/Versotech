import { createClient, createServiceClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { LawyerDetailClient } from '@/components/staff/lawyers/lawyer-detail-client'
import { AlertCircle } from 'lucide-react'
import { checkStaffAccess } from '@/lib/auth'

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
  // Entity type (individual vs entity)
  type?: string | null
  // Individual KYC fields
  first_name?: string | null
  middle_name?: string | null
  last_name?: string | null
  name_suffix?: string | null
  date_of_birth?: string | null
  country_of_birth?: string | null
  nationality?: string | null
  email?: string | null
  phone_mobile?: string | null
  phone_office?: string | null
  // US Tax compliance
  is_us_citizen?: boolean | null
  is_us_taxpayer?: boolean | null
  us_taxpayer_id?: string | null
  country_of_tax_residency?: string | null
  // ID Document
  id_type?: string | null
  id_number?: string | null
  id_issue_date?: string | null
  id_expiry_date?: string | null
  id_issuing_country?: string | null
  // Residential Address
  residential_street?: string | null
  residential_line_2?: string | null
  residential_city?: string | null
  residential_state?: string | null
  residential_postal_code?: string | null
  residential_country?: string | null
  // Additional KYC fields
  middle_initial?: string | null
  proof_of_address_date?: string | null
  proof_of_address_expiry?: string | null
  tax_id_number?: string | null
}

type Deal = {
  id: string
  name: string
  status: string
  target_amount: number | null
  created_at: string
}

/**
 * Lawyer Detail Page for Unified Portal (versotech_main)
 *
 * Persona-aware access:
 * - Staff/CEO personas: Full access to lawyer details
 * - Other personas: Access denied
 */
export default async function LawyerDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const clientSupabase = await createClient()
  const { data: { user }, error: userError } = await clientSupabase.auth.getUser()

  if (!user || userError) {
    redirect('/versotech_main/login')
  }

  // Check if user has staff persona for access
  const hasStaffAccess = await checkStaffAccess(user.id)
  const serviceClient = createServiceClient()

  if (!hasStaffAccess) {
    return (
      <div>
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Access Restricted
          </h3>
          <p className="text-muted-foreground">
            Lawyer details are only available to staff members.
          </p>
        </div>
      </div>
    )
  }

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
