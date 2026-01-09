import { ReactNode } from 'react'
import { getProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PersonaProvider, Persona } from '@/contexts/persona-context'
import { UnifiedAppLayout } from '@/components/layout/unified-app-layout'
import { ProxyModeProvider, ProxyModeBanner } from '@/components/commercial-partner'

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

  return (
    <PersonaProvider initialPersonas={userPersonas}>
      <ProxyModeProvider>
        <ProxyModeBanner />
        <UnifiedAppLayout profile={profile}>
          {children}
        </UnifiedAppLayout>
      </ProxyModeProvider>
    </PersonaProvider>
  )
}
