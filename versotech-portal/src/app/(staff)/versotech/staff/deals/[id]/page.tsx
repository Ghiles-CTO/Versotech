import { AppLayout } from '@/components/layout/app-layout'
import { createServiceClient, createClient } from '@/lib/supabase/server'
import { requireStaffAuth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DealDetailClient } from '@/components/deals/deal-detail-client'

export const dynamic = 'force-dynamic'

export default async function DealDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id: dealId } = await params
  
  // Verify staff authentication and get user
  const authSupabase = await createClient()
  const { data: { user } } = await authSupabase.auth.getUser()
  
  if (!user) {
    redirect('/versotech/login')
  }
  
  // Get user profile for role
  const { data: userProfile } = await authSupabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (!userProfile || !['staff_admin', 'staff_ops', 'staff_rm'].includes(userProfile.role)) {
    redirect('/versotech/staff')
  }
  
  const userRole = userProfile.role
  
  // Use service client to bypass RLS for staff users
  const supabase = createServiceClient()

  // Fetch deal with all related data
  const { data: deal, error } = await supabase
    .from('deals')
    .select(`
      *,
      vehicles (
        id,
        name,
        type,
        currency
      ),
      deal_memberships (
        user_id,
        investor_id,
        role,
        invited_at,
        accepted_at,
        profiles:user_id (
          id,
          display_name,
          email
        ),
        investors:investor_id (
          id,
          legal_name,
          type
        ),
        invited_by_profile:invited_by (
          display_name,
          email
        )
      ),
      fee_plans (
        id,
        name,
        description,
        is_default,
        fee_components (
          id,
          kind,
          calc_method,
          rate_bps,
          flat_amount,
          frequency,
          hurdle_rate_bps,
          has_high_water_mark,
          notes
        )
      ),
      share_lots (
        id,
        source_id,
        units_total,
        unit_cost,
        units_remaining,
        currency,
        acquired_at,
        lockup_until,
        status,
        share_sources:source_id (
          id,
          kind,
          counterparty_name,
          notes
        )
      )
    `)
    .eq('id', dealId)
    .single()

  if (error) {
    console.error('[Deal Detail] Error fetching deal:', error)
    redirect('/versotech/staff/deals')
  }

  if (!deal) {
    console.error('[Deal Detail] Deal not found with ID:', dealId)
    redirect('/versotech/staff/deals')
  }

  console.log('[Deal Detail] Deal loaded successfully:', deal.name)

  // Fetch inventory summary
  const { data: inventorySummary } = await supabase
    .rpc('fn_deal_inventory_summary', { p_deal_id: dealId })

  // Fetch deal-scoped documents
  const { data: documents } = await supabase
    .from('documents')
    .select(`
      id,
      type,
      file_key,
      created_at,
      created_by,
      created_by_profile:created_by (
        display_name
      )
    `)
    .eq('deal_id', dealId)
    .order('created_at', { ascending: false })

  // Fetch term sheet versions
  const { data: termSheets } = await supabase
    .from('deal_fee_structures')
    .select('*')
    .eq('deal_id', dealId)
    .order('created_at', { ascending: false })

  // Fetch investor interest submissions
  const { data: interests } = await supabase
    .from('investor_deal_interest')
    .select(`
      *,
      investors (
        id,
        legal_name
      )
    `)
    .eq('deal_id', dealId)
    .order('submitted_at', { ascending: false })

  // Fetch data room access records
  const { data: dataRoomAccess } = await supabase
    .from('deal_data_room_access')
    .select(`
      *,
      investors (
        id,
        legal_name
      )
    `)
    .eq('deal_id', dealId)
    .order('granted_at', { ascending: false })

  // Fetch data room documents
  const { data: dataRoomDocuments } = await supabase
    .from('deal_data_room_documents')
    .select('*')
    .eq('deal_id', dealId)
    .order('folder', { ascending: true })
    .order('created_at', { ascending: true })

  // Fetch subscription submissions
  const { data: subscriptions } = await supabase
    .from('deal_subscription_submissions')
    .select(`
      *,
      investors (
        id,
        legal_name
      )
    `)
    .eq('deal_id', dealId)
    .order('submitted_at', { ascending: false })

  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()

  const { data: activityEvents } = await supabase
    .from('deal_activity_events')
    .select('event_type, occurred_at')
    .eq('deal_id', dealId)
    .gte('occurred_at', ninetyDaysAgo)

  const activitySummary = (activityEvents ?? []).reduce<Record<string, number>>((acc, event) => {
    acc[event.event_type] = (acc[event.event_type] ?? 0) + 1
    return acc
  }, {})

  return (
    <AppLayout brand="versotech">
      <DealDetailClient
        deal={deal}
        inventorySummary={inventorySummary?.[0] || {
          total_units: 0,
          available_units: 0,
          reserved_units: 0,
          allocated_units: 0
        }}
        documents={documents || []}
        termSheets={termSheets || []}
        interests={interests || []}
        dataRoomAccess={dataRoomAccess || []}
        dataRoomDocuments={dataRoomDocuments || []}
        subscriptions={subscriptions || []}
        activitySummary={activitySummary}
        userProfile={{ role: userRole }}
      />
    </AppLayout>
  )
}
