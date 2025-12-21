'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'

/**
 * Persona type matching get_user_personas() function return
 */
export interface Persona {
  persona_type: 'staff' | 'investor' | 'arranger' | 'introducer' | 'partner' | 'commercial_partner' | 'lawyer'
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
  error: string | null
  switchPersona: (persona: Persona) => void
  refreshPersonas: () => Promise<void>
  // Helper checks
  isCEO: boolean
  isStaff: boolean
  isInvestor: boolean
  isPartner: boolean
  isLawyer: boolean
  hasAnyPersona: boolean
  hasMultiplePersonas: boolean
}

const PersonaContext = createContext<PersonaContextState | undefined>(undefined)

const ACTIVE_PERSONA_KEY = 'verso_active_persona'

interface PersonaProviderProps {
  children: ReactNode
  initialPersonas?: Persona[]
}

export function PersonaProvider({ children, initialPersonas = [] }: PersonaProviderProps) {
  const [personas, setPersonas] = useState<Persona[]>(initialPersonas)
  const [activePersona, setActivePersona] = useState<Persona | null>(null)
  const [isLoading, setIsLoading] = useState(!initialPersonas.length)
  const [error, setError] = useState<string | null>(null)

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

      // Restore active persona from localStorage or pick primary/first
      const savedPersonaId = localStorage.getItem(ACTIVE_PERSONA_KEY)
      let selectedPersona: Persona | null = null

      if (savedPersonaId) {
        selectedPersona = fetchedPersonas.find(p => p.entity_id === savedPersonaId) || null
      }

      if (!selectedPersona) {
        // Pick primary persona, or first one
        selectedPersona = fetchedPersonas.find(p => p.is_primary) || fetchedPersonas[0] || null
      }

      setActivePersona(selectedPersona)

    } catch (err) {
      console.error('[persona-context] Unexpected error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load personas')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Switch active persona
  const switchPersona = useCallback((persona: Persona) => {
    setActivePersona(persona)
    localStorage.setItem(ACTIVE_PERSONA_KEY, persona.entity_id)
  }, [])

  // Load personas on mount if not provided
  useEffect(() => {
    if (!initialPersonas.length) {
      refreshPersonas()
    } else {
      // Set active from initial personas
      const savedPersonaId = localStorage.getItem(ACTIVE_PERSONA_KEY)
      let selectedPersona = savedPersonaId
        ? initialPersonas.find(p => p.entity_id === savedPersonaId)
        : null

      if (!selectedPersona) {
        selectedPersona = initialPersonas.find(p => p.is_primary) || initialPersonas[0] || null
      }

      setActivePersona(selectedPersona)
      setIsLoading(false)
    }
  }, [initialPersonas, refreshPersonas])

  // Derived state helpers
  // CEO check: persona_type === 'staff' AND (role_in_entity === 'ceo' OR 'staff_admin')
  // Note: staff_admin users have CEO-level access until proper role migration
  const isCEO = personas.some(p =>
    p.persona_type === 'staff' &&
    (p.role_in_entity === 'ceo' || p.role_in_entity === 'staff_admin')
  )

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

  // Has any persona (used for deal access - anyone with a persona can potentially view deals)
  const hasAnyPersona = personas.length > 0

  // Multiple personas check
  const hasMultiplePersonas = personas.length > 1

  const value: PersonaContextState = {
    personas,
    activePersona,
    isLoading,
    error,
    switchPersona,
    refreshPersonas,
    isCEO,
    isStaff,
    isInvestor,
    isPartner,
    isLawyer,
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

  const items = [...(baseItems[persona.persona_type] || [])]

  // Add CEO-specific items for staff with ceo or staff_admin role
  if (persona.persona_type === 'staff' && (persona.role_in_entity === 'ceo' || persona.role_in_entity === 'staff_admin')) {
    items.push(
      { href: '/versotech_main/users', label: 'Users' },
      { href: '/versotech_main/kyc-review', label: 'KYC Review' },
      { href: '/versotech_main/fees', label: 'Fees' },
      { href: '/versotech_main/audit', label: 'Audit' },
    )
  }

  return items
}
