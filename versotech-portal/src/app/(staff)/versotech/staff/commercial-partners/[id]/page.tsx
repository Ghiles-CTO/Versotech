import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { CommercialPartnerDetailClient } from '@/components/staff/commercial-partners/commercial-partner-detail-client'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function CommercialPartnerDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = createServiceClient()

  // Fetch commercial partner details
  const { data: partner, error: partnerError } = await supabase
    .from('commercial_partners')
    .select('*')
    .eq('id', id)
    .single()

  if (partnerError || !partner) {
    console.error('Failed to fetch commercial partner:', partnerError)
    notFound()
  }

  // Fetch linked users separately to avoid nested join issues
  const { data: partnerUsers } = await supabase
    .from('commercial_partner_users')
    .select(`
      user_id,
      role,
      is_primary,
      can_sign,
      can_execute_for_clients,
      created_at
    `)
    .eq('commercial_partner_id', id)

  // Fetch user profiles for the linked users
  let linkedUsers: Array<{
    userId: string
    email: string
    displayName: string | null
    title: string | null
    role: string
    isPrimary: boolean
    canSign: boolean
    canExecuteForClients: boolean
    createdAt: string
  }> = []

  if (partnerUsers && partnerUsers.length > 0) {
    const userIds = partnerUsers.map((pu) => pu.user_id)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email, display_name, title')
      .in('id', userIds)

    if (profiles) {
      linkedUsers = partnerUsers.map((pu) => {
        const profile = profiles.find((p) => p.id === pu.user_id)
        return {
          userId: pu.user_id,
          email: profile?.email || '',
          displayName: profile?.display_name || null,
          title: profile?.title || null,
          role: pu.role,
          isPrimary: pu.is_primary,
          canSign: pu.can_sign || false,
          canExecuteForClients: pu.can_execute_for_clients || false,
          createdAt: pu.created_at,
        }
      })
    }
  }

  // Get document count for this commercial partner
  const { count: documentCount } = await supabase
    .from('documents')
    .select('*', { count: 'exact', head: true })
    .eq('entity_type', 'commercial_partner')
    .eq('entity_id', id)

  // Transform to client format
  const partnerData = {
    id: partner.id,
    name: partner.name,
    legal_name: partner.legal_name,
    type: partner.type,
    cp_type: partner.cp_type,
    status: partner.status,
    regulatory_status: partner.regulatory_status,
    regulatory_number: partner.regulatory_number,
    jurisdiction: partner.jurisdiction,
    contact_name: partner.contact_name,
    contact_email: partner.contact_email,
    contact_phone: partner.contact_phone,
    website: partner.website,
    address_line_1: partner.address_line_1,
    address_line_2: partner.address_line_2,
    city: partner.city,
    postal_code: partner.postal_code,
    country: partner.country,
    payment_terms: partner.payment_terms,
    contract_start_date: partner.contract_start_date,
    contract_end_date: partner.contract_end_date,
    notes: partner.notes,
    kyc_status: partner.kyc_status,
    kyc_notes: partner.kyc_notes,
    kyc_approved_at: partner.kyc_approved_at,
    kyc_expires_at: partner.kyc_expires_at,
    logo_url: partner.logo_url,
    created_at: partner.created_at,
    updated_at: partner.updated_at,
  }

  return (
    <CommercialPartnerDetailClient
      partner={partnerData}
      linkedUsers={linkedUsers}
      documentCount={documentCount || 0}
    />
  )
}
