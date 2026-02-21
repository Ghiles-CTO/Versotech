import { ReactNode } from 'react'
import { getProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { PersonaProvider, Persona } from '@/contexts/persona-context'
import { UnifiedAppLayout } from '@/components/layout/unified-app-layout'
import { ProxyModeProvider, ProxyModeBanner } from '@/components/commercial-partner'
import { PlatformTour } from '@/components/tour'
import { fetchMemberWithAutoLink } from '@/lib/kyc/member-linking'
import { TOUR_VERSION } from '@/config/platform-tour'

export const dynamic = 'force-dynamic'

const ACTIVE_PERSONA_TYPE_COOKIE = 'verso_active_persona_type'
const ACTIVE_PERSONA_ID_COOKIE = 'verso_active_persona_id'

type TourStateEntry = {
  completed?: boolean
  completedAt?: string
  version?: string
}

type PlatformTourState = Record<string, TourStateEntry>

const PERSONA_MEMBER_CONFIG: Partial<
  Record<Persona['persona_type'], { memberTable: string; entityIdColumn: string }>
> = {
  investor: { memberTable: 'investor_members', entityIdColumn: 'investor_id' },
  partner: { memberTable: 'partner_members', entityIdColumn: 'partner_id' },
  introducer: { memberTable: 'introducer_members', entityIdColumn: 'introducer_id' },
  lawyer: { memberTable: 'lawyer_members', entityIdColumn: 'lawyer_id' },
  commercial_partner: { memberTable: 'commercial_partner_members', entityIdColumn: 'commercial_partner_id' },
  arranger: { memberTable: 'arranger_members', entityIdColumn: 'arranger_id' },
}

interface LayoutProps {
  children: ReactNode
}

export default async function UnifiedPortalLayout({ children }: LayoutProps) {
  // Get user profile
  const profile = await getProfile()

  if (!profile) {
    redirect('/versotech_main/login')
  }

  // Fetch personas for the user
  const supabase = await createClient()
  const { data: personas, error: personasError } = await supabase.rpc('get_user_personas', {
    p_user_id: profile.id
  })

  if (personasError) {
    console.error('[UnifiedPortalLayout] Error fetching personas:', personasError)
  }

  const cookieStore = await cookies()
  const activePersonaTypeCookie = cookieStore.get(ACTIVE_PERSONA_TYPE_COOKIE)?.value
  const activePersonaIdCookie = cookieStore.get(ACTIVE_PERSONA_ID_COOKIE)?.value

  let userPersonas: Persona[] = (personas || []) as Persona[]

  // Fetch tour completion status
  const { data: tourStatus } = await supabase
    .from('profiles')
    .select('has_completed_platform_tour, platform_tour_state')
    .eq('id', profile.id)
    .single()

  // Staff roles don't have traditional persona entries - create synthetic persona
  // This matches the fallback logic in middleware.ts
  if (userPersonas.length === 0) {
    const staffRoles = ['staff_admin', 'staff_ops', 'staff_rm', 'ceo']
    if (staffRoles.includes(profile.role)) {
      // staff_admin and ceo get 'ceo' persona for full access (all pages)
      // staff_ops and staff_rm get 'staff' persona for limited access
      const personaType = (profile.role === 'ceo' || profile.role === 'staff_admin') ? 'ceo' : 'staff'

      // Create synthetic persona for internal team members
      userPersonas = [{
        persona_type: personaType,
        entity_id: 'internal',
        entity_name: 'VERSO Staff',
        entity_logo_url: null,
        role_in_entity: profile.role,
        is_primary: true,
        can_sign: profile.role === 'ceo' || profile.role === 'staff_admin',
        can_execute_for_clients: false,
      }]
      console.log('[UnifiedPortalLayout] Created synthetic persona for:', profile.email, profile.role, '→', personaType)
    } else {
      // Non-staff user with no personas - redirect to login
      console.warn('[UnifiedPortalLayout] User has no personas:', profile.email)
      redirect('/versotech_main/login?error=no_personas')
    }
  }

  // Determine active persona for tour.
  // Source of truth order:
  // 1) Active persona id + type cookie
  // 2) Active persona type cookie
  // 3) Priority fallback (matches persona-context)
  const personaPriority: Record<string, number> = {
    'ceo': 1,
    'staff': 2,
    'arranger': 3,
    'introducer': 4,
    'partner': 5,
    'commercial_partner': 6,
    'lawyer': 7,
    'investor': 8,
  }

  let selectedPersonaForTour: Persona | null = null
  if (activePersonaIdCookie) {
    selectedPersonaForTour = userPersonas.find((persona) =>
      persona.entity_id === activePersonaIdCookie &&
      (!activePersonaTypeCookie || persona.persona_type === activePersonaTypeCookie)
    ) || null
  }

  if (!selectedPersonaForTour && activePersonaTypeCookie) {
    selectedPersonaForTour = userPersonas.find(
      (persona) => persona.persona_type === activePersonaTypeCookie
    ) || null
  }

  if (!selectedPersonaForTour && userPersonas.length > 0) {
    selectedPersonaForTour = userPersonas.reduce((best, current) => {
      const bestPriority = personaPriority[best.persona_type] ?? 99
      const currentPriority = personaPriority[current.persona_type] ?? 99
      return currentPriority < bestPriority ? current : best
    })
  }

  // Type as string to allow extended investor types (investor_entity, investor_individual)
  let activePersonaForTour: string = selectedPersonaForTour
    ? selectedPersonaForTour.persona_type
    : 'investor'

  // For investor persona, differentiate between entity and individual
  // Entity investors see more complex tour (member management, entity docs)
  // Individual investors see simpler tour (personal portfolio focus)
  if (activePersonaForTour === 'investor') {
    // Find the investor persona to get the entity_id
    const investorPersona =
      (selectedPersonaForTour?.persona_type === 'investor' ? selectedPersonaForTour : null) ||
      userPersonas.find(p => p.persona_type === 'investor')
    if (investorPersona) {
      // Query the investors table to check if entity or individual
      const { data: investor } = await supabase
        .from('investors')
        .select('type')
        .eq('id', investorPersona.entity_id)
        .maybeSingle()

      // type is 'entity' or 'individual'
      activePersonaForTour = investor?.type === 'entity'
        ? 'investor_entity'
        : 'investor_individual'
    }
  }

  const rawTourState = tourStatus?.platform_tour_state
  const platformTourState: PlatformTourState =
    rawTourState && typeof rawTourState === 'object' && !Array.isArray(rawTourState)
      ? (rawTourState as PlatformTourState)
      : {}
  const activeTourState = platformTourState[activePersonaForTour]
  const hasPersonaScopedCompletion = Boolean(
    activeTourState?.completed && activeTourState?.version === TOUR_VERSION
  )
  const hasLegacyCompletion = Boolean(tourStatus?.has_completed_platform_tour)
  // Backward compatibility: existing users with only legacy completion should not be forced
  // through the tour until they explicitly restart it.
  const hasCompletedTour = hasPersonaScopedCompletion || hasLegacyCompletion

  // Auto-link/create member rows for persona-backed users on login.
  // If the user's email is not in members for that entity, create a linked member record.
  const serviceSupabase = createServiceClient()
  for (const persona of userPersonas) {
    const memberConfig = PERSONA_MEMBER_CONFIG[persona.persona_type]
    if (!memberConfig || !persona.entity_id || persona.entity_id === 'internal') continue

    const { error: memberLinkError } = await fetchMemberWithAutoLink({
      supabase: serviceSupabase,
      memberTable: memberConfig.memberTable,
      entityIdColumn: memberConfig.entityIdColumn,
      entityId: persona.entity_id,
      userId: profile.id,
      userEmail: profile.email,
      defaultFullName: profile.displayName || profile.email || null,
      createIfMissing: true,
      context: `UnifiedPortalLayout:${persona.persona_type}`,
      select: 'id, linked_user_id, email, full_name, first_name, last_name, role, kyc_status',
    })

    if (memberLinkError) {
      console.error('[UnifiedPortalLayout] Failed member auto-link/create', {
        personaType: persona.persona_type,
        entityId: persona.entity_id,
        error: memberLinkError,
      })
    }
  }

  return (
    <PersonaProvider initialPersonas={userPersonas}>
      <ProxyModeProvider>
        <ProxyModeBanner />
        <PlatformTour
          activePersona={activePersonaForTour}
          hasCompletedTour={hasCompletedTour}
        >
          <UnifiedAppLayout profile={profile}>
            {children}
          </UnifiedAppLayout>
        </PlatformTour>
      </ProxyModeProvider>
    </PersonaProvider>
  )
}
