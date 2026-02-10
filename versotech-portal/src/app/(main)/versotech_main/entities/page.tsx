import { createClient, createServiceClient } from '@/lib/supabase/server'
import { EntitiesPageEnhanced } from '@/components/entities/entities-page-enhanced'
import { AlertCircle } from 'lucide-react'
import { checkStaffAccess } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * Entities Page for Unified Portal (versotech_main)
 *
 * Persona-aware entity management:
 * - Staff/CEO personas: Full access to all entities (vehicles)
 * - Other personas: Access denied
 */
export default async function EntitiesPage() {
  const clientSupabase = await createClient()
  const { data: { user }, error: userError } = await clientSupabase.auth.getUser()

  if (!user || userError) {
    return (
      <div>
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Authentication Required
          </h3>
          <p className="text-muted-foreground">
            Please log in to view entities.
          </p>
        </div>
      </div>
    )
  }

  // Check if user has staff/CEO persona for full access
  const hasStaffAccess = await checkStaffAccess(user.id)
  const serviceSupabase = createServiceClient()

  if (!hasStaffAccess) {
    return (
      <div>
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Access Restricted
          </h3>
          <p className="text-muted-foreground">
            Entity management is only available to staff members.
          </p>
        </div>
      </div>
    )
  }

  // Load entities (vehicles)
  const { data: entities, error } = await serviceSupabase
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
        serviceSupabase
          .from('entity_investors')
          .select('vehicle_id, investor_id')
          .in('vehicle_id', vehicleIds),
        serviceSupabase
          .from('subscriptions')
          .select('vehicle_id, investor_id')
          .in('vehicle_id', vehicleIds),
        serviceSupabase
          .from('entity_flags')
          .select('vehicle_id')
          .eq('status', 'open')
          .in('vehicle_id', vehicleIds),
        serviceSupabase
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

  return <EntitiesPageEnhanced entities={enrichedEntities} />
}
