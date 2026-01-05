import { createClient, createServiceClient } from '@/lib/supabase/server'
import { AlertCircle } from 'lucide-react'
import { CeoProfileClient } from './ceo-profile-client'

export const dynamic = 'force-dynamic'

export default async function CeoProfilePage() {
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
            Please log in to view the CEO profile.
          </p>
        </div>
      </div>
    )
  }

  const serviceSupabase = createServiceClient()

  // Check if user is a CEO member
  const { data: ceoUser, error: ceoUserError } = await serviceSupabase
    .from('ceo_users')
    .select('user_id, role, can_sign, is_primary, title')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!ceoUser || ceoUserError) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            CEO Access Required
          </h3>
          <p className="text-muted-foreground">
            This section is available only to CEO (Verso Capital) users.
          </p>
        </div>
      </div>
    )
  }

  // Get CEO entity (Verso Capital) - there's only ONE
  const { data: ceoEntity, error: ceoEntityError } = await serviceSupabase
    .from('ceo_entity')
    .select('*')
    .limit(1)
    .maybeSingle()

  if (!ceoEntity || ceoEntityError) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            CEO Entity Not Found
          </h3>
          <p className="text-muted-foreground">
            The CEO entity (Verso Capital) has not been configured.
          </p>
        </div>
      </div>
    )
  }

  // Get all CEO members - use FK hint since ceo_users has both user_id and created_by refs to profiles
  const { data: ceoMembers } = await serviceSupabase
    .from('ceo_users')
    .select(`
      user_id,
      role,
      can_sign,
      is_primary,
      title,
      created_at,
      profiles!ceo_users_user_id_fkey (
        id,
        email,
        display_name,
        avatar_url
      )
    `)
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: true })

  // Get current user profile
  const { data: profile } = await serviceSupabase
    .from('profiles')
    .select('display_name, email, avatar_url')
    .eq('id', user.id)
    .maybeSingle()

  // Format members for client component
  const formattedMembers = (ceoMembers || []).map((member: any) => ({
    userId: member.user_id,
    email: member.profiles?.email || '',
    displayName: member.profiles?.display_name || member.profiles?.email?.split('@')[0] || 'Unknown',
    avatarUrl: member.profiles?.avatar_url || null,
    role: member.role,
    canSign: member.can_sign || false,
    isPrimary: member.is_primary || false,
    title: member.title,
    createdAt: member.created_at
  }))

  return (
    <CeoProfileClient
      userId={user.id}
      userEmail={user.email || ''}
      userRole={ceoUser.role}
      canManageMembers={ceoUser.role === 'admin'}
      profile={profile ? {
        displayName: profile.display_name,
        email: profile.email || user.email || '',
        avatarUrl: profile.avatar_url
      } : null}
      ceoEntity={{
        id: ceoEntity.id,
        legalName: ceoEntity.legal_name,
        displayName: ceoEntity.display_name,
        registrationNumber: ceoEntity.registration_number,
        taxId: ceoEntity.tax_id,
        registeredAddress: ceoEntity.registered_address,
        city: ceoEntity.city,
        postalCode: ceoEntity.postal_code,
        country: ceoEntity.country,
        email: ceoEntity.email,
        phone: ceoEntity.phone,
        website: ceoEntity.website,
        logoUrl: ceoEntity.logo_url,
        status: ceoEntity.status,
      }}
      ceoMembers={formattedMembers}
    />
  )
}
