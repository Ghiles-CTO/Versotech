import { AppLayout } from '@/components/layout/app-layout'
import { createSmartClient } from '@/lib/supabase/smart-client'
import { redirect } from 'next/navigation'
import { EntityDetailClient } from '@/components/entities/entity-detail-client'
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

  const { data: entity, error: entityError } = await supabase
    .from('vehicles')
    .select(
      `
      id,
      name,
      type,
      domicile,
      currency,
      formation_date,
      legal_jurisdiction,
      registration_number,
      notes,
      created_at
    `
    )
    .eq('id', id)
    .single()

  if (entityError || !entity) {
    console.error('[EntityDetailPage] Failed to load entity:', {
      id,
      error: entityError?.message
    })
    redirect('/versotech/staff/entities')
  }

  const { data: directors } = await supabase
    .from('entity_directors')
    .select('id, full_name, role, email, effective_from, effective_to, notes, created_at')
    .eq('vehicle_id', id)
    .order('effective_from', { ascending: false })

  const { data: deals } = await supabase
    .from('deals')
    .select('id, name, status, deal_type, currency, created_at')
    .eq('vehicle_id', id)
    .order('created_at', { ascending: false })

  const { data: events } = await supabase
    .from('entity_events')
    .select(
      `
      id,
      event_type,
      description,
      payload,
      created_at,
      changed_by_profile:changed_by (
        id,
        display_name,
        email
      )
    `
    )
    .eq('vehicle_id', id)
    .order('created_at', { ascending: false })

  return (
    <AppLayout brand="versotech">
      <EntityDetailClient
        entity={{ ...entity, updated_at: null }}
        directors={directors || []}
        deals={deals || []}
        events={(events as any) || []}
      />
    </AppLayout>
  )
}


