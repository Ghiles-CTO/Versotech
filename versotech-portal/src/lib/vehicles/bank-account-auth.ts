import type { User } from '@supabase/supabase-js'

import { isStaffUser } from '@/lib/api-auth'
import type { Database } from '@/types/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'

type DbClient = SupabaseClient<Database>

type PersonaRecord = {
  persona_type?: string | null
  role_in_entity?: string | null
}

const VEHICLE_BANK_ACCOUNT_READ_ROLES = ['ceo', 'staff_admin', 'staff_ops', 'staff_rm'] as const
const VEHICLE_BANK_ACCOUNT_MANAGE_ROLES = ['ceo', 'staff_admin', 'staff_ops'] as const

function hasAllowedVehicleBankRole(
  role: string | null | undefined,
  allowedRoles: readonly string[],
) {
  return Boolean(role && allowedRoles.includes(role))
}

async function hasVehicleBankAccountAccess(
  supabase: DbClient,
  user: User,
  allowedRoles: readonly string[],
) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (hasAllowedVehicleBankRole(profile?.role, allowedRoles)) {
    return true
  }

  const { data: personas } = await supabase.rpc('get_user_personas', {
    p_user_id: user.id,
  })

  return Array.isArray(personas) && personas.some((persona: PersonaRecord) =>
    persona.persona_type === 'ceo' ||
    (persona.persona_type === 'staff' &&
      hasAllowedVehicleBankRole(persona.role_in_entity, allowedRoles))
  )
}

export async function canReadVehicleBankAccounts(supabase: DbClient, user: User) {
  const hasDirectVehicleAccess = await hasVehicleBankAccountAccess(
    supabase,
    user,
    VEHICLE_BANK_ACCOUNT_READ_ROLES,
  )

  if (hasDirectVehicleAccess) {
    return true
  }

  return isStaffUser(supabase, user)
}

export async function canManageVehicleBankAccounts(supabase: DbClient, user: User) {
  return hasVehicleBankAccountAccess(
    supabase,
    user,
    VEHICLE_BANK_ACCOUNT_MANAGE_ROLES,
  )
}
