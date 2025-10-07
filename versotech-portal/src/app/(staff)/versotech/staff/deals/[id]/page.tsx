import { AppLayout } from '@/components/layout/app-layout'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { parseDemoSession, DEMO_COOKIE_NAME } from '@/lib/demo-session'
import { redirect } from 'next/navigation'
import { DealDetailClient } from '@/components/deals/deal-detail-client'

export default async function DealDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  // Use service client to bypass RLS for demo sessions
  const supabase = createServiceClient()
  const { id: dealId } = await params

  // Check for demo session
  const cookieStore = await cookies()
  const demoCookie = cookieStore.get(DEMO_COOKIE_NAME)
  
  if (!demoCookie) {
    redirect('/versotech/staff/deals')
  }

  const demoSession = parseDemoSession(demoCookie.value)
  if (!demoSession) {
    redirect('/versotech/staff/deals')
  }

  console.log('[Deal Detail] Fetching data for demo user:', demoSession.email, demoSession.role)

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
          high_watermark,
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

  if (error || !deal) {
    redirect('/versotech/staff/deals')
  }

  // Fetch inventory summary
  const { data: inventorySummary } = await supabase
    .rpc('fn_deal_inventory_summary', { p_deal_id: dealId })

  // Fetch commitments
  const { data: commitments } = await supabase
    .from('deal_commitments')
    .select(`
      *,
      investors (
        id,
        legal_name
      ),
      fee_plans (
        name
      ),
      created_by_profile:created_by (
        display_name,
        email
      )
    `)
    .eq('deal_id', dealId)
    .order('created_at', { ascending: false })

  // Fetch reservations
  const { data: reservations } = await supabase
    .from('reservations')
    .select(`
      *,
      investors (
        id,
        legal_name
      )
    `)
    .eq('deal_id', dealId)
    .order('created_at', { ascending: false })

  // Fetch allocations
  const { data: allocations } = await supabase
    .from('allocations')
    .select(`
      *,
      investors (
        id,
        legal_name
      ),
      approved_by_profile:approved_by (
        display_name
      )
    `)
    .eq('deal_id', dealId)
    .order('created_at', { ascending: false })

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
        commitments={commitments || []}
        reservations={reservations || []}
        allocations={allocations || []}
        documents={documents || []}
        userProfile={{ role: demoSession.role }}
      />
    </AppLayout>
  )
}