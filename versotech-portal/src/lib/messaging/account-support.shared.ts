export type AccountSupportPersonaType =
  | 'investor'
  | 'introducer'
  | 'partner'
  | 'commercial_partner'

export const ACCOUNT_SUPPORT_METADATA_TYPE = 'account_support'
export const ACCOUNT_SUPPORT_OWNER_SCOPE = 'ceo_inbox'
export const ACCOUNT_SUPPORT_DISPLAY_NAME = 'Verso Support'
export const ACCOUNT_SUPPORT_AVATAR_URL = '/versotech-icon.png'

const ACCOUNT_SUPPORT_PERSONA_TYPES = new Set<AccountSupportPersonaType>([
  'investor',
  'introducer',
  'partner',
  'commercial_partner',
])

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

export function isAccountSupportPersonaType(value: unknown): value is AccountSupportPersonaType {
  return typeof value === 'string' && ACCOUNT_SUPPORT_PERSONA_TYPES.has(value as AccountSupportPersonaType)
}

export function hasAccountSupportInboxAccess(role: string | null | undefined): boolean {
  return role === 'ceo' || role === 'staff_admin'
}

export function isAccountSupportConversationMetadata(metadata: unknown): boolean {
  const record = asRecord(metadata)
  return (
    record.support_thread_type === ACCOUNT_SUPPORT_METADATA_TYPE &&
    isAccountSupportPersonaType(record.entity_type) &&
    typeof record.entity_id === 'string' &&
    record.entity_id.length > 0
  )
}

export function isAccountSupportSenderMetadata(metadata: unknown): boolean {
  const record = asRecord(metadata)
  return (
    record.support_sender === true ||
    (record.source === 'account_support' && typeof record.assistant_name === 'string')
  )
}

export function buildAccountSupportSubject(entityName: string): string {
  return `${ACCOUNT_SUPPORT_DISPLAY_NAME} / ${entityName}`
}
