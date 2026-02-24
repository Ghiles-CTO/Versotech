import { ReactNode } from 'react'
import { getProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PersonaProvider, Persona } from '@/contexts/persona-context'
import { AdminLayoutContent } from './components/admin-layout-content'

export const dynamic = 'force-dynamic'

interface LayoutProps {
  children: ReactNode
}

export default async function AdminPortalLayout({ children }: LayoutProps) {
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
    console.error('[AdminPortalLayout] Error fetching personas:', personasError)
  }

  const userPersonas: Persona[] = (personas || []) as Persona[]

  // Check if user has CEO-level access
  // DESIGN DECISION: Access granted if user has:
  // 1. 'ceo' persona type, OR
  // 2. 'staff' persona with 'ceo' or 'staff_admin' role
  const isCEO = userPersonas.some(
    p => p.persona_type === 'ceo' ||
      (p.persona_type === 'staff' && (p.role_in_entity === 'ceo' || p.role_in_entity === 'staff_admin'))
  )

  if (!isCEO) {
    console.warn('[AdminPortalLayout] Non-CEO user attempted to access admin:', profile.email)
    redirect('/versotech_main/dashboard')
  }

  return (
    <PersonaProvider initialPersonas={userPersonas} userId={profile.id}>
      <AdminLayoutContent profile={profile}>
        {children}
      </AdminLayoutContent>
    </PersonaProvider>
  )
}
