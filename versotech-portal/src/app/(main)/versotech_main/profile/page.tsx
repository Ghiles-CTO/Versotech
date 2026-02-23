import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { ProfilePageClient } from '@/components/profile/profile-page-client'
import { fetchMemberWithAutoLink } from '@/lib/kyc/member-linking'
import { resolvePrimaryInvestorLink } from '@/lib/kyc/investor-link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const resolvedSearchParams = await searchParams
  const defaultTab = resolvedSearchParams.tab || 'overview'
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  // Get the current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/versotech_main/login')
  }

  // Get active persona from cookie (set by persona switcher)
  const cookieStore = await cookies()
  const activePersonaType = cookieStore.get('verso_active_persona_type')?.value

  // Fetch complete profile data
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    return (
      <div>
        <div className="max-w-2xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold text-foreground mb-2">Error Loading Profile</h1>
          <p className="text-muted-foreground">
            Unable to load your profile data. Please try again.
          </p>
        </div>
      </div>
    )
  }

  // ALWAYS check if user has an investor link - we need this data regardless of persona
  let investorInfo = null
  let investorUserInfo = null
  let latestEntityInfoSnapshot: Record<string, unknown> | null = null

  // Check if user is associated with an investor
  const { link: investorUser, error: investorUserError } = await resolvePrimaryInvestorLink(
    serviceSupabase,
    user.id,
    'investor_id, role, is_primary, can_sign'
  )

  if (investorUserError) {
    console.error('[ProfilePage] Error fetching investor_users:', investorUserError)
  }

  console.log('[ProfilePage] investorUser result:', { investorUser, investorUserError })

  // Also fetch the user's linked member record for personal KYC
  let memberInfo = null

  if (investorUser) {
    // Fetch the user's member record (linked via linked_user_id)
    const { member: memberData, error: memberError } = await fetchMemberWithAutoLink({
      supabase: serviceSupabase,
      memberTable: 'investor_members',
      entityIdColumn: 'investor_id',
      entityId: investorUser.investor_id,
      userId: user.id,
      userEmail: user.email,
      defaultFullName:
        profile.full_name ||
        profile.display_name ||
        user.email ||
        null,
      createIfMissing: true,
      context: 'ProfilePage',
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
      console.error('[ProfilePage] Error fetching member:', memberError)
    } else if (memberData) {
      memberInfo = memberData
    }

    // Fetch investor entity details including KYC fields
    const { data: investor, error: investorError } = await serviceSupabase
      .from('investors')
      .select(`
        id,
        legal_name,
        display_name,
        type,
        status,
        account_approval_status,
        kyc_status,
        onboarding_status,
        country,
        country_of_incorporation,
        tax_residency,
        email,
        phone,
        website,
        registered_address,
        city,
        representative_name,
        representative_title,
        is_professional_investor,
        is_qualified_purchaser,
        aml_risk_rating,
        logo_url,
        first_name,
        middle_name,
        last_name,
        name_suffix,
        date_of_birth,
        country_of_birth,
        nationality,
        phone_mobile,
        phone_office,
        residential_street,
        residential_line_2,
        residential_city,
        residential_state,
        residential_postal_code,
        residential_country,
        registered_address_line_1,
        registered_address_line_2,
        registered_city,
        registered_state,
        registered_postal_code,
        registered_country,
        is_us_citizen,
        is_us_taxpayer,
        us_taxpayer_id,
        id_type,
        id_number,
        id_issue_date,
        id_expiry_date,
        id_issuing_country,
        middle_initial,
        proof_of_address_date,
        proof_of_address_expiry,
        tax_id_number
      `)
      .eq('id', investorUser.investor_id)
      .single()

    if (investorError) {
      console.error('[ProfilePage] Error fetching investor:', investorError)
    }

    console.log('[ProfilePage] investor result:', { investor: investor?.id, investorError })

    if (investor) {
      investorInfo = {
        id: investor.id,
        legal_name: investor.legal_name,
        display_name: investor.display_name,
        type: investor.type,
        status: investor.status,
        account_approval_status: investor.account_approval_status,
        kyc_status: investor.kyc_status,
        onboarding_status: investor.onboarding_status,
        country: investor.country,
        country_of_incorporation: investor.country_of_incorporation,
        tax_residency: investor.tax_residency,
        email: investor.email,
        phone: investor.phone,
        website: investor.website,
        registered_address: investor.registered_address,
        city: investor.city,
        representative_name: investor.representative_name,
        representative_title: investor.representative_title,
        is_professional_investor: investor.is_professional_investor,
        is_qualified_purchaser: investor.is_qualified_purchaser,
        aml_risk_rating: investor.aml_risk_rating,
        logo_url: investor.logo_url,
        // Individual KYC fields
        first_name: investor.first_name,
        middle_name: investor.middle_name,
        last_name: investor.last_name,
        name_suffix: investor.name_suffix,
        date_of_birth: investor.date_of_birth,
        country_of_birth: investor.country_of_birth,
        nationality: investor.nationality,
        // Phone numbers
        phone_mobile: investor.phone_mobile,
        phone_office: investor.phone_office,
        // Residential address (for individuals)
        residential_street: investor.residential_street,
        residential_line_2: investor.residential_line_2,
        residential_city: investor.residential_city,
        residential_state: investor.residential_state,
        residential_postal_code: investor.residential_postal_code,
        residential_country: investor.residential_country,
        // Registered address (for entities)
        registered_address_line_1: investor.registered_address_line_1,
        registered_address_line_2: investor.registered_address_line_2,
        registered_city: investor.registered_city,
        registered_state: investor.registered_state,
        registered_postal_code: investor.registered_postal_code,
        registered_country: investor.registered_country,
        // US Tax compliance
        is_us_citizen: investor.is_us_citizen,
        is_us_taxpayer: investor.is_us_taxpayer,
        us_taxpayer_id: investor.us_taxpayer_id,
        country_of_tax_residency: investor.tax_residency,  // Column is named tax_residency in DB
        // ID Document
        id_type: investor.id_type,
        id_number: investor.id_number,
        id_issue_date: investor.id_issue_date,
        id_expiry_date: investor.id_expiry_date,
        id_issuing_country: investor.id_issuing_country,
        // Additional KYC fields
        middle_initial: investor.middle_initial,
        proof_of_address_date: investor.proof_of_address_date,
        proof_of_address_expiry: investor.proof_of_address_expiry,
        tax_id_number: investor.tax_id_number,
      }

      investorUserInfo = {
        role: investorUser.role,
        is_primary: investorUser.is_primary,
        can_sign: investorUser.can_sign || false
      }

      const { data: latestEntityInfoSubmission, error: latestEntityInfoError } = await serviceSupabase
        .from('kyc_submissions')
        .select('metadata')
        .eq('investor_id', investor.id)
        .eq('document_type', 'entity_info')
        .order('submitted_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (latestEntityInfoError) {
        console.error('[ProfilePage] Error fetching latest entity_info snapshot:', latestEntityInfoError)
      } else {
        const reviewSnapshot = (latestEntityInfoSubmission?.metadata as Record<string, unknown> | undefined)?.review_snapshot
        if (reviewSnapshot && typeof reviewSnapshot === 'object' && !Array.isArray(reviewSnapshot)) {
          latestEntityInfoSnapshot = reviewSnapshot as Record<string, unknown>
        }
      }
    }
  }

  // Determine variant based on active persona cookie
  // If persona is 'investor' OR user has investor link and no persona set, show investor profile
  const staffPersonaTypes = ['ceo', 'staff']
  const isActivePersonaStaff = activePersonaType ? staffPersonaTypes.includes(activePersonaType) : false
  const isProfileRoleStaff = ['staff_admin', 'staff_ops', 'staff_rm', 'staff', 'admin'].includes(profile.role)

  // Show investor profile if:
  // 1. Active persona is 'investor', OR
  // 2. User has investor link AND (no active persona OR active persona is investor-type)
  const hasInvestorLink = !!investorInfo
  const showAsStaff = activePersonaType
    ? isActivePersonaStaff && !hasInvestorLink  // Staff persona but ONLY if no investor link
    : isProfileRoleStaff && !hasInvestorLink     // Staff role but ONLY if no investor link

  // Debug logging
  console.log('[ProfilePage] Debug:', {
    email: profile.email,
    activePersonaType,
    isActivePersonaStaff,
    isProfileRoleStaff,
    hasInvestorLink,
    showAsStaff,
    variant: showAsStaff ? 'staff' : 'investor',
    investorInfo: investorInfo ? { id: investorInfo.id, legal_name: investorInfo.legal_name, type: investorInfo.type } : null,
    investorUserInfo,
  })

  return (
    <ProfilePageClient
      userEmail={user.email || ''}
      profile={{
        id: profile.id,
        email: profile.email,
        display_name: profile.display_name,
        full_name: profile.display_name,
        title: profile.title,
        avatar_url: profile.avatar_url,
        phone: profile.phone,
        office_location: profile.office_location,
        bio: profile.bio,
        role: profile.role,
        created_at: profile.created_at
      }}
      variant={showAsStaff ? 'staff' : 'investor'}
      defaultTab={defaultTab}
      investorInfo={investorInfo}
      investorUserInfo={investorUserInfo}
      memberInfo={memberInfo}
      latestEntityInfoSnapshot={latestEntityInfoSnapshot}
    />
  )
}
