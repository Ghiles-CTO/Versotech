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
    .select('partner_id, role, is_primary, can_sign, signature_specimen_url, signature_specimen_uploaded_at')
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
    .select(`
      id,
      name,
      legal_name,
      type,
      partner_type,
      status,
      contact_name,
      contact_email,
      contact_phone,
      website,
      address_line_1,
      address_line_2,
      city,
      postal_code,
      country,
      preferred_sectors,
      preferred_geographies,
      kyc_status,
      logo_url
    `)
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
        city: partner.city,
        postal_code: partner.postal_code,
        country: partner.country,
        preferred_sectors: partner.preferred_sectors,
        preferred_geographies: partner.preferred_geographies,
        kyc_status: partner.kyc_status,
        logo_url: partner.logo_url
      }}
      partnerUserInfo={{
        role: partnerUser.role,
        is_primary: partnerUser.is_primary,
        can_sign: partnerUser.can_sign || false,
        signature_specimen_url: partnerUser.signature_specimen_url,
        signature_specimen_uploaded_at: partnerUser.signature_specimen_uploaded_at
      }}
    />
  )
}
