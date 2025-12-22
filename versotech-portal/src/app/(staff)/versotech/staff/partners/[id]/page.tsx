import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { PartnerDetailClient } from '@/components/staff/partners/partner-detail-client'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function PartnerDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = createServiceClient()

  // Fetch partner details
  const { data: partner, error: partnerError } = await supabase
    .from('partners')
    .select('*')
    .eq('id', id)
    .single()

  if (partnerError || !partner) {
    console.error('Failed to fetch partner:', partnerError)
    notFound()
  }

  // Get document count for this partner
  const { count: documentCount } = await supabase
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
  }

  return (
    <PartnerDetailClient
      partner={partnerData}
      metrics={{ documentCount: documentCount || 0 }}
    />
  )
}
