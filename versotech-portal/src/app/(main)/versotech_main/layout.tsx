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

  const userPersonas: Persona[] = (personas || []) as Persona[]

  // If user has no personas, redirect to unified login with error
  if (userPersonas.length === 0) {
    console.warn('[UnifiedPortalLayout] User has no personas:', profile.email)
    redirect('/versotech_main/login?error=no_personas')
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
