import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { InvestorProfileClient } from '@/components/investor-profile/investor-profile-client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function InvestorProfilePage() {
  const supabase = await createClient()

  // Get the current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/versotech_main/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, display_name, email, avatar_url')
    .eq('id', user.id)
    .single()

  // Use service client to bypass RLS for investor lookups
  const serviceSupabase = createServiceClient()

  // Check if user is associated with an investor
  const { data: investorUser } = await serviceSupabase
    .from('investor_users')
    .select('investor_id, role, is_primary, can_sign')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!investorUser) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold text-foreground mb-2">No Investor Association</h1>
          <p className="text-muted-foreground">
            Your account is not associated with any investor entity.
            Please contact support if you believe this is an error.
          </p>
        </div>
      </div>
    )
  }

  // Fetch investor details
  const { data: investor } = await serviceSupabase
    .from('investors')
    .select('*')
    .eq('id', investorUser.investor_id)
    .single()

  if (!investor) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold text-foreground mb-2">Investor Not Found</h1>
          <p className="text-muted-foreground">
            The investor entity associated with your account could not be found.
          </p>
        </div>
      </div>
    )
  }

  return (
    <InvestorProfileClient
      userEmail={user.email || ''}
      profile={profile ? {
        full_name: profile.display_name,
        email: profile.email,
        avatar_url: profile.avatar_url
      } : null}
      investorInfo={{
        id: investor.id,
        legal_name: investor.legal_name,
        display_name: investor.display_name,
        type: investor.type,
        status: investor.status,
        kyc_status: investor.kyc_status,
        onboarding_status: investor.onboarding_status,
        country: investor.country,
        country_of_incorporation: investor.country_of_incorporation,
        entity_identifier: investor.entity_identifier,
        tax_residency: investor.tax_residency,
        email: investor.email,
        phone: investor.phone,
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
        middle_initial: investor.middle_initial,
        last_name: investor.last_name,
        name_suffix: investor.name_suffix,
        date_of_birth: investor.date_of_birth,
        country_of_birth: investor.country_of_birth,
        nationality: investor.nationality,
        // Residential address (for individuals)
        residential_street: investor.residential_street,
        residential_line_2: investor.residential_line_2,
        residential_city: investor.residential_city,
        residential_state: investor.residential_state,
        residential_postal_code: investor.residential_postal_code,
        residential_country: investor.residential_country,
        // Contact
        phone_mobile: investor.phone_mobile,
        phone_office: investor.phone_office,
        // US Tax compliance
        is_us_citizen: investor.is_us_citizen,
        is_us_taxpayer: investor.is_us_taxpayer,
        us_taxpayer_id: investor.us_taxpayer_id,
        country_of_tax_residency: investor.country_of_tax_residency,
        tax_id_number: investor.tax_id_number,
        // ID Document
        id_type: investor.id_type,
        id_number: investor.id_number,
        id_issue_date: investor.id_issue_date,
        id_expiry_date: investor.id_expiry_date,
        id_issuing_country: investor.id_issuing_country,
        // Mailing/Contact address fields
        address_line_1: investor.address_line_1,
        address_line_2: investor.address_line_2,
        state_province: investor.state_province,
        postal_code: investor.postal_code,
        // Structured Registered Address (for entities)
        registered_address_line_1: investor.registered_address_line_1,
        registered_address_line_2: investor.registered_address_line_2,
        registered_city: investor.registered_city,
        registered_state: investor.registered_state,
        registered_postal_code: investor.registered_postal_code,
        registered_country: investor.registered_country,
      }}
      investorUserInfo={{
        role: investorUser.role,
        is_primary: investorUser.is_primary,
        can_sign: investorUser.can_sign || false
      }}
    />
  )
}
