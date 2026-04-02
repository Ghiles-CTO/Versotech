import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

export type ArrangerSigner = {
  id: string
  email: string
  displayName: string
  title: string | null
  canSign: boolean
  isPrimary: boolean
}

export async function getArrangerSigner(
  supabase: SupabaseClient<Database>,
  arrangerId: string
): Promise<ArrangerSigner | null> {
  const { data: primarySigner, error: primaryError } = await supabase
    .from('arranger_users')
    .select('user_id, can_sign, is_primary')
    .eq('arranger_id', arrangerId)
    .eq('can_sign', true)
    .eq('is_primary', true)
    .maybeSingle()

  if (primaryError) {
    console.error('[arranger-signer] Failed to load primary arranger signer:', primaryError)
  }

  let signerRow = primarySigner

  if (!signerRow) {
    const { data: fallbackSigner, error: fallbackError } = await supabase
      .from('arranger_users')
      .select('user_id, can_sign, is_primary')
      .eq('arranger_id', arrangerId)
      .eq('can_sign', true)
      .limit(1)
      .maybeSingle()

    if (fallbackError) {
      console.error('[arranger-signer] Failed to load fallback arranger signer:', fallbackError)
      return null
    }

    signerRow = fallbackSigner
  }

  if (!signerRow?.user_id) {
    return null
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, display_name, title')
    .eq('id', signerRow.user_id)
    .single()

  if (profileError || !profile) {
    console.error('[arranger-signer] Failed to load signer profile:', profileError)
    return null
  }

  return {
    id: profile.id,
    email: profile.email || '',
    displayName: profile.display_name || profile.email?.split('@')[0] || 'Arranger',
    title: profile.title,
    canSign: signerRow.can_sign ?? false,
    isPrimary: signerRow.is_primary ?? false,
  }
}
