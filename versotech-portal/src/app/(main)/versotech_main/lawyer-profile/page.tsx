import { createClient, createServiceClient } from '@/lib/supabase/server'
import { AlertCircle } from 'lucide-react'
import { LawyerProfileClient } from '@/components/lawyer/lawyer-profile-client'

export const dynamic = 'force-dynamic'

export default async function LawyerProfilePage() {
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

  // Check if user is a lawyer
  const { data: personas } = await serviceSupabase.rpc('get_user_personas', {
    p_user_id: user.id
  })

  const isLawyer = personas?.some((p: any) => p.persona_type === 'lawyer') || false

  if (!isLawyer) {
    return (
      <div className="p-6">
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
    .select('lawyer_id, role, is_primary, can_sign, signature_specimen_url, signature_specimen_uploaded_at')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!lawyerUser?.lawyer_id) {
    return (
      <div className="p-6">
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

  // Get lawyer details
  const { data: lawyer } = await serviceSupabase
    .from('lawyers')
    .select('id, firm_name, display_name, specializations, is_active, phone, email')
    .eq('id', lawyerUser.lawyer_id)
    .maybeSingle()

  // Get user profile info
  // Note: profiles has 'display_name' not 'full_name'
  const { data: profile } = await serviceSupabase
    .from('profiles')
    .select('display_name, email, avatar_url')
    .eq('id', user.id)
    .maybeSingle()

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
        phone: lawyer.phone,
        email: lawyer.email
      } : null}
      lawyerUserInfo={{
        role: lawyerUser.role,
        is_primary: lawyerUser.is_primary,
        can_sign: lawyerUser.can_sign,
        signature_specimen_url: lawyerUser.signature_specimen_url,
        signature_specimen_uploaded_at: lawyerUser.signature_specimen_uploaded_at
      }}
    />
  )
}
