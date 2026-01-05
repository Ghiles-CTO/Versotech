import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

/**
 * CEO Signer type - represents a user who can sign documents for Verso Capital
 */
export type CeoSigner = {
  id: string
  email: string
  displayName: string
  title: string | null
  canSign: boolean
}

/**
 * Get a CEO user who can sign documents for Verso Capital
 *
 * Queries ceo_users table for users with can_sign = true
 * Returns the primary signer first, otherwise the first available signer
 */
export async function getCeoSigner(
  supabase: SupabaseClient<Database>
): Promise<CeoSigner | null> {
  // Query ceo_users to find a user who can sign
  const { data: ceoUser, error } = await supabase
    .from('ceo_users')
    .select('user_id, can_sign, is_primary, title')
    .eq('can_sign', true)
    .order('is_primary', { ascending: false })  // Primary signer first
    .order('created_at', { ascending: true })   // Then oldest first
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('[ceo-signer] Failed to load CEO signer:', error)
    return null
  }

  if (!ceoUser) {
    console.warn('[ceo-signer] No CEO signer found with can_sign = true')
    return null
  }

  // Fetch profile separately to avoid deep type issues with FK hints
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, display_name')
    .eq('id', ceoUser.user_id)
    .single()

  if (profileError || !profile) {
    console.error('[ceo-signer] Failed to load profile for signer:', profileError)
    return null
  }

  return {
    id: profile.id,
    email: profile.email || '',
    displayName: profile.display_name || profile.email?.split('@')[0] || 'CEO',
    title: ceoUser.title,
    canSign: ceoUser.can_sign ?? false
  }
}

/**
 * Get all CEO users (for member management)
 */
export async function getCeoUsers(
  supabase: SupabaseClient<Database>
): Promise<Array<{
  userId: string
  email: string
  displayName: string
  title: string | null
  role: string
  canSign: boolean
  isPrimary: boolean
  createdAt: string | null
}>> {
  // Fetch CEO users without FK hint to avoid TypeScript type depth issues
  const { data: ceoUsers, error } = await supabase
    .from('ceo_users')
    .select('user_id, role, can_sign, is_primary, title, created_at')
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[ceo-signer] Failed to load CEO users:', error)
    return []
  }

  if (!ceoUsers || ceoUsers.length === 0) {
    return []
  }

  // Fetch profiles separately for all CEO users
  const userIds = ceoUsers.map(u => u.user_id)
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, email, display_name')
    .in('id', userIds)

  if (profilesError) {
    console.error('[ceo-signer] Failed to load profiles for CEO users:', profilesError)
    return []
  }

  // Create a map for quick profile lookup
  const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])

  return ceoUsers.map(row => {
    const profile = profileMap.get(row.user_id)
    return {
      userId: row.user_id,
      email: profile?.email || 'unknown@email.com',
      displayName: profile?.display_name || profile?.email?.split('@')[0] || 'Unknown',
      title: row.title,
      role: row.role,
      canSign: row.can_sign ?? false,
      isPrimary: row.is_primary ?? false,
      createdAt: row.created_at
    }
  })
}

/**
 * Get the CEO entity info (Verso Capital)
 */
export async function getCeoEntity(
  supabase: SupabaseClient<Database>
): Promise<{
  id: string
  legalName: string
  displayName: string | null
  registrationNumber: string | null
  taxId: string | null
  registeredAddress: string | null
  city: string | null
  postalCode: string | null
  country: string | null
  email: string | null
  phone: string | null
  website: string | null
  logoUrl: string | null
  status: string
} | null> {
  const { data, error } = await supabase
    .from('ceo_entity')
    .select('*')
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('[ceo-signer] Failed to load CEO entity:', error)
    return null
  }

  if (!data) {
    console.warn('[ceo-signer] No CEO entity found')
    return null
  }

  return {
    id: data.id,
    legalName: data.legal_name,
    displayName: data.display_name,
    registrationNumber: data.registration_number,
    taxId: data.tax_id,
    registeredAddress: data.registered_address,
    city: data.city,
    postalCode: data.postal_code,
    country: data.country,
    email: data.email,
    phone: data.phone,
    website: data.website,
    logoUrl: data.logo_url,
    status: data.status ?? 'active'
  }
}

/**
 * Check if the current user is a CEO member
 */
export async function isUserCeoMember(
  supabase: SupabaseClient<Database>,
  userId?: string
): Promise<boolean> {
  const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id

  if (!targetUserId) return false

  const { data, error } = await supabase
    .from('ceo_users')
    .select('user_id')
    .eq('user_id', targetUserId)
    .maybeSingle()

  if (error) {
    console.error('[ceo-signer] Error checking CEO membership:', error)
    return false
  }

  return !!data
}

/**
 * Check if the current user is a CEO admin
 */
export async function isUserCeoAdmin(
  supabase: SupabaseClient<Database>,
  userId?: string
): Promise<boolean> {
  const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id

  if (!targetUserId) return false

  const { data, error } = await supabase
    .from('ceo_users')
    .select('user_id, role')
    .eq('user_id', targetUserId)
    .eq('role', 'admin')
    .maybeSingle()

  if (error) {
    console.error('[ceo-signer] Error checking CEO admin status:', error)
    return false
  }

  return !!data
}
