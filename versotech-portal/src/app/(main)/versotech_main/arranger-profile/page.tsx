import { createClient, createServiceClient } from '@/lib/supabase/server'
import { AlertCircle } from 'lucide-react'
import { ArrangerProfileClient } from './arranger-profile-client'

export const dynamic = 'force-dynamic'

export default async function ArrangerProfilePage() {
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

  // Check if user is an arranger
  const { data: personas } = await serviceSupabase.rpc('get_user_personas', {
    p_user_id: user.id
  })

  const arrangerPersona = personas?.find((p: any) => p.persona_type === 'arranger')

  if (!arrangerPersona) {
    return (
      <div>
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Arranger Access Required
          </h3>
          <p className="text-muted-foreground">
            This section is available only to arranger users.
          </p>
        </div>
      </div>
    )
  }

  // Get arranger user info
  const { data: arrangerUser } = await serviceSupabase
    .from('arranger_users')
    .select('arranger_id, role, is_primary, can_sign, signature_specimen_url, signature_specimen_uploaded_at')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!arrangerUser?.arranger_id) {
    return (
      <div>
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No Arranger Profile Linked
          </h3>
          <p className="text-muted-foreground">
            Please contact the VERSO team to link your arranger profile.
          </p>
        </div>
      </div>
    )
  }

  // Get arranger entity details
  const { data: arranger } = await serviceSupabase
    .from('arranger_entities')
    .select('*')
    .eq('id', arrangerUser.arranger_id)
    .maybeSingle()

  // Get user profile info
  const { data: profile } = await serviceSupabase
    .from('profiles')
    .select('display_name, email, avatar_url')
    .eq('id', user.id)
    .maybeSingle()

  // Get deal count for this arranger
  const { count: dealCount } = await serviceSupabase
    .from('deals')
    .select('id', { count: 'exact', head: true })
    .eq('arranger_entity_id', arrangerUser.arranger_id)

  // Fetch the user's member record for personal KYC (linked via linked_user_id)
  const { data: memberData, error: memberError } = await serviceSupabase
    .from('arranger_members')
    .select(`
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
    `)
    .eq('arranger_id', arrangerUser.arranger_id)
    .eq('linked_user_id', user.id)
    .maybeSingle()

  if (memberError) {
    console.error('[ArrangerProfilePage] Error fetching member:', memberError)
  }

  return (
    <ArrangerProfileClient
      userEmail={user.email || ''}
      profile={profile ? {
        full_name: profile.display_name,
        email: profile.email || user.email || '',
        avatar_url: profile.avatar_url
      } : null}
      arrangerInfo={arranger ? {
        id: arranger.id,
        legal_name: arranger.legal_name,
        company_name: arranger.legal_name, // Use legal_name as company_name doesn't exist
        registration_number: arranger.registration_number,
        tax_id: arranger.tax_id,
        regulator: arranger.regulator,
        license_number: arranger.license_number,
        license_type: arranger.license_type,
        license_expiry_date: arranger.license_expiry_date,
        email: arranger.email,
        phone: arranger.phone,
        address: arranger.address,
        kyc_status: arranger.kyc_status,
        kyc_approved_at: arranger.kyc_approved_at,
        kyc_expires_at: arranger.kyc_expires_at,
        status: arranger.status,
        is_active: arranger.status === 'active', // Derive from status
        created_at: arranger.created_at,
        logo_url: arranger.logo_url, // Pass logo URL for display and upload
        // Entity type
        type: arranger.type,
        // Phone numbers
        phone_mobile: arranger.phone_mobile,
        phone_office: arranger.phone_office,
        // Individual KYC fields
        first_name: arranger.first_name,
        middle_name: arranger.middle_name,
        last_name: arranger.last_name,
        name_suffix: arranger.name_suffix,
        date_of_birth: arranger.date_of_birth,
        country_of_birth: arranger.country_of_birth,
        nationality: arranger.nationality,
        // US Tax compliance
        is_us_citizen: arranger.is_us_citizen,
        is_us_taxpayer: arranger.is_us_taxpayer,
        us_taxpayer_id: arranger.us_taxpayer_id,
        country_of_tax_residency: arranger.country_of_tax_residency,
        // ID Document
        id_type: arranger.id_type,
        id_number: arranger.id_number,
        id_issue_date: arranger.id_issue_date,
        id_expiry_date: arranger.id_expiry_date,
        id_issuing_country: arranger.id_issuing_country,
        // Residential Address (for individuals)
        residential_street: arranger.residential_street,
        residential_line_2: arranger.residential_line_2,
        residential_city: arranger.residential_city,
        residential_state: arranger.residential_state,
        residential_postal_code: arranger.residential_postal_code,
        residential_country: arranger.residential_country,
        // Additional KYC fields
        middle_initial: arranger.middle_initial,
        proof_of_address_date: arranger.proof_of_address_date,
        proof_of_address_expiry: arranger.proof_of_address_expiry,
        tax_id_number: arranger.tax_id_number,
      } : null}
      arrangerUserInfo={{
        role: arrangerUser.role,
        is_active: true, // arranger_users doesn't have is_active, assume active
        can_sign: arrangerUser.can_sign || false,
        signature_specimen_url: arrangerUser.signature_specimen_url,
        signature_specimen_uploaded_at: arrangerUser.signature_specimen_uploaded_at
      }}
      dealCount={dealCount || 0}
      memberInfo={memberData || null}
    />
  )
}
