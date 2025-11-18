import { createSmartClient } from '@/lib/supabase/smart-client'
import { redirect } from 'next/navigation'
import { EntityDetailEnhanced } from '@/components/entities/entity-detail-enhanced'
import { getCurrentUser } from '@/lib/auth'
import { mergeEntityInvestorData } from '@/lib/entities/entity-investor-utils'

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
    { data: events },
    { data: entityInvestors },
    { data: vehicleSubscriptions },
    { data: valuations }
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
      .from('document_folders')
      .select('id, parent_folder_id, name, path, folder_type, vehicle_id, created_at, updated_at')
      .eq('vehicle_id', id)
      .order('path', { ascending: true }),
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
      .limit(50),
    supabase
      .from('entity_investors')
      .select(`
        id,
        subscription_id,
        relationship_role,
        allocation_status,
        invite_sent_at,
        created_at,
        updated_at,
        notes,
        investor:investors (
          id,
          legal_name,
          display_name,
          type,
          email,
          country,
          status,
          onboarding_status,
          aml_risk_rating
        ),
        subscription:subscriptions (
          *
        )
      `)
      .eq('vehicle_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('subscriptions')
      .select(`
        *,
        investor:investors (
          id,
          legal_name,
          display_name,
          type,
          email,
          country,
          status,
          onboarding_status,
          aml_risk_rating
        )
      `)
      .eq('vehicle_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('valuations')
      .select('*')
      .eq('vehicle_id', id)
      .order('as_of_date', { ascending: false })
  ])

  let holdings: any[] = []
  if (deals && deals.length > 0) {
    const dealIds = deals.map((deal) => deal.id).filter(Boolean)
    if (dealIds.length > 0) {
      const { data: holdingRows, error: holdingsError } = await supabase
        .from('investor_deal_holdings')
        .select(`
          id,
          investor_id,
          deal_id,
          subscription_submission_id,
          status,
          subscribed_amount,
          currency,
          effective_date,
          funding_due_at,
          funded_at,
          created_at,
          updated_at,
          investor:investors (
            id,
            legal_name,
            display_name,
            type,
            email,
            country,
            status,
            onboarding_status,
            aml_risk_rating
          )
        `)
        .in('deal_id', dealIds)

      if (holdingsError) {
        console.error('[EntityDetailPage] Failed to load holdings:', holdingsError)
      } else {
        holdings = holdingRows ?? []
      }
    }
  }

  const mergedInvestors = mergeEntityInvestorData({
    entityInvestors: entityInvestors ?? [] as any,
    subscriptions: vehicleSubscriptions ?? [] as any,
    holdings,
    deals: deals ?? [] as any
  })

  return (
    <EntityDetailEnhanced
        entity={{ ...entity, updated_at: null }}
        directors={directors || []}
        stakeholders={stakeholders || []}
        folders={folders || []}
        flags={flags || []}
        deals={deals || []}
        events={(events as any) || []}
        investors={mergedInvestors}
        valuations={valuations || []}
      />
    )
}


