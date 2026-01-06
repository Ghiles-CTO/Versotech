import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { PartnerProfileClient } from '@/components/partner-profile/partner-profile-client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function PartnerProfilePage() {
  const supabase = await createClient()

  // Get the current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/versotech_main/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, display_name, email, avatar_url, full_name')
    .eq('id', user.id)
    .single()

  // Use service client to bypass RLS for partner lookups
  const serviceSupabase = createServiceClient()

  // Check if user is associated with a partner
  const { data: partnerUser } = await serviceSupabase
    .from('partner_users')
    .select('partner_id, role, is_primary, can_sign')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!partnerUser) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold text-foreground mb-2">No Partner Association</h1>
          <p className="text-muted-foreground">
            Your account is not associated with any partner entity.
            Please contact support if you believe this is an error.
          </p>
        </div>
      </div>
    )
  }

  // Fetch partner details
  const { data: partner } = await serviceSupabase
    .from('partners')
    .select('*')
    .eq('id', partnerUser.partner_id)
    .single()

  if (!partner) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold text-foreground mb-2">Partner Not Found</h1>
          <p className="text-muted-foreground">
            The partner entity associated with your account could not be found.
          </p>
        </div>
      </div>
    )
  }

  return (
    <PartnerProfileClient
      userEmail={user.email || ''}
      profile={profile ? {
        full_name: profile.full_name || profile.display_name,
        email: profile.email,
        avatar_url: profile.avatar_url
      } : null}
      partnerInfo={{
        id: partner.id,
        name: partner.name,
        legal_name: partner.legal_name,
        type: partner.type,
        partner_type: partner.partner_type,
        status: partner.status,
        contact_name: partner.contact_name,
        contact_email: partner.contact_email,
        contact_phone: partner.contact_phone,
        website: partner.website,
        address_line_1: partner.address_line_1,
        address_line_2: partner.address_line_2,
        city: partner.city,
        state_province: partner.state_province,
        postal_code: partner.postal_code,
        country: partner.country,
        preferred_sectors: partner.preferred_sectors,
        preferred_geographies: partner.preferred_geographies,
        kyc_status: partner.kyc_status,
        logo_url: partner.logo_url,
        // Phone numbers
        phone: partner.phone,
        phone_mobile: partner.phone_mobile,
        phone_office: partner.phone_office,
        email: partner.email,
        // Individual KYC fields
        first_name: partner.first_name,
        middle_name: partner.middle_name,
        last_name: partner.last_name,
        name_suffix: partner.name_suffix,
        date_of_birth: partner.date_of_birth,
        country_of_birth: partner.country_of_birth,
        nationality: partner.nationality,
        // US Tax compliance
        is_us_citizen: partner.is_us_citizen,
        is_us_taxpayer: partner.is_us_taxpayer,
        us_taxpayer_id: partner.us_taxpayer_id,
        country_of_tax_residency: partner.country_of_tax_residency,
        // Entity fields
        country_of_incorporation: partner.country_of_incorporation,
        registration_number: partner.registration_number,
        tax_id: partner.tax_id,
        // ID Document
        id_type: partner.id_type,
        id_number: partner.id_number,
        id_issue_date: partner.id_issue_date,
        id_expiry_date: partner.id_expiry_date,
        id_issuing_country: partner.id_issuing_country,
        // Residential Address
        residential_street: partner.residential_street,
        residential_city: partner.residential_city,
        residential_state: partner.residential_state,
        residential_postal_code: partner.residential_postal_code,
        residential_country: partner.residential_country,
      }}
      partnerUserInfo={{
        role: partnerUser.role,
        is_primary: partnerUser.is_primary,
        can_sign: partnerUser.can_sign || false
      }}
    />
  )
}
