import { createClient, createServiceClient } from '@/lib/supabase/server'
import { AlertCircle } from 'lucide-react'
import { CommercialPartnerProfileClient } from '@/components/commercial-partner-profile/commercial-partner-profile-client'
import { fetchMemberWithAutoLink } from '@/lib/kyc/member-linking'

export const dynamic = 'force-dynamic'

export default async function CommercialPartnerProfilePage() {
  const clientSupabase = await createClient()
  const { data: { user }, error: userError } = await clientSupabase.auth.getUser()

  if (!user || userError) {
    return (
      <div>
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
      <div>
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
      <div>
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

  // Fetch the user's member record for personal KYC (linked via linked_user_id)
  const { member: memberData, error: memberError } = await fetchMemberWithAutoLink({
    supabase: serviceSupabase,
    memberTable: 'commercial_partner_members',
    entityIdColumn: 'commercial_partner_id',
    entityId: cpUser.commercial_partner_id,
    userId: user.id,
    userEmail: user.email,
    defaultFullName: profile?.display_name || user.email || null,
    createIfMissing: true,
    context: 'CommercialPartnerProfilePage',
    select: `
      id,
      full_name,
      first_name,
      middle_name,
      last_name,
      name_suffix,
      role,
      email,
      phone,
      phone_mobile,
      phone_office,
      date_of_birth,
      country_of_birth,
      nationality,
      residential_street,
      residential_line_2,
      residential_city,
      residential_state,
      residential_postal_code,
      residential_country,
      is_us_citizen,
      is_us_taxpayer,
      us_taxpayer_id,
      country_of_tax_residency,
      tax_id_number,
      id_type,
      id_number,
      id_issue_date,
      id_expiry_date,
      id_issuing_country,
      kyc_status,
      kyc_approved_at,
      kyc_notes
    `,
  })

  if (memberError) {
    console.error('[CommercialPartnerProfilePage] Error fetching member:', memberError)
  }

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
        // Phone numbers
        phone_mobile: commercialPartner.phone_mobile,
        phone_office: commercialPartner.phone_office,
        email: commercialPartner.email,
        // Individual KYC fields
        first_name: commercialPartner.first_name,
        middle_name: commercialPartner.middle_name,
        last_name: commercialPartner.last_name,
        name_suffix: commercialPartner.name_suffix,
        date_of_birth: commercialPartner.date_of_birth,
        country_of_birth: commercialPartner.country_of_birth,
        nationality: commercialPartner.nationality,
        // US Tax compliance
        is_us_citizen: commercialPartner.is_us_citizen,
        is_us_taxpayer: commercialPartner.is_us_taxpayer,
        us_taxpayer_id: commercialPartner.us_taxpayer_id,
        country_of_tax_residency: commercialPartner.country_of_tax_residency,
        // ID Document
        id_type: commercialPartner.id_type,
        id_number: commercialPartner.id_number,
        id_issue_date: commercialPartner.id_issue_date,
        id_expiry_date: commercialPartner.id_expiry_date,
        id_issuing_country: commercialPartner.id_issuing_country,
        // Residential Address (for individuals)
        residential_street: commercialPartner.residential_street,
        residential_line_2: commercialPartner.residential_line_2,
        residential_city: commercialPartner.residential_city,
        residential_state: commercialPartner.residential_state,
        residential_postal_code: commercialPartner.residential_postal_code,
        residential_country: commercialPartner.residential_country,
        // Additional KYC fields
        middle_initial: commercialPartner.middle_initial,
        proof_of_address_date: commercialPartner.proof_of_address_date,
        proof_of_address_expiry: commercialPartner.proof_of_address_expiry,
        tax_id_number: commercialPartner.tax_id_number,
      } : null}
      cpUserInfo={{
        role: cpUser.role,
        is_primary: cpUser.is_primary,
        can_sign: cpUser.can_sign || false,
        can_execute_for_clients: cpUser.can_execute_for_clients || false,
      }}
      agreementCount={agreementCount || 0}
      memberInfo={memberData || null}
    />
  )
}
