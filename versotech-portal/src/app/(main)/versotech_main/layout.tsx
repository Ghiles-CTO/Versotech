import { ReactNode } from 'react'
import { getProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PersonaProvider, Persona } from '@/contexts/persona-context'
import { UnifiedAppLayout } from '@/components/layout/unified-app-layout'
import { ProxyModeProvider, ProxyModeBanner } from '@/components/commercial-partner'
import { PlatformTour } from '@/components/tour'

export const dynamic = 'force-dynamic'

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

  let userPersonas: Persona[] = (personas || []) as Persona[]

  // Fetch tour completion status
  const { data: tourStatus } = await supabase
    .from('profiles')
    .select('has_completed_platform_tour')
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

  // Determine active persona for tour using priority order
  // This MUST match the priority order in persona-context.tsx
  // CEO gets highest priority (1), investor gets lowest (8)
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

  // Type as string to allow extended investor types (investor_entity, investor_individual)
  let activePersonaForTour: string = userPersonas.length > 0
    ? userPersonas.reduce((best, current) => {
        const bestPriority = personaPriority[best.persona_type] ?? 99
        const currentPriority = personaPriority[current.persona_type] ?? 99
        return currentPriority < bestPriority ? current : best
      }).persona_type
    : 'investor'

  // For investor persona, differentiate between entity and individual
  // Entity investors see more complex tour (member management, entity docs)
  // Individual investors see simpler tour (personal portfolio focus)
  if (activePersonaForTour === 'investor') {
    // Find the investor persona to get the entity_id
    const investorPersona = userPersonas.find(p => p.persona_type === 'investor')
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

  return (
    <PersonaProvider initialPersonas={userPersonas}>
      <ProxyModeProvider>
        <ProxyModeBanner />
        <PlatformTour
          activePersona={activePersonaForTour}
          hasCompletedTour={tourStatus?.has_completed_platform_tour ?? false}
        >
          <UnifiedAppLayout profile={profile}>
            {children}
          </UnifiedAppLayout>
        </PlatformTour>
      </ProxyModeProvider>
    </PersonaProvider>
  )
}
