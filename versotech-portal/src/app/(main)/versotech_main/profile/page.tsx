import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { ProfilePageClient } from '@/components/profile/profile-page-client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ProfilePage() {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  // Get the current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/versotech_main/login')
  }

  // Check if user is a CEO member - redirect to CEO profile
  const { data: ceoUser } = await serviceSupabase
    .from('ceo_users')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (ceoUser) {
    // CEO users should use the dedicated CEO Profile page
    redirect('/versotech_main/ceo-profile')
  }

  // Fetch complete profile data
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold text-foreground mb-2">Error Loading Profile</h1>
          <p className="text-muted-foreground">
            Unable to load your profile data. Please try again.
          </p>
        </div>
      </div>
    )
  }

  // Determine if user is staff
  const isStaff = ['staff_admin', 'staff_ops', 'staff_rm', 'staff', 'admin'].includes(profile.role)

  // For non-staff users, check if they have an investor entity
  let investorInfo = null
  let investorUserInfo = null

  if (!isStaff) {
    // Check if user is associated with an investor
    const { data: investorUser } = await serviceSupabase
      .from('investor_users')
      .select('investor_id, role, is_primary, can_sign')
      .eq('user_id', user.id)
      .maybeSingle()

    if (investorUser) {
      // Fetch investor entity details
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

      if (investor) {
        investorInfo = {
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
        }

        investorUserInfo = {
          role: investorUser.role,
          is_primary: investorUser.is_primary,
          can_sign: investorUser.can_sign || false
        }
      }
    }
  }

  return (
    <ProfilePageClient
      userEmail={user.email || ''}
      profile={{
        id: profile.id,
        email: profile.email,
        display_name: profile.display_name,
        full_name: profile.full_name || profile.display_name,
        title: profile.title,
        avatar_url: profile.avatar_url,
        phone: profile.phone,
        office_location: profile.office_location,
        bio: profile.bio,
        role: profile.role,
        created_at: profile.created_at
      }}
      variant={isStaff ? 'staff' : 'investor'}
      investorInfo={investorInfo}
      investorUserInfo={investorUserInfo}
    />
  )
}
