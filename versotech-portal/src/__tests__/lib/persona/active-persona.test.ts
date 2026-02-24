import { describe, expect, it } from 'vitest'
import {
  getPerUserPersonaStorageKey,
  readCookieValue,
  resolveActivePersona,
  selectPersonaByPriority,
  type PersonaIdentity,
} from '@/lib/persona/active-persona'

type TestPersona = PersonaIdentity & {
  label: string
}

const personas: TestPersona[] = [
  { persona_type: 'investor', entity_id: 'investor-1', label: 'Investor' },
  { persona_type: 'partner', entity_id: 'partner-1', label: 'Partner' },
  { persona_type: 'ceo', entity_id: 'ceo-1', label: 'CEO' },
]

describe('active persona resolver', () => {
  it('prefers exact cookie match when available', () => {
    const selected = resolveActivePersona(personas, {
      cookiePersonaType: 'partner',
      cookiePersonaId: 'partner-1',
      storedPersonaId: 'investor-1',
    })

    expect(selected?.entity_id).toBe('partner-1')
  })

  it('falls back to stored persona when cookie does not match user personas', () => {
    const selected = resolveActivePersona(personas, {
      cookiePersonaType: 'partner',
      cookiePersonaId: 'foreign-id',
      storedPersonaId: 'investor-1',
    })

    expect(selected?.entity_id).toBe('investor-1')
  })

  it('falls back to priority order when cookie and stored persona are invalid', () => {
    const selected = resolveActivePersona(personas, {
      cookiePersonaType: 'partner',
      cookiePersonaId: 'foreign-id',
      storedPersonaId: 'missing-id',
    })

    expect(selected?.persona_type).toBe('ceo')
    expect(selected?.entity_id).toBe('ceo-1')
  })

  it('selectPersonaByPriority returns null for empty list', () => {
    expect(selectPersonaByPriority([])).toBeNull()
  })

  it('reads cookie values from raw cookie string', () => {
    const value = readCookieValue(
      'foo=bar; verso_active_persona_id=ceo-1; baz=qux',
      'verso_active_persona_id'
    )
    expect(value).toBe('ceo-1')
  })

  it('builds per-user storage keys', () => {
    expect(getPerUserPersonaStorageKey('user-123')).toBe('verso_active_persona:user-123')
  })
})
