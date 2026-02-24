import { SupabaseClient } from '@supabase/supabase-js'
import { createInvestorNotification } from '@/lib/notifications'

const KYC_REVIEW_LINK = '/versotech_main/kyc-review'

const ENTITY_LABELS: Record<string, string> = {
  investor: 'Investor',
  partner: 'Partner',
  introducer: 'Introducer',
  lawyer: 'Lawyer',
  commercial_partner: 'Commercial Partner',
  arranger: 'Arranger',
}

const ENTITY_NAME_CONFIG: Record<string, { table: string; columns: string[] }> = {
  investor: {
    table: 'investors',
    columns: ['legal_name', 'display_name', 'name'],
  },
  partner: {
    table: 'partners',
    columns: ['legal_name', 'name'],
  },
  introducer: {
    table: 'introducers',
    columns: ['legal_name', 'display_name', 'contact_name'],
  },
  lawyer: {
    table: 'lawyers',
    columns: ['firm_name', 'display_name'],
  },
  commercial_partner: {
    table: 'commercial_partners',
    columns: ['legal_name', 'name'],
  },
  arranger: {
    table: 'arranger_entities',
    columns: ['legal_name', 'display_name'],
  },
}

const normalizeName = (value: unknown): string | null => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

const toEntityLabel = (entityType: string): string => {
  if (ENTITY_LABELS[entityType]) {
    return ENTITY_LABELS[entityType]
  }

  return entityType
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

async function resolveEntityName(params: {
  supabase: SupabaseClient
  entityType: string
  entityId: string
  preferredName?: string | null
}): Promise<string | null> {
  const preferred = normalizeName(params.preferredName)
  if (preferred) return preferred

  const config = ENTITY_NAME_CONFIG[params.entityType]
  if (!config) return null

  const selectColumns = Array.from(new Set(config.columns)).join(', ')
  const { data, error } = await params.supabase
    .from(config.table)
    .select(selectColumns)
    .eq('id', params.entityId)
    .maybeSingle()

  if (error || !data || typeof data !== 'object' || Array.isArray(data)) {
    if (error) {
      console.error('[kyc-submit-notifications] Failed to resolve entity name:', error)
    }
    return null
  }

  const row = data as Record<string, unknown>
  for (const key of config.columns) {
    const value = normalizeName(row[key])
    if (value) return value
  }

  return null
}

async function resolveSubmitterLabel(supabase: SupabaseClient, userId: string): Promise<string> {
  const { data, error } = await supabase
    .from('profiles')
    .select('display_name, full_name, email')
    .eq('id', userId)
    .maybeSingle()

  if (error || !data) {
    return 'A user'
  }

  return (
    normalizeName(data.display_name) ||
    normalizeName(data.full_name) ||
    normalizeName(data.email) ||
    'A user'
  )
}

async function resolveCeoUserIds(supabase: SupabaseClient): Promise<string[]> {
  const { data: ceoUsers, error } = await supabase
    .from('ceo_users')
    .select('user_id')

  if (error) {
    console.error('[kyc-submit-notifications] Failed to load ceo_users:', error)
    return []
  }

  const directIds = Array.from(
    new Set(
      (ceoUsers || [])
        .map((row) => (typeof row.user_id === 'string' ? row.user_id : null))
        .filter((value): value is string => Boolean(value))
    )
  )

  if (directIds.length > 0) {
    return directIds
  }

  // Fallback safety for environments where ceo_users has not been populated yet.
  const { data: fallbackProfiles, error: fallbackError } = await supabase
    .from('profiles')
    .select('id')
    .in('role', ['ceo', 'staff_admin'])

  if (fallbackError) {
    console.error('[kyc-submit-notifications] Failed to load fallback CEO profiles:', fallbackError)
    return []
  }

  return Array.from(
    new Set(
      (fallbackProfiles || [])
        .map((profile) => (typeof profile.id === 'string' ? profile.id : null))
        .filter((value): value is string => Boolean(value))
    )
  )
}

export async function notifyCeoEntityInfoSubmitted(params: {
  supabase: SupabaseClient
  entityType: string
  entityId: string
  submittedByUserId: string
  entityName?: string | null
}) {
  const ceoUserIds = await resolveCeoUserIds(params.supabase)
  if (ceoUserIds.length === 0) return

  const [entityName, submitterLabel] = await Promise.all([
    resolveEntityName({
      supabase: params.supabase,
      entityType: params.entityType,
      entityId: params.entityId,
      preferredName: params.entityName,
    }),
    resolveSubmitterLabel(params.supabase, params.submittedByUserId),
  ])

  const entityLabel = toEntityLabel(params.entityType)
  const displayEntityName = entityName || `${entityLabel} entity`

  await Promise.all(
    ceoUserIds.map((ceoUserId) =>
      createInvestorNotification({
        userId: ceoUserId,
        investorId: params.entityType === 'investor' ? params.entityId : undefined,
        title: 'Entity Information Submitted',
        message: `${submitterLabel} submitted updated entity information for ${displayEntityName}. This submission was auto-approved.`,
        link: KYC_REVIEW_LINK,
        type: 'kyc_status',
        createdBy: params.submittedByUserId,
        sendEmailNotification: false,
        extraMetadata: {
          source: 'entity_info_submit',
          entity_type: params.entityType,
          entity_id: params.entityId,
          entity_name: displayEntityName,
          submitted_by_user_id: params.submittedByUserId,
          auto_approved: true,
        },
      })
    )
  )
}

export async function notifyCeoPersonalInfoSubmitted(params: {
  supabase: SupabaseClient
  entityType: string
  entityId: string
  submittedByUserId: string
  memberId?: string | null
  memberName?: string | null
  entityName?: string | null
}) {
  const ceoUserIds = await resolveCeoUserIds(params.supabase)
  if (ceoUserIds.length === 0) return

  const [entityName, submitterLabel] = await Promise.all([
    resolveEntityName({
      supabase: params.supabase,
      entityType: params.entityType,
      entityId: params.entityId,
      preferredName: params.entityName,
    }),
    resolveSubmitterLabel(params.supabase, params.submittedByUserId),
  ])

  const entityLabel = toEntityLabel(params.entityType)
  const displayEntityName = entityName || `${entityLabel} entity`
  const personName = normalizeName(params.memberName) || 'a member'
  const isIndividualInvestor = params.entityType === 'investor' && !params.memberId

  const message = isIndividualInvestor
    ? `${submitterLabel} submitted personal KYC information for ${displayEntityName}. This submission was auto-approved.`
    : `${submitterLabel} submitted personal KYC information for ${personName} in ${displayEntityName}. This submission was auto-approved.`

  await Promise.all(
    ceoUserIds.map((ceoUserId) =>
      createInvestorNotification({
        userId: ceoUserId,
        investorId: params.entityType === 'investor' ? params.entityId : undefined,
        title: 'Personal Information Submitted',
        message,
        link: KYC_REVIEW_LINK,
        type: 'kyc_status',
        createdBy: params.submittedByUserId,
        sendEmailNotification: false,
        extraMetadata: {
          source: 'personal_info_submit',
          entity_type: params.entityType,
          entity_id: params.entityId,
          entity_name: displayEntityName,
          member_id: params.memberId || null,
          member_name: normalizeName(params.memberName),
          submitted_by_user_id: params.submittedByUserId,
          auto_approved: true,
        },
      })
    )
  )
}
