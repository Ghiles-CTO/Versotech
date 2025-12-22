import { createServiceClient } from '@/lib/supabase/server'
import { CommercialPartnersDashboard } from '@/components/staff/commercial-partners/commercial-partners-dashboard'

export const dynamic = 'force-dynamic'

export default async function CommercialPartnersPage() {
  const supabase = createServiceClient()

  // Fetch all commercial partners
  const { data: partners, error } = await supabase
    .from('commercial_partners')
    .select(`
      id,
      name,
      legal_name,
      type,
      cp_type,
      status,
      kyc_status,
      regulatory_status,
      jurisdiction,
      contact_name,
      contact_email,
      country,
      created_at
    `)
    .order('name', { ascending: true })

  if (error) {
    console.error('Failed to fetch commercial partners:', error)
  }

  const partnersList = (partners || []).map((p) => ({
    id: p.id,
    name: p.name,
    legalName: p.legal_name,
    type: p.type,
    cpType: p.cp_type,
    status: p.status,
    kycStatus: p.kyc_status,
    regulatoryStatus: p.regulatory_status,
    jurisdiction: p.jurisdiction,
    contactName: p.contact_name,
    contactEmail: p.contact_email,
    country: p.country,
    createdAt: p.created_at,
  }))

  // Calculate summary stats
  const summary = {
    totalPartners: partnersList.length,
    activePartners: partnersList.filter((p) => p.status === 'active').length,
    kycApproved: partnersList.filter((p) => p.kycStatus === 'approved').length,
    kycPending: partnersList.filter((p) => p.kycStatus === 'pending').length,
  }

  return <CommercialPartnersDashboard summary={summary} partners={partnersList} />
}
