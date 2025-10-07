import { AppLayout } from '@/components/layout/app-layout'
import { createSmartClient } from '@/lib/supabase/smart-client'
import { EntitiesPageClient } from '@/components/entities/entities-page-client'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function EntitiesPage() {
  // Check authentication first
  const user = await getCurrentUser()
  if (!user || !user.role.startsWith('staff_')) {
    redirect('/versotech/login')
  }

  const supabase = await createSmartClient()

  console.log('[EntitiesPage] Loading entities for user:', user.email, 'role:', user.role)

  const { data: entities, error } = await supabase
    .from('vehicles')
    .select('id, name, type, domicile, currency, formation_date, legal_jurisdiction, registration_number, notes, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[EntitiesPage] Error loading entities:', error)
  } else {
    console.log('[EntitiesPage] Loaded', entities?.length || 0, 'entities')
  }

  return (
    <AppLayout brand="versotech">
      <EntitiesPageClient entities={entities || []} />
    </AppLayout>
  )
}

