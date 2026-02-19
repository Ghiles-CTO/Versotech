import { createClient, createServiceClient } from '@/lib/supabase/server'
import { AlertCircle } from 'lucide-react'
import { LawyerProfileClient } from '@/components/lawyer/lawyer-profile-client'
import { fetchMemberWithAutoLink } from '@/lib/kyc/member-linking'

export const dynamic = 'force-dynamic'

export default async function LawyerProfilePage() {
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

  // Check if user is a lawyer
  const { data: personas } = await serviceSupabase.rpc('get_user_personas', {
    p_user_id: user.id
  })

  const isLawyer = personas?.some((p: any) => p.persona_type === 'lawyer') || false

  if (!isLawyer) {
    return (
      <div>
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Lawyer Access Required
          </h3>
          <p className="text-muted-foreground">
            This section is available only to assigned legal counsel.
          </p>
        </div>
      </div>
    )
  }

  // Get lawyer user info
  const { data: lawyerUser } = await serviceSupabase
    .from('lawyer_users')
    .select('lawyer_id, role, is_primary, can_sign')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!lawyerUser?.lawyer_id) {
    return (
      <div>
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No Lawyer Profile Linked
          </h3>
          <p className="text-muted-foreground">
            Please contact the VERSO team to link your lawyer profile.
          </p>
        </div>
      </div>
    )
  }

  // Get lawyer details with all KYC fields
  const { data: lawyer } = await serviceSupabase
    .from('lawyers')
    .select('*')
    .eq('id', lawyerUser.lawyer_id)
    .maybeSingle()

  // Get user profile info
  // Note: profiles has 'display_name' not 'full_name'
  const { data: profile } = await serviceSupabase
    .from('profiles')
    .select('display_name, email, avatar_url')
    .eq('id', user.id)
    .maybeSingle()

  // Fetch the user's member record for personal KYC (linked via linked_user_id)
  const { member: memberData, error: memberError } = await fetchMemberWithAutoLink({
    supabase: serviceSupabase,
    memberTable: 'lawyer_members',
    entityIdColumn: 'lawyer_id',
    entityId: lawyerUser.lawyer_id,
    userId: user.id,
    userEmail: user.email,
    defaultFullName: profile?.display_name || user.email || null,
    createIfMissing: true,
    context: 'LawyerProfilePage',
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
    console.error('[LawyerProfilePage] Error fetching member:', memberError)
  }

  return (
    <LawyerProfileClient
      userEmail={user.email || ''}
      profile={profile ? {
        full_name: profile.display_name, // Map display_name to full_name for client compat
        email: profile.email || user.email || '',
        avatar_url: profile.avatar_url
      } : null}
      lawyerInfo={lawyer ? {
        id: lawyer.id,
        firm_name: lawyer.firm_name,
        display_name: lawyer.display_name,
        specializations: lawyer.specializations ?? null,
        is_active: lawyer.is_active,
        phone: lawyer.primary_contact_phone,
        email: lawyer.primary_contact_email,
        primary_contact_name: lawyer.primary_contact_name,
        logo_url: lawyer.logo_url,
        kyc_status: lawyer.kyc_status,
        // Entity type
        type: lawyer.type,
        // Address fields
        address_line_1: lawyer.address_line_1,
        address_line_2: lawyer.address_line_2,
        city: lawyer.city,
        state_province: lawyer.state_province,
        postal_code: lawyer.postal_code,
        country: lawyer.country,
        // Phone numbers
        phone_mobile: lawyer.phone_mobile,
        phone_office: lawyer.phone_office,
        website: lawyer.website,
        // Entity fields
        registration_number: lawyer.registration_number,
        country_of_incorporation: lawyer.country_of_incorporation,
        tax_id: lawyer.tax_id,
        // Individual KYC fields
        first_name: lawyer.first_name,
        middle_name: lawyer.middle_name,
        last_name: lawyer.last_name,
        name_suffix: lawyer.name_suffix,
        date_of_birth: lawyer.date_of_birth,
        country_of_birth: lawyer.country_of_birth,
        nationality: lawyer.nationality,
        // US Tax compliance
        is_us_citizen: lawyer.is_us_citizen,
        is_us_taxpayer: lawyer.is_us_taxpayer,
        us_taxpayer_id: lawyer.us_taxpayer_id,
        country_of_tax_residency: lawyer.country_of_tax_residency,
        // ID Document
        id_type: lawyer.id_type,
        id_number: lawyer.id_number,
        id_issue_date: lawyer.id_issue_date,
        id_expiry_date: lawyer.id_expiry_date,
        id_issuing_country: lawyer.id_issuing_country,
        // Residential Address (for individuals)
        residential_street: lawyer.residential_street,
        residential_line_2: lawyer.residential_line_2,
        residential_city: lawyer.residential_city,
        residential_state: lawyer.residential_state,
        residential_postal_code: lawyer.residential_postal_code,
        residential_country: lawyer.residential_country,
        // Additional KYC fields
        middle_initial: lawyer.middle_initial,
        proof_of_address_date: lawyer.proof_of_address_date,
        proof_of_address_expiry: lawyer.proof_of_address_expiry,
        tax_id_number: lawyer.tax_id_number,
      } : null}
      lawyerUserInfo={{
        role: lawyerUser.role,
        is_primary: lawyerUser.is_primary,
        can_sign: lawyerUser.can_sign || false
      }}
      memberInfo={memberData || null}
    />
  )
}
