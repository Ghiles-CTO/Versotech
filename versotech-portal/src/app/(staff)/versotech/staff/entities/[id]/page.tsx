import { AppLayout } from '@/components/layout/app-layout'
import { createSmartClient } from '@/lib/supabase/smart-client'
import { redirect } from 'next/navigation'
import { EntityDetailEnhanced } from '@/components/entities/entity-detail-enhanced'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function EntityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Check authentication first
  const user = await getCurrentUser()
  if (!user || !user.role.startsWith('staff_')) {
    console.error('[EntityDetailPage] Unauthorized access attempt')
    redirect('/versotech/staff/entities')
  }

  const { id } = await params
  const supabase = await createSmartClient()

  // Fetch entity with all fields including CSV data
  const { data: entity, error: entityError } = await supabase
    .from('vehicles')
    .select('*')
    .eq('id', id)
    .single()

  if (entityError || !entity) {
    console.error('[EntityDetailPage] Failed to load entity:', {
      id,
      error: entityError?.message
    })
    redirect('/versotech/staff/entities')
  }

  // Fetch all related data in parallel
  const [
    { data: directors },
    { data: stakeholders },
    { data: folders },
    { data: flags },
    { data: deals },
    { data: events }
  ] = await Promise.all([
    supabase
      .from('entity_directors')
      .select('*')
      .eq('vehicle_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('entity_stakeholders')
      .select('*')
      .eq('vehicle_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('entity_folders')
      .select('*')
      .eq('vehicle_id', id)
      .order('folder_type', { ascending: true }),
    supabase
      .from('entity_flags')
      .select('*')
      .eq('vehicle_id', id)
      .eq('is_resolved', false)
      .order('severity', { ascending: true }),
    supabase
      .from('deals')
      .select('id, name, status, deal_type, currency, created_at')
      .eq('vehicle_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('entity_events')
      .select(`
        id,
        event_type,
        description,
        payload,
        created_at,
        changed_by_profile:profiles!entity_events_changed_by_fkey(
          id,
          display_name,
          email
        )
      `)
      .eq('vehicle_id', id)
      .order('created_at', { ascending: false })
      .limit(50)
  ])

  return (
    <AppLayout brand="versotech">
      <EntityDetailEnhanced
        entity={{ ...entity, updated_at: null }}
        directors={directors || []}
        stakeholders={stakeholders || []}
        folders={folders || []}
        flags={flags || []}
        deals={deals || []}
        events={(events as any) || []}
      />
    </AppLayout>
  )
}


