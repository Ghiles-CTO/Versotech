import { createSmartClient } from '@/lib/supabase/smart-client'
import { EntitiesPageEnhanced } from '@/components/entities/entities-page-enhanced'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function EntitiesPage() {
  // Check authentication first
  const user = await getCurrentUser()
  if (!user || !(user.role.startsWith('staff_') || user.role === 'ceo')) {
    redirect('/versotech/login')
  }

  const supabase = await createSmartClient()

  console.log('[EntitiesPage] Loading entities for user:', user.email, 'role:', user.role)

  // Select all fields including the new CSV fields
  const { data: entities, error } = await supabase
    .from('vehicles')
    .select('*')
    .order('entity_code', { ascending: true, nullsFirst: false })

  if (error) {
    console.error('[EntitiesPage] Error loading entities:', error)
  }

  let enrichedEntities = entities || []

  if (entities && entities.length > 0) {
    const vehicleIds = entities.map((entity) => entity.id)

    try {
      const [
        { data: investorLinks, error: investorLinksError },
        { data: subscriptionRows, error: subscriptionError },
        { data: openFlags, error: openFlagsError },
        { data: latestEvents, error: latestEventsError }
      ] = await Promise.all([
        supabase
          .from('entity_investors')
          .select('vehicle_id, investor_id')
          .in('vehicle_id', vehicleIds),
        supabase
          .from('subscriptions')
          .select('vehicle_id, investor_id')
          .in('vehicle_id', vehicleIds),
        supabase
          .from('entity_flags')
          .select('vehicle_id')
          .eq('status', 'open')
          .in('vehicle_id', vehicleIds),
        supabase
          .from('entity_events')
          .select('vehicle_id, created_at')
          .in('vehicle_id', vehicleIds)
      ])

      if (investorLinksError) {
        console.error('[EntitiesPage] investor link aggregate error:', investorLinksError)
      }
      if (subscriptionError) {
        console.error('[EntitiesPage] subscription aggregate error:', subscriptionError)
      }
      if (openFlagsError) {
        console.error('[EntitiesPage] flag aggregate error:', openFlagsError)
      }
      if (latestEventsError) {
        console.error('[EntitiesPage] event aggregate error:', latestEventsError)
      }

      const investorCountMap = new Map<string, Set<string>>()
      ;(investorLinks ?? []).forEach((row) => {
        if (!row?.vehicle_id) return
        const set = investorCountMap.get(row.vehicle_id) ?? new Set<string>()
        if (row.investor_id) {
          set.add(row.investor_id)
        } else {
          set.add(`entity-link-${row.vehicle_id}-${set.size}`)
        }
        investorCountMap.set(row.vehicle_id, set)
      })
      ;(subscriptionRows ?? []).forEach((row) => {
        if (!row?.vehicle_id || !row?.investor_id) return
        const set = investorCountMap.get(row.vehicle_id) ?? new Set<string>()
        set.add(row.investor_id)
        investorCountMap.set(row.vehicle_id, set)
      })

      const flagCountMap = new Map<string, number>()
      ;(openFlags ?? []).forEach((row) => {
        if (!row?.vehicle_id) return
        flagCountMap.set(
          row.vehicle_id,
          (flagCountMap.get(row.vehicle_id) || 0) + 1
        )
      })

      const lastEventMap = new Map<string, string>()
      ;(latestEvents ?? []).forEach((row) => {
        if (!row?.vehicle_id || !row?.created_at) return
        const current = lastEventMap.get(row.vehicle_id)
        if (!current || new Date(row.created_at) > new Date(current)) {
          lastEventMap.set(row.vehicle_id, row.created_at)
        }
      })

      enrichedEntities = entities.map((entity) => ({
        ...entity,
        investor_count: investorCountMap.get(entity.id)?.size || 0,
        open_flag_count: flagCountMap.get(entity.id) || 0,
        last_event_at: lastEventMap.get(entity.id) || null
      }))
    } catch (aggregateError) {
      console.error('[EntitiesPage] Failed to load entity aggregates:', aggregateError)
    }
  }

  console.log('[EntitiesPage] Loaded', enrichedEntities.length, 'entities')

  return (
    <EntitiesPageEnhanced entities={enrichedEntities} />
    )
}

