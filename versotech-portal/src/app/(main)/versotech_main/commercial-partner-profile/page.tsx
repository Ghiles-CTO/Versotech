import { createClient, createServiceClient } from '@/lib/supabase/server'
import { AlertCircle } from 'lucide-react'
import { CommercialPartnerProfileClient } from '@/components/commercial-partner-profile/commercial-partner-profile-client'

export const dynamic = 'force-dynamic'

export default async function CommercialPartnerProfilePage() {
  const clientSupabase = await createClient()
  const { data: { user }, error: userError } = await clientSupabase.auth.getUser()

  if (!user || userError) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Authentication Required
          </h3>
          <p className="text-muted-foreground">
            Please log in to view your profile.
          </p>
        </div>
      </div>
    )
  }

  const serviceSupabase = createServiceClient()

  // Check if user is a commercial partner
  const { data: personas } = await serviceSupabase.rpc('get_user_personas', {
    p_user_id: user.id
  })

  const cpPersona = personas?.find((p: any) => p.persona_type === 'commercial_partner')

  if (!cpPersona) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Commercial Partner Access Required
          </h3>
          <p className="text-muted-foreground">
            This section is available only to commercial partner users.
          </p>
        </div>
      </div>
    )
  }

  // Get commercial partner user info
  const { data: cpUser } = await serviceSupabase
    .from('commercial_partner_users')
    .select('commercial_partner_id, role, is_primary, can_sign, can_execute_for_clients')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!cpUser?.commercial_partner_id) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No Commercial Partner Profile Linked
          </h3>
          <p className="text-muted-foreground">
            Please contact the VERSO team to link your commercial partner profile.
          </p>
        </div>
      </div>
    )
  }

  // Get commercial partner entity details
  const { data: commercialPartner } = await serviceSupabase
    .from('commercial_partners')
    .select('*')
    .eq('id', cpUser.commercial_partner_id)
    .maybeSingle()

  // Get user profile info
  const { data: profile } = await serviceSupabase
    .from('profiles')
    .select('display_name, email, avatar_url')
    .eq('id', user.id)
    .maybeSingle()

  // Get placement agreements count for this commercial partner
  const { count: agreementCount } = await serviceSupabase
    .from('placement_agreements')
    .select('id', { count: 'exact', head: true })
    .eq('commercial_partner_id', cpUser.commercial_partner_id)

  return (
    <CommercialPartnerProfileClient
      userEmail={user.email || ''}
      profile={profile ? {
        full_name: profile.display_name,
        email: profile.email || user.email || '',
        avatar_url: profile.avatar_url
      } : null}
      cpInfo={commercialPartner ? {
        id: commercialPartner.id,
        name: commercialPartner.name,
        legal_name: commercialPartner.legal_name,
        type: commercialPartner.type,
        cp_type: commercialPartner.cp_type,
        status: commercialPartner.status,
        regulatory_status: commercialPartner.regulatory_status,
        regulatory_number: commercialPartner.regulatory_number,
        jurisdiction: commercialPartner.jurisdiction,
        contact_name: commercialPartner.contact_name,
        contact_email: commercialPartner.contact_email,
        contact_phone: commercialPartner.contact_phone,
        website: commercialPartner.website,
        payment_terms: commercialPartner.payment_terms,
        contract_start_date: commercialPartner.contract_start_date,
        contract_end_date: commercialPartner.contract_end_date,
        notes: commercialPartner.notes,
        created_at: commercialPartner.created_at,
        logo_url: commercialPartner.logo_url,
        kyc_status: commercialPartner.kyc_status,
      } : null}
      cpUserInfo={{
        role: cpUser.role,
        is_primary: cpUser.is_primary,
        can_sign: cpUser.can_sign || false,
        can_execute_for_clients: cpUser.can_execute_for_clients || false,
      }}
      agreementCount={agreementCount || 0}
    />
  )
}
