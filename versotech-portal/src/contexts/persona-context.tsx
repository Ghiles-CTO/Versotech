'use client'

import { createContext, useContext, useState, useEffect, useCallback, useRef, useTransition, ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  ACTIVE_PERSONA_ID_COOKIE,
  ACTIVE_PERSONA_STORAGE_PREFIX,
  ACTIVE_PERSONA_TYPE_COOKIE,
  getPerUserPersonaStorageKey,
  readCookieValue,
  resolveActivePersona,
} from '@/lib/persona/active-persona'

/**
 * Persona type matching get_user_personas() function return
 */
export interface Persona {
  persona_type: 'ceo' | 'staff' | 'investor' | 'arranger' | 'introducer' | 'partner' | 'commercial_partner' | 'lawyer'
  entity_id: string
  entity_name: string
  entity_logo_url: string | null
  role_in_entity: string
  is_primary: boolean
  can_sign: boolean
  can_execute_for_clients: boolean
}

/**
 * Persona context state
 */
interface PersonaContextState {
  personas: Persona[]
  activePersona: Persona | null
  isLoading: boolean
  isSwitchingPersona: boolean
  error: string | null
  switchPersona: (persona: Persona) => void
  refreshPersonas: () => Promise<void>
  // Helper checks
  isCEO: boolean
  isStaff: boolean
  isInvestor: boolean
  isPartner: boolean
  isLawyer: boolean
  isCommercialPartner: boolean
  isIntroducer: boolean
  isArranger: boolean
  hasAnyPersona: boolean
  hasMultiplePersonas: boolean
}

const PersonaContext = createContext<PersonaContextState | undefined>(undefined)

/**
 * Set cookies that the server can read to determine active persona identity.
 */
function setPersonaCookie(personaType: string, personaId: string) {
  // Set cookie with 1 year expiry, accessible to server
  document.cookie = `${ACTIVE_PERSONA_TYPE_COOKIE}=${personaType}; path=/; max-age=31536000; SameSite=Lax`
  document.cookie = `${ACTIVE_PERSONA_ID_COOKIE}=${personaId}; path=/; max-age=31536000; SameSite=Lax`
}

interface PersonaProviderProps {
  children: ReactNode
  initialPersonas?: Persona[]
  userId: string
}

export function PersonaProvider({ children, initialPersonas = [], userId }: PersonaProviderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [personas, setPersonas] = useState<Persona[]>(initialPersonas)
  const [activePersona, setActivePersona] = useState<Persona | null>(null)
  const [isLoading, setIsLoading] = useState(!initialPersonas.length)
  const [isSwitchingPersona, startPersonaSwitchTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const hasRefreshedForPersonaMismatch = useRef(false)
  const storageKey = getPerUserPersonaStorageKey(userId)

  const readStoredPersonaId = useCallback((): string | null => {
    const scopedPersonaId = localStorage.getItem(storageKey)
    if (scopedPersonaId) {
      return scopedPersonaId
    }

    // Legacy migration path (global key used before per-user keys).
    const legacyPersonaId = localStorage.getItem(ACTIVE_PERSONA_STORAGE_PREFIX)
    if (legacyPersonaId) {
      localStorage.setItem(storageKey, legacyPersonaId)
      localStorage.removeItem(ACTIVE_PERSONA_STORAGE_PREFIX)
      return legacyPersonaId
    }

    return null
  }, [storageKey])

  const selectPersonaFromContext = useCallback((allPersonas: Persona[]): Persona | null => {
    return resolveActivePersona(allPersonas, {
      cookiePersonaId: readCookieValue(document.cookie, ACTIVE_PERSONA_ID_COOKIE),
      cookiePersonaType: readCookieValue(document.cookie, ACTIVE_PERSONA_TYPE_COOKIE),
      storedPersonaId: readStoredPersonaId(),
    })
  }, [readStoredPersonaId])

  const syncSelectedPersona = useCallback((selectedPersona: Persona | null) => {
    if (!selectedPersona) return

    const currentTypeCookie = readCookieValue(document.cookie, ACTIVE_PERSONA_TYPE_COOKIE)
    const currentIdCookie = readCookieValue(document.cookie, ACTIVE_PERSONA_ID_COOKIE)
    const cookieWasStale =
      (currentTypeCookie && currentTypeCookie !== selectedPersona.persona_type) ||
      (currentIdCookie && currentIdCookie !== selectedPersona.entity_id)

    setPersonaCookie(selectedPersona.persona_type, selectedPersona.entity_id)
    localStorage.setItem(storageKey, selectedPersona.entity_id)

    // Quiet reconciliation: refresh server components once when dashboard was rendered with stale cookie.
    if (
      cookieWasStale &&
      !hasRefreshedForPersonaMismatch.current &&
      window.location.pathname.includes('/dashboard')
    ) {
      hasRefreshedForPersonaMismatch.current = true
      router.refresh()
    }
  }, [router, storageKey])

  // Load personas from database
  const refreshPersonas = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setPersonas([])
        setActivePersona(null)
        return
      }

      const { data, error: rpcError } = await supabase.rpc('get_user_personas', {
        p_user_id: user.id
      })

      if (rpcError) {
        console.error('[persona-context] Error fetching personas:', rpcError)
        setError(rpcError.message)
        return
      }

      const fetchedPersonas = (data || []) as Persona[]
      setPersonas(fetchedPersonas)

      const selectedPersona = selectPersonaFromContext(fetchedPersonas)

      setActivePersona(selectedPersona)
      syncSelectedPersona(selectedPersona)

    } catch (err) {
      console.error('[persona-context] Unexpected error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load personas')
    } finally {
      setIsLoading(false)
    }
  }, [selectPersonaFromContext, syncSelectedPersona])

  // Switch active persona
  const switchPersona = useCallback((persona: Persona) => {
    // Update React state immediately for instant UI feedback
    setActivePersona(persona)
    // Persist to localStorage for future sessions
    localStorage.setItem(storageKey, persona.entity_id)
    // Set cookie for server-side persona detection
    setPersonaCookie(persona.persona_type, persona.entity_id)
    hasRefreshedForPersonaMismatch.current = true

    startPersonaSwitchTransition(() => {
      if (pathname.startsWith('/versotech_main/dashboard')) {
        router.refresh()
        return
      }

      router.push('/versotech_main/dashboard')
    })
  }, [pathname, router, startPersonaSwitchTransition, storageKey])

  // Load personas on mount if not provided
  useEffect(() => {
    if (!initialPersonas.length) {
      refreshPersonas()
    } else {
      const selectedPersona = selectPersonaFromContext(initialPersonas)

      setActivePersona(selectedPersona ?? null)
      syncSelectedPersona(selectedPersona)
      setIsLoading(false)
    }
  }, [initialPersonas, refreshPersonas, selectPersonaFromContext, syncSelectedPersona])

  // Derived state helpers
  // CEO check: user has a 'ceo' persona (from ceo_users table)
  const isCEO = personas.some(p => p.persona_type === 'ceo')

  // Staff check: any staff persona
  const isStaff = personas.some(p => p.persona_type === 'staff')

  // Investor check: any investor persona
  const isInvestor = personas.some(p => p.persona_type === 'investor')

  // Partner check: any partner, introducer, commercial_partner, or arranger persona
  const isPartner = personas.some(p =>
    ['partner', 'introducer', 'commercial_partner', 'arranger'].includes(p.persona_type)
  )

  // Lawyer check: any lawyer persona
  const isLawyer = personas.some(p => p.persona_type === 'lawyer')

  // Commercial Partner check: any commercial_partner persona
  const isCommercialPartner = personas.some(p => p.persona_type === 'commercial_partner')

  // Introducer check: any introducer persona
  const isIntroducer = personas.some(p => p.persona_type === 'introducer')

  // Arranger check: any arranger persona
  const isArranger = personas.some(p => p.persona_type === 'arranger')

  // Has any persona (used for deal access - anyone with a persona can potentially view deals)
  const hasAnyPersona = personas.length > 0

  // Multiple personas check
  const hasMultiplePersonas = personas.length > 1

  const value: PersonaContextState = {
    personas,
    activePersona,
    isLoading,
    isSwitchingPersona,
    error,
    switchPersona,
    refreshPersonas,
    isCEO,
    isStaff,
    isInvestor,
    isPartner,
    isLawyer,
    isCommercialPartner,
    isIntroducer,
    isArranger,
    hasAnyPersona,
    hasMultiplePersonas,
  }

  return (
    <PersonaContext.Provider value={value}>
      {children}
    </PersonaContext.Provider>
  )
}

/**
 * Hook to access persona context
 */
export function usePersona() {
  const context = useContext(PersonaContext)

  if (context === undefined) {
    throw new Error('usePersona must be used within a PersonaProvider')
  }

  return context
}

/**
 * Get navigation items for a persona
 */
export function getNavItemsForPersona(persona: Persona): { href: string; label: string; icon?: string }[] {
  const baseItems: Record<string, { href: string; label: string; icon?: string }[]> = {
    // CEO persona - full access to Verso Capital management
    // Note: CEO Profile is accessed via user menu (Profile Settings), not sidebar
    ceo: [
      { href: '/versotech_main/dashboard', label: 'Dashboard' },
      { href: '/versotech_main/deals', label: 'Deals' },
      { href: '/versotech_main/subscriptions', label: 'Subscriptions' },
      { href: '/versotech_main/investors', label: 'Investors' },
      { href: '/versotech_main/documents', label: 'Documents' },
      { href: '/versotech_main/messages', label: 'Messages' },
      { href: '/versotech_main/users', label: 'Users' },
      { href: '/versotech_main/kyc-review', label: 'KYC Review' },
      { href: '/versotech_main/fees', label: 'Fees' },
      { href: '/versotech_main/audit', label: 'Audit' },
    ],
    staff: [
      { href: '/versotech_main/dashboard', label: 'Dashboard' },
      { href: '/versotech_main/deals', label: 'Deals' },
      { href: '/versotech_main/subscriptions', label: 'Subscriptions' },
      { href: '/versotech_main/investors', label: 'Investors' },
      { href: '/versotech_main/documents', label: 'Documents' },
      { href: '/versotech_main/messages', label: 'Messages' },
    ],
    investor: [
      { href: '/versotech_main/dashboard', label: 'Dashboard' },
      { href: '/versotech_main/opportunities', label: 'Opportunities' },
      { href: '/versotech_main/portfolio', label: 'Portfolio' },
      { href: '/versotech_main/documents', label: 'Documents' },
      { href: '/versotech_main/messages', label: 'Messages' },
    ],
    arranger: [
      { href: '/versotech_main/dashboard', label: 'Dashboard' },
      { href: '/versotech_main/my-mandates', label: 'My Mandates' },
      { href: '/versotech_main/my-partners', label: 'My Partners' },
      { href: '/versotech_main/my-introducers', label: 'My Introducers' },
      { href: '/versotech_main/my-commercial-partners', label: 'My Commercial Partners' },
      { href: '/versotech_main/my-lawyers', label: 'My Lawyers' },
    ],
    introducer: [
      { href: '/versotech_main/dashboard', label: 'Dashboard' },
      { href: '/versotech_main/introductions', label: 'Introductions' },
      { href: '/versotech_main/introducer-agreements', label: 'Agreements' },
    ],
    partner: [
      { href: '/versotech_main/dashboard', label: 'Dashboard' },
      { href: '/versotech_main/partner-transactions', label: 'Transactions' },
      { href: '/versotech_main/shared-transactions', label: 'Shared Deals' },
    ],
    commercial_partner: [
      { href: '/versotech_main/dashboard', label: 'Dashboard' },
      { href: '/versotech_main/client-transactions', label: 'Client Transactions' },
      { href: '/versotech_main/placement-agreements', label: 'Agreements' },
    ],
    lawyer: [
      { href: '/versotech_main/dashboard', label: 'Dashboard' },
      { href: '/versotech_main/assigned-deals', label: 'Assigned Deals' },
      { href: '/versotech_main/escrow', label: 'Escrow' },
      { href: '/versotech_main/subscription-packs', label: 'Subscription Packs' },
    ],
  }

  return [...(baseItems[persona.persona_type] || [])]
}
