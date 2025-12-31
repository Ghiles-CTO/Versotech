import { createClient, createServiceClient } from '@/lib/supabase/server'
import { AlertCircle } from 'lucide-react'
import { IntroducerProfileClient } from '@/components/introducer-profile/introducer-profile-client'

export const dynamic = 'force-dynamic'

export default async function IntroducerProfilePage() {
  const clientSupabase = await createClient()
  const { data: { user }, error: userError } = await clientSupabase.auth.getUser()

  if (!user || userError) {
    return (
      <div className="p-6">
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
      <div className="p-6">
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
      <div className="p-6">
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
    />
  )
}
