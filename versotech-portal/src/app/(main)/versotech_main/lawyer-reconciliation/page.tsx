import { createClient, createServiceClient } from '@/lib/supabase/server'
import { AlertCircle } from 'lucide-react'
import { LawyerReconciliationClient } from '@/components/lawyer/lawyer-reconciliation-client'

export const dynamic = 'force-dynamic'

/**
 * Reconciliation Page for Lawyers and Arrangers
 *
 * Supports both lawyer and arranger personas with scoped access to their managed deals.
 */
export default async function LawyerReconciliationPage() {
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
  const { data: personas } = await serviceSupabase.rpc('get_user_personas', {
    p_user_id: user.id
  })

  const isLawyer = personas?.some((p: any) => p.persona_type === 'lawyer') || false
  const isArranger = personas?.some((p: any) => p.persona_type === 'arranger') || false

  // Handle lawyer access
  if (isLawyer) {
    // Get lawyer info
    const { data: lawyerUser } = await serviceSupabase
      .from('lawyer_users')
      .select('lawyer_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (lawyerUser?.lawyer_id) {
      // Get lawyer details
      const { data: lawyer } = await serviceSupabase
        .from('lawyers')
        .select('id, firm_name, display_name, specializations, is_active, assigned_deals')
        .eq('id', lawyerUser.lawyer_id)
        .maybeSingle()

      // Get deals assigned to this lawyer
      const { data: assignments, error: assignmentsError } = await serviceSupabase
        .from('deal_lawyer_assignments')
        .select('deal_id')
        .eq('lawyer_id', lawyerUser.lawyer_id)

      let dealIds = (assignments || []).map((assignment: any) => assignment.deal_id)

      // Fallback to lawyers.assigned_deals array if no assignments found
      if ((!dealIds.length || assignmentsError) && lawyer?.assigned_deals?.length) {
        dealIds = lawyer.assigned_deals
      }

      return await renderReconciliationPage(serviceSupabase, dealIds, lawyer ? {
        id: lawyer.id,
        firm_name: lawyer.firm_name,
        display_name: lawyer.display_name,
        specializations: lawyer.specializations ?? null,
        is_active: lawyer.is_active
      } : null)
    }
  }

  // Handle arranger access
  if (isArranger) {
    // Get arranger info
    const { data: arrangerUser } = await serviceSupabase
      .from('arranger_users')
      .select('arranger_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (arrangerUser?.arranger_id) {
      // Get arranger details
      // Note: arranger_entities uses 'legal_name' (no company_name) and 'status' (no is_active)
      const { data: arranger } = await serviceSupabase
        .from('arranger_entities')
        .select('id, legal_name, status')
        .eq('id', arrangerUser.arranger_id)
        .maybeSingle()

      // Get deals managed by this arranger
      const { data: managedDeals } = await serviceSupabase
        .from('deals')
        .select('id')
        .eq('arranger_entity_id', arrangerUser.arranger_id)

      const dealIds = (managedDeals || []).map((d: any) => d.id)

      // Create a lawyer-compatible info object for the arranger
      // Map arranger_entities fields to lawyer-compatible structure
      const arrangerAsLawyerInfo = arranger ? {
        id: arranger.id,
        firm_name: arranger.legal_name,
        display_name: arranger.legal_name,
        specializations: ['Arranger'] as string[],
        is_active: arranger.status === 'active'
      } : null

      return await renderReconciliationPage(serviceSupabase, dealIds, arrangerAsLawyerInfo)
    }
  }

  // Neither lawyer nor arranger
  return (
    <div className="p-6">
      <div className="text-center py-16">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          Access Restricted
        </h3>
        <p className="text-muted-foreground">
          This section is available only to lawyers and arrangers.
        </p>
      </div>
    </div>
  )
}

async function renderReconciliationPage(
  serviceSupabase: any,
  dealIds: string[],
  entityInfo: { id: string; firm_name: string; display_name: string; specializations: string[] | null; is_active: boolean } | null
) {
  if (!dealIds.length) {
    return (
      <LawyerReconciliationClient
        lawyerInfo={entityInfo}
        deals={[]}
        subscriptions={[]}
        feeEvents={[]}
        introducerCommissions={[]}
      />
    )
  }

  // Fetch deals with their details
  const { data: dealsData } = await serviceSupabase
    .from('deals')
    .select('id, name, company_name, target_amount, currency, status')
    .in('id', dealIds)
    .order('created_at', { ascending: false })

  // Fetch subscriptions for assigned deals (signed/committed/active)
  const { data: subscriptionsData } = await serviceSupabase
    .from('subscriptions')
    .select(`
      id,
      deal_id,
      investor_id,
      status,
      commitment,
      currency,
      funded_amount,
      outstanding_amount,
      committed_at,
      funded_at,
      investors (
        id,
        legal_name,
        display_name
      )
    `)
    .in('deal_id', dealIds)
    .in('status', ['committed', 'partially_funded', 'funded', 'active'])
    .order('committed_at', { ascending: false })

  // Fetch fee events for assigned deals
  const { data: feeEventsData } = await serviceSupabase
    .from('fee_events')
    .select(`
      id,
      deal_id,
      investor_id,
      allocation_id,
      fee_type,
      rate_bps,
      base_amount,
      computed_amount,
      currency,
      status,
      processed_at,
      notes,
      event_date,
      created_at,
      invoice_id,
      investors (
        id,
        legal_name,
        display_name
      ),
      invoices:invoice_id (
        invoice_number,
        status,
        due_date,
        paid_at
      )
    `)
    .in('deal_id', dealIds)
    .order('created_at', { ascending: false })

  // Fetch introducer commissions awaiting payment (status = 'invoiced')
  const { data: introducerCommissionsData } = await serviceSupabase
    .from('introducer_commissions')
    .select(`
      id,
      status,
      accrual_amount,
      currency,
      invoice_id,
      created_at,
      deal_id,
      introducer:introducers(id, legal_name),
      deal:deals(id, name)
    `)
    .in('deal_id', dealIds)
    .eq('status', 'invoiced')
    .order('created_at', { ascending: false })

  // Process deals data
  const deals = (dealsData || []).map((deal: any) => ({
    id: deal.id,
    name: deal.name,
    company_name: deal.company_name,
    target_amount: deal.target_amount,
    currency: deal.currency || 'USD',
    status: deal.status
  }))

  // Process subscriptions data
  const subscriptions = (subscriptionsData || []).map((sub: any) => {
    const investor = Array.isArray(sub.investors) ? sub.investors[0] : sub.investors
    const deal = deals.find((d: any) => d.id === sub.deal_id)

    return {
      id: sub.id,
      deal_id: sub.deal_id,
      deal_name: deal?.name || 'Unknown Deal',
      investor_id: sub.investor_id,
      investor_name: investor?.display_name || investor?.legal_name || 'Unknown Investor',
      status: sub.status,
      commitment: sub.commitment,
      currency: sub.currency || 'USD',
      funded_amount: sub.funded_amount || 0,
      outstanding_amount: sub.outstanding_amount || 0,
      committed_at: sub.committed_at,
      funded_at: sub.funded_at
    }
  })

  // Process fee events data
  const feeEvents = (feeEventsData || []).map((fee: any) => {
    const deal = deals.find((d: any) => d.id === fee.deal_id)
    const investor = Array.isArray(fee.investors) ? fee.investors[0] : fee.investors
    const invoice = Array.isArray(fee.invoices) ? fee.invoices[0] : fee.invoices

    return {
      id: fee.id,
      deal_id: fee.deal_id,
      deal_name: deal?.name || 'Unknown Deal',
      investor_id: fee.investor_id,
      investor_name: investor?.display_name || investor?.legal_name || 'Unknown Investor',
      subscription_id: fee.allocation_id || null,
      fee_type: fee.fee_type,
      rate_bps: fee.rate_bps,
      base_amount: fee.base_amount,
      computed_amount: fee.computed_amount,
      currency: fee.currency || 'USD',
      status: fee.status,
      processed_at: fee.processed_at,
      notes: fee.notes,
      event_date: fee.event_date,
      created_at: fee.created_at,
      invoice_id: fee.invoice_id || null,
      invoice_number: invoice?.invoice_number || null,
      invoice_status: invoice?.status || null,
      invoice_due_date: invoice?.due_date || null,
      invoice_paid_at: invoice?.paid_at || null
    }
  })

  // Process introducer commissions data
  const introducerCommissions = (introducerCommissionsData || []).map((ic: any) => {
    const introducer = Array.isArray(ic.introducer) ? ic.introducer[0] : ic.introducer
    const deal = Array.isArray(ic.deal) ? ic.deal[0] : ic.deal

    return {
      id: ic.id,
      introducer_name: introducer?.legal_name || 'Unknown Introducer',
      deal_id: ic.deal_id,
      deal_name: deal?.name || null,
      accrual_amount: ic.accrual_amount,
      currency: ic.currency || 'USD',
      status: ic.status,
      invoice_id: ic.invoice_id,
      created_at: ic.created_at,
    }
  })

  return (
    <LawyerReconciliationClient
      lawyerInfo={entityInfo}
      deals={deals}
      subscriptions={subscriptions}
      feeEvents={feeEvents}
      introducerCommissions={introducerCommissions}
    />
  )
}
