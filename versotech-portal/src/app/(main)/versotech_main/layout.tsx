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
import { resolveActivePersona, type PersonaIdentity } from '@/lib/persona/active-persona'

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

  const recoverPersonasFromMemberships = async (): Promise<Persona[]> => {
    try {
      const recovered: Persona[] = []

      const [
        { data: ceoRows },
        { data: investorRows },
        { data: arrangerRows },
        { data: introducerRows },
        { data: partnerRows },
        { data: commercialPartnerRows },
        { data: lawyerRows },
      ] = await Promise.all([
        supabase.from('ceo_users').select('role, is_primary, can_sign').eq('user_id', profile.id),
        supabase.from('investor_users').select('investor_id, role, is_primary, can_sign').eq('user_id', profile.id),
        supabase.from('arranger_users').select('arranger_id, role, is_primary').eq('user_id', profile.id),
        supabase.from('introducer_users').select('introducer_id, role, is_primary, can_sign').eq('user_id', profile.id),
        supabase.from('partner_users').select('partner_id, role, is_primary, can_sign').eq('user_id', profile.id),
        supabase.from('commercial_partner_users').select('commercial_partner_id, role, is_primary, can_sign, can_execute_for_clients').eq('user_id', profile.id),
        supabase.from('lawyer_users').select('lawyer_id, role, is_primary').eq('user_id', profile.id),
      ])

      if (Array.isArray(ceoRows)) {
        recovered.push(
          ...ceoRows.map((row: any): Persona => ({
            persona_type: 'ceo',
            entity_id: 'internal',
            entity_name: 'VERSO Capital',
            entity_logo_url: null,
            role_in_entity: row.role || 'member',
            is_primary: row.is_primary ?? true,
            can_sign: Boolean(row.can_sign),
            can_execute_for_clients: false,
          }))
        )
      }

      if (Array.isArray(investorRows)) {
        recovered.push(
          ...investorRows.map((row: any): Persona => ({
            persona_type: 'investor',
            entity_id: row.investor_id,
            entity_name: 'Investor',
            entity_logo_url: null,
            role_in_entity: row.role || 'member',
            is_primary: Boolean(row.is_primary),
            can_sign: Boolean(row.can_sign),
            can_execute_for_clients: false,
          }))
        )
      }

      if (Array.isArray(arrangerRows)) {
        recovered.push(
          ...arrangerRows.map((row: any): Persona => ({
            persona_type: 'arranger',
            entity_id: row.arranger_id,
            entity_name: 'Arranger',
            entity_logo_url: null,
            role_in_entity: row.role || 'member',
            is_primary: Boolean(row.is_primary),
            can_sign: false,
            can_execute_for_clients: false,
          }))
        )
      }

      if (Array.isArray(introducerRows)) {
        recovered.push(
          ...introducerRows.map((row: any): Persona => ({
            persona_type: 'introducer',
            entity_id: row.introducer_id,
            entity_name: 'Introducer',
            entity_logo_url: null,
            role_in_entity: row.role || 'member',
            is_primary: Boolean(row.is_primary),
            can_sign: Boolean(row.can_sign),
            can_execute_for_clients: false,
          }))
        )
      }

      if (Array.isArray(partnerRows)) {
        recovered.push(
          ...partnerRows.map((row: any): Persona => ({
            persona_type: 'partner',
            entity_id: row.partner_id,
            entity_name: 'Partner',
            entity_logo_url: null,
            role_in_entity: row.role || 'member',
            is_primary: Boolean(row.is_primary),
            can_sign: Boolean(row.can_sign),
            can_execute_for_clients: false,
          }))
        )
      }

      if (Array.isArray(commercialPartnerRows)) {
        recovered.push(
          ...commercialPartnerRows.map((row: any): Persona => ({
            persona_type: 'commercial_partner',
            entity_id: row.commercial_partner_id,
            entity_name: 'Commercial Partner',
            entity_logo_url: null,
            role_in_entity: row.role || 'member',
            is_primary: Boolean(row.is_primary),
            can_sign: Boolean(row.can_sign),
            can_execute_for_clients: Boolean(row.can_execute_for_clients),
          }))
        )
      }

      if (Array.isArray(lawyerRows)) {
        recovered.push(
          ...lawyerRows.map((row: any): Persona => ({
            persona_type: 'lawyer',
            entity_id: row.lawyer_id,
            entity_name: 'Lawyer',
            entity_logo_url: null,
            role_in_entity: row.role || 'member',
            is_primary: Boolean(row.is_primary),
            can_sign: false,
            can_execute_for_clients: false,
          }))
        )
      }

      return recovered
    } catch (error) {
      console.error('[UnifiedPortalLayout] Membership-based persona recovery failed:', error)
      return []
    }
  }

  // Fetch tour completion status
  const { data: tourStatus } = await supabase
    .from('profiles')
    .select('has_completed_platform_tour, platform_tour_state')
    .eq('id', profile.id)
    .single()

  // Fallback path for legacy users when persona RPC returns nothing.
  if (userPersonas.length === 0) {
    const recoveredPersonas = await recoverPersonasFromMemberships()
    if (recoveredPersonas.length > 0) {
      userPersonas = recoveredPersonas
      console.log('[UnifiedPortalLayout] Recovered personas from memberships for:', profile.email, profile.role)
    } else {
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
  }

  // Determine active persona for tour using the same resolver as the client.
  const selectedPersonaForTour = resolveActivePersona(userPersonas as PersonaIdentity[], {
    cookiePersonaType: activePersonaTypeCookie,
    cookiePersonaId: activePersonaIdCookie,
  })

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
  const hasCompletedTour = Boolean(
    activeTourState?.completed && activeTourState?.version === TOUR_VERSION
  )

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
    <PersonaProvider initialPersonas={userPersonas} userId={profile.id}>
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
