import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

type ProfileRow = Database['public']['Tables']['profiles']['Row']

// Partial profile type for CEO signer queries (only the fields we select)
type CeoProfileSelect = Pick<ProfileRow, 'id' | 'email' | 'display_name' | 'title' | 'role' | 'created_at'>

export type CeoSigner = {
  id: string
  email: string
  displayName: string
  title: string | null
  role: 'ceo' | 'staff_admin'
}

const isCeoRole = (role: ProfileRow['role']): role is CeoSigner['role'] =>
  role === 'ceo' || role === 'staff_admin'

const buildCeoSigner = (profile: Pick<ProfileRow, 'id' | 'email' | 'display_name' | 'title' | 'role'>): CeoSigner | null => {
  if (!profile.email || !isCeoRole(profile.role)) {
    return null
  }

  const displayName = profile.display_name || profile.email.split('@')[0] || 'CEO'

  return {
    id: profile.id,
    email: profile.email,
    displayName,
    title: profile.title,
    role: profile.role
  }
}

export async function getCeoSigner(
  supabase: SupabaseClient<Database>
): Promise<CeoSigner | null> {
  const { data: ceoProfile, error: ceoError } = await supabase
    .from('profiles')
    .select('id, email, display_name, title, role, created_at')
    .eq('role', 'ceo')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (ceoError) {
    console.error('[ceo-signer] Failed to load CEO profile:', ceoError)
  }

  if (ceoProfile) {
    return buildCeoSigner(ceoProfile)
  }

  const { data: adminProfile, error: adminError } = await supabase
    .from('profiles')
    .select('id, email, display_name, title, role, created_at')
    .eq('role', 'staff_admin')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (adminError) {
    console.error('[ceo-signer] Failed to load staff admin profile:', adminError)
  }

  return adminProfile ? buildCeoSigner(adminProfile) : null
}
