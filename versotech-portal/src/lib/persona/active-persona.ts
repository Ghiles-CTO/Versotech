export type PersonaType =
  | 'ceo'
  | 'staff'
  | 'investor'
  | 'arranger'
  | 'introducer'
  | 'partner'
  | 'commercial_partner'
  | 'lawyer'

export interface PersonaIdentity {
  persona_type: PersonaType
  entity_id: string
}

export const ACTIVE_PERSONA_STORAGE_PREFIX = 'verso_active_persona'
export const ACTIVE_PERSONA_TYPE_COOKIE = 'verso_active_persona_type'
export const ACTIVE_PERSONA_ID_COOKIE = 'verso_active_persona_id'

const PERSONA_PRIORITY: Record<PersonaType, number> = {
  ceo: 1,
  staff: 2,
  arranger: 3,
  introducer: 4,
  partner: 5,
  commercial_partner: 6,
  lawyer: 7,
  investor: 8,
}

type ResolveActivePersonaOptions = {
  cookiePersonaType?: string | null
  cookiePersonaId?: string | null
  storedPersonaId?: string | null
}

export function getPerUserPersonaStorageKey(userId: string): string {
  return `${ACTIVE_PERSONA_STORAGE_PREFIX}:${userId}`
}

export function readCookieValue(cookieString: string, name: string): string | null {
  const prefix = `${name}=`
  for (const chunk of cookieString.split('; ')) {
    if (chunk.startsWith(prefix)) {
      return decodeURIComponent(chunk.slice(prefix.length))
    }
  }
  return null
}

export function selectPersonaByPriority<T extends PersonaIdentity>(allPersonas: T[]): T | null {
  if (allPersonas.length === 0) return null
  return allPersonas.reduce((best, current) => {
    const bestPriority = PERSONA_PRIORITY[best.persona_type] ?? 99
    const currentPriority = PERSONA_PRIORITY[current.persona_type] ?? 99
    return currentPriority < bestPriority ? current : best
  })
}

export function resolveActivePersona<T extends PersonaIdentity>(
  allPersonas: T[],
  options: ResolveActivePersonaOptions = {}
): T | null {
  if (allPersonas.length === 0) return null

  const { cookiePersonaId, cookiePersonaType, storedPersonaId } = options

  if (cookiePersonaId) {
    const cookiePersona = allPersonas.find((persona) =>
      persona.entity_id === cookiePersonaId &&
      (!cookiePersonaType || persona.persona_type === cookiePersonaType)
    )
    if (cookiePersona) {
      return cookiePersona
    }
  }

  if (storedPersonaId) {
    const storedPersona = allPersonas.find((persona) => persona.entity_id === storedPersonaId)
    if (storedPersona) {
      return storedPersona
    }
  }

  return selectPersonaByPriority(allPersonas)
}
