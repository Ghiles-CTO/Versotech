import { createClient, createServiceClient } from '@/lib/supabase/server'
import { AlertCircle } from 'lucide-react'
import { UnifiedReconciliationClient } from '@/components/arranger/unified-reconciliation-client'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

/**
 * Unified Arranger Reconciliation Page
 *
 * Provides a tabbed interface for arrangers to view and manage:
 * - Overview (subscriptions, fee events, deal summary)
 * - Introducer Commissions
 * - Partner Commissions
 * - Commercial Partner Commissions
 *
 * Each tab supports CSV export and filtering.
 */
export default async function ArrangerReconciliationPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const params = await searchParams
  const clientSupabase = await createClient()
  const { data: { user }, error: userError } = await clientSupabase.auth.getUser()

  if (!user || userError) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Authentication Required
          </h3>
          <p className="text-muted-foreground">
            Please log in to view reconciliation.
          </p>
        </div>
      </div>
    )
  }

  const serviceSupabase = createServiceClient()

  // Check user personas
  const { data: personas, error: personaError } = await serviceSupabase.rpc('get_user_personas', {
    p_user_id: user.id
  })

  if (personaError) {
    console.error('[arranger-reconciliation] Error fetching personas:', personaError)
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Error Loading Data
          </h3>
          <p className="text-muted-foreground">
            Failed to verify your access. Please try again later.
          </p>
        </div>
      </div>
    )
  }

  const isArranger = personas?.some((p: any) => p.persona_type === 'arranger') || false
  const isLawyer = personas?.some((p: any) => p.persona_type === 'lawyer') || false

  // If user is a lawyer but not an arranger, redirect to lawyer-reconciliation
  if (isLawyer && !isArranger) {
    redirect('/versotech_main/lawyer-reconciliation')
  }

  // Must be an arranger to access this page
  if (!isArranger) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Access Restricted
          </h3>
          <p className="text-muted-foreground">
            This section is available only to arrangers.
          </p>
        </div>
      </div>
    )
  }

  // Get arranger info
  const { data: arrangerUser, error: arrangerUserError } = await serviceSupabase
    .from('arranger_users')
    .select('arranger_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (arrangerUserError || !arrangerUser?.arranger_id) {
    console.error('[arranger-reconciliation] Error fetching arranger:', arrangerUserError)
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Arranger Not Found
          </h3>
          <p className="text-muted-foreground">
            Your arranger profile could not be found. Please contact support.
          </p>
        </div>
      </div>
    )
  }

  const arrangerId = arrangerUser.arranger_id

  // Fetch arranger entity details
  const { data: arranger, error: arrangerError } = await serviceSupabase
    .from('arranger_entities')
    .select('id, legal_name, status')
    .eq('id', arrangerId)
    .maybeSingle()

  if (arrangerError) {
    console.error('[arranger-reconciliation] Error fetching arranger entity:', arrangerError)
  }

  // Fetch all data in parallel for better performance
  const [
    dealsResult,
    introducersResult,
    partnersResult,
    commercialPartnersResult,
    subscriptionsCountResult,
    feeEventsCountResult,
    introducerCommissionsCountResult,
    partnerCommissionsCountResult,
    cpCommissionsCountResult,
  ] = await Promise.all([
    // Deals managed by this arranger
    serviceSupabase
      .from('deals')
      .select('id, name, company_name, target_amount, currency, status')
      .eq('arranger_entity_id', arrangerId)
      .order('created_at', { ascending: false }),

    // Introducers with commissions for this arranger
    serviceSupabase
      .from('introducer_commissions')
      .select('introducer_id')
      .eq('arranger_id', arrangerId)
      .then(async ({ data }) => {
        const introducerIds = [...new Set((data || []).map(c => c.introducer_id).filter(Boolean))]
        if (introducerIds.length === 0) return { data: [], error: null }
        return serviceSupabase
          .from('introducers')
          .select('id, legal_name')
          .in('id', introducerIds)
          .order('legal_name')
      }),

    // Partners with commissions for this arranger
    serviceSupabase
      .from('partner_commissions')
      .select('partner_id')
      .eq('arranger_id', arrangerId)
      .then(async ({ data }) => {
        const partnerIds = [...new Set((data || []).map(c => c.partner_id).filter(Boolean))]
        if (partnerIds.length === 0) return { data: [], error: null }
        return serviceSupabase
          .from('partners')
          .select('id, name, legal_name')
          .in('id', partnerIds)
          .order('name')
      }),

    // Commercial Partners with commissions for this arranger
    serviceSupabase
      .from('commercial_partner_commissions')
      .select('commercial_partner_id')
      .eq('arranger_id', arrangerId)
      .then(async ({ data }) => {
        const cpIds = [...new Set((data || []).map(c => c.commercial_partner_id).filter(Boolean))]
        if (cpIds.length === 0) return { data: [], error: null }
        return serviceSupabase
          .from('commercial_partners')
          .select('id, name, legal_name')
          .in('id', cpIds)
          .order('name')
      }),

    // Count subscriptions
    serviceSupabase
      .from('subscriptions')
      .select('id', { count: 'exact', head: true })
      .in('deal_id', (await serviceSupabase
        .from('deals')
        .select('id')
        .eq('arranger_entity_id', arrangerId)).data?.map((d: any) => d.id) || [])
      .in('status', ['committed', 'partially_funded', 'funded', 'active']),

    // Count fee events
    serviceSupabase
      .from('fee_events')
      .select('id', { count: 'exact', head: true })
      .in('deal_id', (await serviceSupabase
        .from('deals')
        .select('id')
        .eq('arranger_entity_id', arrangerId)).data?.map((d: any) => d.id) || []),

    // Count introducer commissions
    serviceSupabase
      .from('introducer_commissions')
      .select('id', { count: 'exact', head: true })
      .eq('arranger_id', arrangerId),

    // Count partner commissions
    serviceSupabase
      .from('partner_commissions')
      .select('id', { count: 'exact', head: true })
      .eq('arranger_id', arrangerId),

    // Count commercial partner commissions
    serviceSupabase
      .from('commercial_partner_commissions')
      .select('id', { count: 'exact', head: true })
      .eq('arranger_id', arrangerId),
  ])

  const deals = (dealsResult.data || []).map((deal: any) => ({
    id: deal.id,
    name: deal.name,
    company_name: deal.company_name,
    target_amount: deal.target_amount,
    currency: deal.currency || 'USD',
    status: deal.status,
  }))

  const introducers = (introducersResult.data || []).map((i: any) => ({
    id: i.id,
    legal_name: i.legal_name,
  }))

  const partners = (partnersResult.data || []).map((p: any) => ({
    id: p.id,
    name: p.name || p.legal_name,
    legal_name: p.legal_name,
  }))

  const commercialPartners = (commercialPartnersResult.data || []).map((cp: any) => ({
    id: cp.id,
    name: cp.name || cp.legal_name,
    legal_name: cp.legal_name,
  }))

  // Tab counts for badges
  const tabCounts = {
    overview: (subscriptionsCountResult.count || 0) + (feeEventsCountResult.count || 0),
    introducers: introducerCommissionsCountResult.count || 0,
    partners: partnerCommissionsCountResult.count || 0,
    commercialPartners: cpCommissionsCountResult.count || 0,
  }

  const arrangerInfo = arranger ? {
    id: arranger.id,
    name: arranger.legal_name,
    is_active: arranger.status === 'active',
  } : null

  return (
    <UnifiedReconciliationClient
      arrangerInfo={arrangerInfo}
      deals={deals}
      introducers={introducers}
      partners={partners}
      commercialPartners={commercialPartners}
      tabCounts={tabCounts}
      initialTab={params.tab || 'overview'}
    />
  )
}
