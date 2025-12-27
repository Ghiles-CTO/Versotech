import { createClient, createServiceClient } from '@/lib/supabase/server'
import { AlertCircle } from 'lucide-react'
import { ArrangerProfileClient } from './arranger-profile-client'

export const dynamic = 'force-dynamic'

export default async function ArrangerProfilePage() {
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

  // Check if user is an arranger
  const { data: personas } = await serviceSupabase.rpc('get_user_personas', {
    p_user_id: user.id
  })

  const arrangerPersona = personas?.find((p: any) => p.persona_type === 'arranger')

  if (!arrangerPersona) {
    return (
      <div className="p-6">
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
    .select('arranger_id, role, is_active')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!arrangerUser?.arranger_id) {
    return (
      <div className="p-6">
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
    .select('full_name, email, avatar_url')
    .eq('id', user.id)
    .maybeSingle()

  // Get deal count for this arranger
  const { count: dealCount } = await serviceSupabase
    .from('deals')
    .select('id', { count: 'exact', head: true })
    .eq('arranger_entity_id', arrangerUser.arranger_id)

  return (
    <ArrangerProfileClient
      userEmail={user.email || ''}
      profile={profile ? {
        full_name: profile.full_name,
        email: profile.email || user.email || '',
        avatar_url: profile.avatar_url
      } : null}
      arrangerInfo={arranger ? {
        id: arranger.id,
        legal_name: arranger.legal_name,
        company_name: arranger.company_name,
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
        is_active: arranger.is_active,
        created_at: arranger.created_at
      } : null}
      arrangerUserInfo={{
        role: arrangerUser.role,
        is_active: arrangerUser.is_active
      }}
      dealCount={dealCount || 0}
    />
  )
}
