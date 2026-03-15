import { SupabaseClient } from '@supabase/supabase-js'

type SupportedEntityType =
  | 'investor'
  | 'introducer'
  | 'partner'
  | 'commercial_partner'
  | 'lawyer'
  | 'arranger'

const ENTITY_USER_TABLES: Record<SupportedEntityType, { table: string; entityIdColumn: string }> = {
  investor: { table: 'investor_users', entityIdColumn: 'investor_id' },
  introducer: { table: 'introducer_users', entityIdColumn: 'introducer_id' },
  partner: { table: 'partner_users', entityIdColumn: 'partner_id' },
  commercial_partner: { table: 'commercial_partner_users', entityIdColumn: 'commercial_partner_id' },
  lawyer: { table: 'lawyer_users', entityIdColumn: 'lawyer_id' },
  arranger: { table: 'arranger_users', entityIdColumn: 'arranger_id' },
}

type EntityUserRow = {
  user_id?: string | null
  role?: string | null
  is_primary?: boolean | null
  created_at?: string | null
}

type ProfileRow = {
  id: string
  email: string | null
  display_name: string | null
}

function normalizeRole(value?: string | null) {
  return (value || '').toLowerCase().trim()
}

export async function getEntityPrimaryAndAdminRecipients(params: {
  supabase: SupabaseClient<any>
  entityType: SupportedEntityType
  entityId: string
}) {
  const { supabase, entityType, entityId } = params
  const config = ENTITY_USER_TABLES[entityType]

  const { data, error } = await supabase
    .from(config.table)
    .select('user_id, role, is_primary, created_at')
    .eq(config.entityIdColumn, entityId)
    .eq('is_active', true)
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: true })

  if (error) {
    throw error
  }

  const rows = (data || []) as EntityUserRow[]
  if (rows.length === 0) {
    return {
      userIds: [] as string[],
      primaryProfile: null as ProfileRow | null,
      profilesById: new Map<string, ProfileRow>(),
    }
  }

  const primaryOrAdmins = rows.filter((row) => {
    if (row.is_primary === true) return true
    return normalizeRole(row.role) === 'admin'
  })

  const selectedRows = primaryOrAdmins.length > 0 ? primaryOrAdmins : [rows[0]]
  const userIds = Array.from(
    new Set(
      selectedRows
        .map((row) => row.user_id)
        .filter((value): value is string => typeof value === 'string' && value.length > 0)
    )
  )

  if (userIds.length === 0) {
    return {
      userIds,
      primaryProfile: null as ProfileRow | null,
      profilesById: new Map<string, ProfileRow>(),
    }
  }

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, display_name')
    .in('id', userIds)

  const profileRows = (profiles || []) as ProfileRow[]
  const profilesById = new Map(profileRows.map((profile) => [profile.id, profile]))

  const primaryRow =
    rows.find((row) => row.is_primary === true && typeof row.user_id === 'string') ||
    rows.find((row) => normalizeRole(row.role) === 'admin' && typeof row.user_id === 'string') ||
    rows[0] ||
    null

  const primaryProfile =
    primaryRow?.user_id && profilesById.has(primaryRow.user_id)
      ? profilesById.get(primaryRow.user_id) || null
      : null

  return {
    userIds,
    primaryProfile,
    profilesById,
  }
}
