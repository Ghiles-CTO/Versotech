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

  // Check if user has CEO-level access (staff persona with ceo or staff_admin role)
  // DESIGN DECISION: Both 'ceo' AND 'staff_admin' roles get admin portal access.
  // This is intentional - staff_admin users are system administrators who need
  // full platform access. See middleware.ts for the same check.
  const isCEO = userPersonas.some(
    p => p.persona_type === 'staff' &&
      (p.role_in_entity === 'ceo' || p.role_in_entity === 'staff_admin')
  )

  if (!isCEO) {
    console.warn('[AdminPortalLayout] Non-CEO user attempted to access admin:', profile.email)
    redirect('/versotech_main/dashboard')
  }

  return (
    <PersonaProvider initialPersonas={userPersonas}>
      <AdminLayoutContent profile={profile}>
        {children}
      </AdminLayoutContent>
    </PersonaProvider>
  )
}
