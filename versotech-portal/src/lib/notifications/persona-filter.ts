export type NotificationPersonaType =
  | 'investor'
  | 'arranger'
  | 'introducer'
  | 'partner'
  | 'commercial_partner'
  | 'lawyer'
  | 'ceo'
  | 'staff'

export type PersonaNotificationRecord = {
  link?: string | null
  investor_id?: string | null
}

export const PERSONA_NOTIFICATION_ROUTE_PREFIXES: Record<NotificationPersonaType, string[]> = {
  investor: [
    '/versotech_main/opportunities',
    '/versotech_main/portfolio',
    '/versotech_main/documents',
    '/versotech_main/inbox',
    '/versotech_main/profile',
    '/versotech_main/versosign',
    '/versotech_main/subscription-packs',
    '/versotech_main/deals',
  ],
  arranger: [
    '/versotech_main/my-mandates',
    '/versotech_main/subscription-packs',
    '/versotech_main/escrow',
    '/versotech_main/arranger-reconciliation',
    '/versotech_main/fee-plans',
    '/versotech_main/payment-requests',
    '/versotech_main/my-partners',
    '/versotech_main/my-introducers',
    '/versotech_main/my-commercial-partners',
    '/versotech_main/my-lawyers',
    '/versotech_main/versosign',
    '/versotech_main/arranger-profile',
  ],
  introducer: [
    '/versotech_main/introductions',
    '/versotech_main/introducer-agreements',
    '/versotech_main/my-commissions',
    '/versotech_main/versosign',
    '/versotech_main/introducer-profile',
  ],
  partner: [
    '/versotech_main/opportunities',
    '/versotech_main/partner-transactions',
    '/versotech_main/my-commissions',
    '/versotech_main/shared-transactions',
    '/versotech_main/versosign',
    '/versotech_main/partner-profile',
  ],
  commercial_partner: [
    '/versotech_main/opportunities',
    '/versotech_main/client-transactions',
    '/versotech_main/my-commissions',
    '/versotech_main/portfolio',
    '/versotech_main/placement-agreements',
    '/versotech_main/commercial-partner-profile',
    '/versotech_main/notifications',
    '/versotech_main/messages',
  ],
  lawyer: [
    '/versotech_main/assigned-deals',
    '/versotech_main/escrow',
    '/versotech_main/subscription-packs',
    '/versotech_main/versosign',
    '/versotech_main/lawyer-reconciliation',
    '/versotech_main/lawyer-profile',
  ],
  ceo: [],
  staff: [],
}

export const SHARED_NOTIFICATION_ROUTE_PREFIXES = [
  '/versotech_main/notifications',
  '/versotech_main/versosign',
  '/versotech_main/documents',
  '/versotech_main/inbox',
  '/versotech_main/messages',
]

export function notificationMatchesPersona(
  notification: PersonaNotificationRecord,
  params: {
    personaType: NotificationPersonaType
    entityId?: string | null
  }
) {
  const { personaType, entityId } = params

  if (personaType === 'ceo' || personaType === 'staff') {
    return true
  }

  if (notification.investor_id) {
    if (personaType !== 'investor') return false
    if (entityId && notification.investor_id !== entityId) return false
    return true
  }

  if (!notification.link) {
    return true
  }

  if (SHARED_NOTIFICATION_ROUTE_PREFIXES.some((prefix) => notification.link!.startsWith(prefix))) {
    return true
  }

  const allowedPrefixes = PERSONA_NOTIFICATION_ROUTE_PREFIXES[personaType] || []
  return allowedPrefixes.some((prefix) => notification.link!.startsWith(prefix))
}
