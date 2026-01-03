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
    .select('id, display_name, email, avatar_url, full_name')
    .eq('id', user.id)
    .single()

  // Use service client to bypass RLS for investor lookups
  const serviceSupabase = createServiceClient()

  // Check if user is associated with an investor
  const { data: investorUser } = await serviceSupabase
    .from('investor_users')
    .select('investor_id, role, is_primary, can_sign, signature_specimen_url, signature_specimen_uploaded_at')
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
    .select(`
      id,
      legal_name,
      display_name,
      type,
      status,
      kyc_status,
      onboarding_status,
      country,
      country_of_incorporation,
      tax_residency,
      email,
      phone,
      registered_address,
      city,
      representative_name,
      representative_title,
      is_professional_investor,
      is_qualified_purchaser,
      aml_risk_rating,
      logo_url
    `)
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
        full_name: profile.full_name || profile.display_name,
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
        logo_url: investor.logo_url
      }}
      investorUserInfo={{
        role: investorUser.role,
        is_primary: investorUser.is_primary,
        can_sign: investorUser.can_sign || false,
        signature_specimen_url: investorUser.signature_specimen_url,
        signature_specimen_uploaded_at: investorUser.signature_specimen_uploaded_at
      }}
    />
  )
}
