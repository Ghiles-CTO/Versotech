import type { User } from '@supabase/supabase-js'

import { isStaffUser } from '@/lib/api-auth'
import type { Database } from '@/types/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'

type DbClient = SupabaseClient<Database>

type PersonaRecord = {
  persona_type?: string | null
  role_in_entity?: string | null
}

export async function canReadVehicleBankAccounts(supabase: DbClient, user: User) {
  return isStaffUser(supabase, user)
}

export async function canManageVehicleBankAccounts(supabase: DbClient, user: User) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.role && ['ceo', 'staff_admin', 'staff_ops'].includes(profile.role)) {
    return true
  }

  const { data: personas } = await supabase.rpc('get_user_personas', {
    p_user_id: user.id,
  })

  return Array.isArray(personas) && personas.some((persona: PersonaRecord) =>
    persona.persona_type === 'ceo' ||
    (persona.persona_type === 'staff' &&
      (persona.role_in_entity === 'ceo' ||
        persona.role_in_entity === 'staff_admin' ||
        persona.role_in_entity === 'staff_ops'))
  )
}
