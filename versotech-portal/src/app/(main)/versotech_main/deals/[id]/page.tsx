import { createClient, createServiceClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { DealDetailClient } from '@/components/deals/deal-detail-client'
import { checkStaffAccess } from '@/lib/auth'

export const dynamic = 'force-dynamic'

interface PageParams {
  params: Promise<{ id: string }>
}

/**
 * Staff Deal Detail Page
 *
 * CEO/Staff view for managing a deal including:
 * - Deal overview and metadata
 * - 11 tabs: Overview, Term Sheet, Interests, Data Room, Inventory, Members, Fees, Subscriptions, Documents, FAQ, Activity
 * - Full investor journey tracking
 */
export default async function DealDetailPage({ params }: PageParams) {
  const { id: dealId } = await params
  const clientSupabase = await createClient()
  const { data: { user }, error: userError } = await clientSupabase.auth.getUser()

  if (!user || userError) {
    redirect('/versotech_main/login')
  }

  // Check staff access via personas
  const hasStaffAccess = await checkStaffAccess(user.id)
  const serviceSupabase = createServiceClient()

  if (!hasStaffAccess) {
    redirect('/versotech_main/deals')
  }

  // Get user profile for role
  const { data: userProfile } = await clientSupabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const userRole = userProfile?.role || 'staff_ops'

  // Fetch arranger entities for edit dropdown
  // Note: arranger_entities has no 'company_name' - use legal_name only
  const { data: arrangerEntities } = await serviceSupabase
    .from('arranger_entities')
    .select('id, legal_name')
    .eq('status', 'active')
    .order('legal_name')

  // Fetch deal with all related data
  const { data: deal, error: dealError } = await serviceSupabase
    .from('deals')
    .select(`
      *,
      vehicles (
        id,
        name,
        type,
        currency
      ),
      arranger_entities:arranger_entity_id (
        id,
        legal_name
      ),
      deal_memberships (
        user_id,
        investor_id,
        role,
        invited_at,
        accepted_at,
        dispatched_at,
        viewed_at,
        interest_confirmed_at,
        nda_signed_at,
        data_room_granted_at,
        profiles:user_id (
          id,
          display_name,
          email
        ),
        investors:investor_id (
          id,
          legal_name,
          type,
          kyc_status
        ),
        invited_by_profile:invited_by (
          display_name,
          email
        )
      ),
      fee_plans (
        id,
        deal_id,
        name,
        description,
        is_default,
        is_active,
        term_sheet_id,
        introducer_id,
        partner_id,
        commercial_partner_id,
        status,
        accepted_at,
        generated_agreement_id,
        generated_placement_agreement_id,
        agreement_duration_months,
        non_circumvention_months,
        governing_law,
        vat_registration_number,
        fee_components (
          id,
          kind,
          calc_method,
          rate_bps,
          flat_amount,
          frequency,
          payment_schedule,
          duration_periods,
          duration_unit,
          hurdle_rate_bps,
          has_catchup,
          catchup_rate_bps,
          has_high_water_mark,
          has_no_cap,
          performance_cap_percent,
          payment_days_after_event,
          tier_threshold_multiplier,
          base_calculation,
          notes
        ),
        term_sheet:term_sheet_id (
          id,
          version,
          status,
          term_sheet_date,
          subscription_fee_percent,
          management_fee_percent,
          carried_interest_percent
        ),
        introducer:introducer_id (
          id,
          legal_name,
          contact_name,
          email
        ),
        partner:partner_id (
          id,
          name,
          legal_name,
          contact_name,
          contact_email
        ),
        commercial_partner:commercial_partner_id (
          id,
          name,
          legal_name,
          contact_name,
          contact_email
        ),
        introducer_agreement:generated_agreement_id (
          id,
          reference_number,
          status,
          pdf_url
        ),
        placement_agreement:generated_placement_agreement_id (
          id,
          reference_number,
          status,
          pdf_url
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

  if (dealError || !deal) {
    notFound()
  }

  // Fetch inventory summary
  const { data: inventorySummary } = await serviceSupabase
    .rpc('fn_deal_inventory_summary', { p_deal_id: dealId })

  // Fetch deal-scoped documents
  const { data: documents } = await serviceSupabase
    .from('deal_data_room_documents')
    .select(`
      id,
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
  const { data: termSheets } = await serviceSupabase
    .from('deal_fee_structures')
    .select('*')
    .eq('deal_id', dealId)
    .order('created_at', { ascending: false })

  // Fetch investor interest submissions
  const { data: interests } = await serviceSupabase
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
  const { data: dataRoomAccess } = await serviceSupabase
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
  const { data: dataRoomDocuments } = await serviceSupabase
    .from('deal_data_room_documents')
    .select('*')
    .eq('deal_id', dealId)
    .order('folder', { ascending: true })
    .order('created_at', { ascending: true })

  // Fetch subscription submissions (for Subscriptions tab)
  const { data: subscriptionSubmissions } = await serviceSupabase
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

  // Fetch subscriptions with journey tracking fields (for Members tab journey)
  const { data: subscriptionsForJourney } = await serviceSupabase
    .from('subscriptions')
    .select(`
      id,
      investor_id,
      commitment,
      funded_amount,
      status,
      pack_generated_at,
      pack_sent_at,
      signed_at,
      funded_at
    `)
    .eq('deal_id', dealId)

  // Fetch activity events for summary (last 90 days)
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()

  const { data: activityEvents } = await serviceSupabase
    .from('deal_activity_events')
    .select('event_type, occurred_at')
    .eq('deal_id', dealId)
    .gte('occurred_at', ninetyDaysAgo)

  const activitySummary = (activityEvents ?? []).reduce<Record<string, number>>((acc, event) => {
    acc[event.event_type] = (acc[event.event_type] ?? 0) + 1
    return acc
  }, {})

  // Filter only active fee plans
  const dealWithActiveFeePlans = {
    ...deal,
    fee_plans: (deal.fee_plans || []).filter((plan: any) => plan.is_active !== false)
  }

  return (
    <DealDetailClient
      deal={dealWithActiveFeePlans}
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
      subscriptions={subscriptionSubmissions || []}
      subscriptionsForJourney={subscriptionsForJourney || []}
      activitySummary={activitySummary}
      userProfile={{ role: userRole }}
      arrangerEntities={arrangerEntities || []}
    />
  )
}
