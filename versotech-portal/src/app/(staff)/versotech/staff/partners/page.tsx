import { createServiceClient } from '@/lib/supabase/server'
import { PartnersDashboard } from '@/components/staff/partners/partners-dashboard'

export const dynamic = 'force-dynamic'

export default async function PartnersPage() {
  const supabase = createServiceClient()

  // Fetch all partners
  const { data: partners, error } = await supabase
    .from('partners')
    .select(`
      id,
      name,
      legal_name,
      type,
      partner_type,
      status,
      kyc_status,
      contact_name,
      contact_email,
      country,
      typical_investment_min,
      typical_investment_max,
      preferred_sectors,
      created_at
    `)
    .order('name', { ascending: true })

  if (error) {
    console.error('Failed to fetch partners:', error)
  }

  const partnersList = (partners || []).map((p) => ({
    id: p.id,
    name: p.name,
    legalName: p.legal_name,
    type: p.type,
    partnerType: p.partner_type,
    status: p.status,
    kycStatus: p.kyc_status,
    contactName: p.contact_name,
    contactEmail: p.contact_email,
    country: p.country,
    typicalInvestmentMin: p.typical_investment_min,
    typicalInvestmentMax: p.typical_investment_max,
    preferredSectors: p.preferred_sectors,
    createdAt: p.created_at,
  }))

  // Calculate summary stats
  const summary = {
    totalPartners: partnersList.length,
    activePartners: partnersList.filter((p) => p.status === 'active').length,
    kycApproved: partnersList.filter((p) => p.kycStatus === 'approved').length,
    kycPending: partnersList.filter((p) => p.kycStatus === 'pending').length,
  }

  return <PartnersDashboard summary={summary} partners={partnersList} />
}
