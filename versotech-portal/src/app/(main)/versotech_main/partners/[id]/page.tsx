import { createClient, createServiceClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { PartnerDetailClient } from '@/components/staff/partners/partner-detail-client'
import { AlertCircle } from 'lucide-react'
import { checkStaffAccess } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * Partner Detail Page for Unified Portal (versotech_main)
 *
 * Persona-aware access:
 * - Staff/CEO personas: Full access to partner details
 * - Other personas: Access denied
 */
export default async function PartnerDetailPage({
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
      <div className="p-6">
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Access Restricted
          </h3>
          <p className="text-muted-foreground">
            Partner details are only available to staff members.
          </p>
        </div>
      </div>
    )
  }

  // Fetch partner details
  const { data: partner, error: partnerError } = await serviceClient
    .from('partners')
    .select('*')
    .eq('id', id)
    .single()

  if (partnerError || !partner) {
    console.error('Failed to fetch partner:', partnerError)
    notFound()
  }

  // Get document count for this partner
  const { count: documentCount } = await serviceClient
    .from('documents')
    .select('*', { count: 'exact', head: true })
    .eq('entity_type', 'partner')
    .eq('entity_id', id)

  // Transform to client format
  const partnerData = {
    id: partner.id,
    name: partner.name,
    legal_name: partner.legal_name,
    type: partner.type,
    partner_type: partner.partner_type,
    status: partner.status,
    accreditation_status: partner.accreditation_status,
    contact_name: partner.contact_name,
    contact_email: partner.contact_email,
    contact_phone: partner.contact_phone,
    website: partner.website,
    address_line_1: partner.address_line_1,
    address_line_2: partner.address_line_2,
    city: partner.city,
    postal_code: partner.postal_code,
    country: partner.country,
    typical_investment_min: partner.typical_investment_min,
    typical_investment_max: partner.typical_investment_max,
    preferred_sectors: partner.preferred_sectors,
    preferred_geographies: partner.preferred_geographies,
    relationship_manager_id: partner.relationship_manager_id,
    notes: partner.notes,
    created_at: partner.created_at,
    created_by: partner.created_by,
    updated_at: partner.updated_at,
    kyc_status: partner.kyc_status,
    kyc_notes: partner.kyc_notes,
    kyc_approved_at: partner.kyc_approved_at,
    kyc_approved_by: partner.kyc_approved_by,
    kyc_expires_at: partner.kyc_expires_at,
    logo_url: partner.logo_url,
    // Individual KYC fields (for individual partners)
    first_name: partner.first_name,
    middle_name: partner.middle_name,
    last_name: partner.last_name,
    name_suffix: partner.name_suffix,
    date_of_birth: partner.date_of_birth,
    country_of_birth: partner.country_of_birth,
    nationality: partner.nationality,
    email: partner.email,
    phone_mobile: partner.phone_mobile,
    phone_office: partner.phone_office,
    // US Tax compliance
    is_us_citizen: partner.is_us_citizen,
    is_us_taxpayer: partner.is_us_taxpayer,
    us_taxpayer_id: partner.us_taxpayer_id,
    country_of_tax_residency: partner.country_of_tax_residency,
    // ID Document
    id_type: partner.id_type,
    id_number: partner.id_number,
    id_issue_date: partner.id_issue_date,
    id_expiry_date: partner.id_expiry_date,
    id_issuing_country: partner.id_issuing_country,
    // Residential Address
    residential_street: partner.residential_street,
    residential_line_2: partner.residential_line_2,
    residential_city: partner.residential_city,
    residential_state: partner.residential_state,
    residential_postal_code: partner.residential_postal_code,
    residential_country: partner.residential_country,
    // Additional KYC fields
    middle_initial: partner.middle_initial,
    proof_of_address_date: partner.proof_of_address_date,
    proof_of_address_expiry: partner.proof_of_address_expiry,
    tax_id_number: partner.tax_id_number,
  }

  return (
    <PartnerDetailClient
      partner={partnerData}
      metrics={{ documentCount: documentCount || 0 }}
    />
  )
}
