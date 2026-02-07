import { createClient, createServiceClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { CommercialPartnerDetailClient } from '@/components/staff/commercial-partners/commercial-partner-detail-client'
import { AlertCircle } from 'lucide-react'
import { checkStaffAccess } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * Commercial Partner Detail Page for Unified Portal (versotech_main)
 *
 * Persona-aware access:
 * - Staff/CEO personas: Full access to commercial partner details
 * - Other personas: Access denied
 */
export default async function CommercialPartnerDetailPage({
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
            Commercial partner details are only available to staff members.
          </p>
        </div>
      </div>
    )
  }

  // Fetch commercial partner details
  const { data: partner, error: partnerError } = await serviceClient
    .from('commercial_partners')
    .select('*')
    .eq('id', id)
    .single()

  if (partnerError || !partner) {
    console.error('Failed to fetch commercial partner:', partnerError)
    notFound()
  }

  // Fetch linked users separately to avoid nested join issues
  const { data: partnerUsers } = await serviceClient
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
    const { data: profiles } = await serviceClient
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
  const { count: documentCount } = await serviceClient
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
