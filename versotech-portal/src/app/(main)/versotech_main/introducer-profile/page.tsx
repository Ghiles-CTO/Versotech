import { createClient, createServiceClient } from '@/lib/supabase/server'
import { AlertCircle } from 'lucide-react'
import { IntroducerProfileClient } from '@/components/introducer-profile/introducer-profile-client'
import { fetchMemberWithAutoLink } from '@/lib/kyc/member-linking'

export const dynamic = 'force-dynamic'

export default async function IntroducerProfilePage() {
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

  // Check if user is an introducer
  const { data: personas } = await serviceSupabase.rpc('get_user_personas', {
    p_user_id: user.id
  })

  const introducerPersona = personas?.find((p: any) => p.persona_type === 'introducer')

  if (!introducerPersona) {
    return (
      <div>
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Introducer Access Required
          </h3>
          <p className="text-muted-foreground">
            This section is available only to introducer users.
          </p>
        </div>
      </div>
    )
  }

  // Get introducer user info
  const { data: introducerUser } = await serviceSupabase
    .from('introducer_users')
    .select('introducer_id, role, is_primary, can_sign')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!introducerUser?.introducer_id) {
    return (
      <div>
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No Introducer Profile Linked
          </h3>
          <p className="text-muted-foreground">
            Please contact the VERSO team to link your introducer profile.
          </p>
        </div>
      </div>
    )
  }

  // Get introducer entity details
  const { data: introducer } = await serviceSupabase
    .from('introducers')
    .select('*')
    .eq('id', introducerUser.introducer_id)
    .maybeSingle()

  // Get user profile info
  const { data: profile } = await serviceSupabase
    .from('profiles')
    .select('display_name, email, avatar_url')
    .eq('id', user.id)
    .maybeSingle()

  // Get active agreement for this introducer
  const { data: activeAgreement } = await serviceSupabase
    .from('introducer_agreements')
    .select('id, agreement_type, default_commission_bps, territory, status, effective_date, expiry_date')
    .eq('introducer_id', introducerUser.introducer_id)
    .eq('status', 'active')
    .maybeSingle()

  // Get introduction count for this introducer
  const { count: introductionCount } = await serviceSupabase
    .from('introductions')
    .select('id', { count: 'exact', head: true })
    .eq('introducer_id', introducerUser.introducer_id)

  // Fetch the user's member record for personal KYC (linked via linked_user_id)
  const { member: memberData, error: memberError } = await fetchMemberWithAutoLink({
    supabase: serviceSupabase,
    memberTable: 'introducer_members',
    entityIdColumn: 'introducer_id',
    entityId: introducerUser.introducer_id,
    userId: user.id,
    userEmail: user.email,
    context: 'IntroducerProfilePage',
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
    console.error('[IntroducerProfilePage] Error fetching member:', memberError)
  }

  return (
    <IntroducerProfileClient
      userEmail={user.email || ''}
      profile={profile ? {
        full_name: profile.display_name,
        email: profile.email || user.email || '',
        avatar_url: profile.avatar_url
      } : null}
      introducerInfo={introducer ? {
        id: introducer.id,
        legal_name: introducer.legal_name,
        contact_name: introducer.contact_name,
        email: introducer.email,
        default_commission_bps: introducer.default_commission_bps,
        payment_terms: introducer.payment_terms,
        commission_cap_amount: introducer.commission_cap_amount,
        status: introducer.status,
        notes: introducer.notes,
        created_at: introducer.created_at,
        logo_url: introducer.logo_url,
        kyc_status: introducer.kyc_status,
        // Entity type
        type: introducer.type,
        // Address fields
        address_line_1: introducer.address_line_1,
        address_line_2: introducer.address_line_2,
        city: introducer.city,
        state_province: introducer.state_province,
        postal_code: introducer.postal_code,
        country: introducer.country,
        // Phone/contact
        phone: introducer.phone,
        phone_mobile: introducer.phone_mobile,
        phone_office: introducer.phone_office,
        website: introducer.website,
        // Individual KYC fields
        first_name: introducer.first_name,
        middle_name: introducer.middle_name,
        last_name: introducer.last_name,
        name_suffix: introducer.name_suffix,
        date_of_birth: introducer.date_of_birth,
        country_of_birth: introducer.country_of_birth,
        nationality: introducer.nationality,
        // US Tax compliance
        is_us_citizen: introducer.is_us_citizen,
        is_us_taxpayer: introducer.is_us_taxpayer,
        us_taxpayer_id: introducer.us_taxpayer_id,
        country_of_tax_residency: introducer.country_of_tax_residency,
        // ID Document
        id_type: introducer.id_type,
        id_number: introducer.id_number,
        id_issue_date: introducer.id_issue_date,
        id_expiry_date: introducer.id_expiry_date,
        id_issuing_country: introducer.id_issuing_country,
        // Residential Address
        residential_street: introducer.residential_street,
        residential_city: introducer.residential_city,
        residential_state: introducer.residential_state,
        residential_postal_code: introducer.residential_postal_code,
        residential_country: introducer.residential_country,
        // Entity fields
        country_of_incorporation: introducer.country_of_incorporation,
        registration_number: introducer.registration_number,
        tax_id: introducer.tax_id,
        // Additional KYC fields
        residential_line_2: introducer.residential_line_2,
        middle_initial: introducer.middle_initial,
        proof_of_address_date: introducer.proof_of_address_date,
        proof_of_address_expiry: introducer.proof_of_address_expiry,
        tax_id_number: introducer.tax_id_number,
      } : null}
      introducerUserInfo={{
        role: introducerUser.role,
        is_primary: introducerUser.is_primary,
        can_sign: introducerUser.can_sign || false,
      }}
      activeAgreement={activeAgreement ? {
        id: activeAgreement.id,
        agreement_type: activeAgreement.agreement_type,
        commission_bps: activeAgreement.default_commission_bps,
        territory: activeAgreement.territory,
        status: activeAgreement.status,
        effective_date: activeAgreement.effective_date,
        expiry_date: activeAgreement.expiry_date,
      } : null}
      introductionCount={introductionCount || 0}
      memberInfo={memberData || null}
    />
  )
}
