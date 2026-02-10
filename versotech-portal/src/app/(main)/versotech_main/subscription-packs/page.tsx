import { createClient, createServiceClient } from '@/lib/supabase/server'
import { AlertCircle } from 'lucide-react'
import { SubscriptionPacksClient } from './subscription-packs-client'

export const dynamic = 'force-dynamic'

export default async function SubscriptionPacksPage() {
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
            Please log in to view subscription packs.
          </p>
        </div>
      </div>
    )
  }

  const serviceSupabase = createServiceClient()

  // Check user personas for access level
  const { data: personas, error: personasError } = await serviceSupabase.rpc('get_user_personas', {
    p_user_id: user.id
  })

  // Handle RPC errors gracefully
  if (personasError) {
    console.error('Failed to fetch user personas:', personasError)
    return (
      <div>
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Service Temporarily Unavailable
          </h3>
          <p className="text-muted-foreground">
            Failed to load your profile. Please refresh the page or try again later.
          </p>
        </div>
      </div>
    )
  }

  const isLawyer = personas?.some((p: any) => p.persona_type === 'lawyer') || false
  const isArranger = personas?.some((p: any) => p.persona_type === 'arranger') || false

  // Allow access for both lawyers and arrangers
  if (!isLawyer && !isArranger) {
    return (
      <div>
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Access Restricted
          </h3>
          <p className="text-muted-foreground">
            This section is available to arrangers and assigned legal counsel.
          </p>
        </div>
      </div>
    )
  }

  // ===== LAWYER DATA FETCHING =====
  let lawyerUser: { lawyer_id: string } | null = null
  let lawyer: {
    id: string
    firm_name: string | null
    display_name: string | null
    specializations: string[] | null
    is_active: boolean
    assigned_deals: string[] | null
  } | null = null

  if (isLawyer) {
    const { data: lu } = await serviceSupabase
      .from('lawyer_users')
      .select('lawyer_id')
      .eq('user_id', user.id)
      .maybeSingle()

    lawyerUser = lu

    if (lawyerUser?.lawyer_id) {
      const { data: l } = await serviceSupabase
        .from('lawyers')
        .select('id, firm_name, display_name, specializations, is_active, assigned_deals')
        .eq('id', lawyerUser.lawyer_id)
        .maybeSingle()

      lawyer = l
    }
  }

  // ===== ARRANGER DATA FETCHING =====
  let arrangerUser: { arranger_id: string } | null = null
  let arrangerEntity: {
    id: string
    legal_name: string
    status: string
  } | null = null

  if (isArranger) {
    const { data: au } = await serviceSupabase
      .from('arranger_users')
      .select('arranger_id')
      .eq('user_id', user.id)
      .maybeSingle()

    arrangerUser = au

    if (arrangerUser?.arranger_id) {
      const { data: ae } = await serviceSupabase
        .from('arranger_entities')
        .select('id, legal_name, status')
        .eq('id', arrangerUser.arranger_id)
        .maybeSingle()

      arrangerEntity = ae
    }
  }

  // Check if user has valid entity link
  const hasLawyerAccess = isLawyer && lawyerUser?.lawyer_id
  const hasArrangerAccess = isArranger && arrangerUser?.arranger_id

  if (!hasLawyerAccess && !hasArrangerAccess) {
    return (
      <div>
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No Profile Linked
          </h3>
          <p className="text-muted-foreground">
            Please contact the VERSO team to link your profile.
          </p>
        </div>
      </div>
    )
  }

  // ===== GET DEAL IDs BASED ON PERSONA =====
  let dealIds: string[] = []

  if (hasLawyerAccess && lawyerUser?.lawyer_id) {
    // Lawyer: Get deals from assignments table
    const { data: assignments, error: assignmentsError } = await serviceSupabase
      .from('deal_lawyer_assignments')
      .select('deal_id')
      .eq('lawyer_id', lawyerUser.lawyer_id)

    dealIds = (assignments || []).map((assignment: any) => assignment.deal_id)

    // Fallback to lawyers.assigned_deals array if no assignments found
    if ((!dealIds.length || assignmentsError) && lawyer?.assigned_deals?.length) {
      dealIds = lawyer.assigned_deals
    }
  } else if (hasArrangerAccess && arrangerUser?.arranger_id) {
    // Arranger: Get deals where arranger_entity_id matches
    const { data: arrangerDeals } = await serviceSupabase
      .from('deals')
      .select('id')
      .eq('arranger_entity_id', arrangerUser.arranger_id)

    dealIds = (arrangerDeals || []).map((d: any) => d.id)
  }

  // ===== CREATE ENTITY INFO OBJECT =====
  const entityInfo = hasLawyerAccess && lawyer
    ? {
        id: lawyer.id,
        firm_name: lawyer.firm_name,
        display_name: lawyer.display_name,
        specializations: lawyer.specializations ?? null,
        is_active: lawyer.is_active,
        entity_type: 'lawyer' as const
      }
    : hasArrangerAccess && arrangerEntity
    ? {
        id: arrangerEntity.id,
        firm_name: arrangerEntity.legal_name,
        display_name: arrangerEntity.legal_name,
        specializations: null,
        is_active: arrangerEntity.status === 'active',
        entity_type: 'arranger' as const
      }
    : null

  // If no deals found, show empty state
  if (!dealIds.length) {
    return (
      <SubscriptionPacksClient
        entityInfo={entityInfo}
        subscriptions={[]}
      />
    )
  }

  // Fetch SIGNED subscriptions (committed, partially_funded, funded, active) for relevant deals
  // Note: signed_at is the actual signature date, committed_at may be null
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
      signed_at,
      committed_at,
      funded_at,
      subscription_number,
      subscription_date,
      effective_date,
      funding_due_at,
      num_shares,
      price_per_share,
      pack_sent_at,
      deals (
        id,
        name
      ),
      investors (
        id,
        legal_name,
        display_name
      )
    `)
    .in('deal_id', dealIds)
    .in('status', ['committed', 'partially_funded', 'funded', 'active'])
    .order('signed_at', { ascending: false, nullsFirst: false })

  const subscriptionIds = (subscriptionsData || []).map((s: any) => s.id)

  // Fetch signed documents for these subscriptions
  let documentsMap: Record<string, any> = {}
  if (subscriptionIds.length > 0) {
    const { data: documents } = await serviceSupabase
      .from('documents')
      .select('id, subscription_id, file_key, name, created_at, status, type, mime_type, file_size_bytes')
      .in('subscription_id', subscriptionIds)
      .eq('status', 'published')
      .or('type.eq.subscription,type.eq.subscription_pack,type.is.null')
      .order('created_at', { ascending: false })

    // Group documents by subscription_id (take first/latest for each)
    if (documents) {
      for (const doc of documents) {
        if (doc.subscription_id && !documentsMap[doc.subscription_id]) {
          documentsMap[doc.subscription_id] = doc
        }
      }
    }
  }

  const subscriptions = (subscriptionsData || []).map((sub: any) => {
    // PostgREST returns single object for many-to-one relationships (not arrays)
    const deal = Array.isArray(sub.deals) ? sub.deals[0] : sub.deals
    const investor = Array.isArray(sub.investors) ? sub.investors[0] : sub.investors
    const document = documentsMap[sub.id]

    // Log missing data for debugging (helps identify data integrity issues)
    if (!deal) {
      console.warn(`Subscription ${sub.id} missing deal data (deal_id: ${sub.deal_id})`)
    }
    if (!investor) {
      console.warn(`Subscription ${sub.id} missing investor data (investor_id: ${sub.investor_id})`)
    }

    return {
      id: sub.id,
      deal_id: sub.deal_id,
      investor_id: sub.investor_id,
      status: sub.status,
      commitment: sub.commitment,
      currency: sub.currency || 'USD',
      funded_amount: sub.funded_amount || 0,
      // Use signed_at as primary (actual signature date), fallback to committed_at
      signed_at: sub.signed_at || sub.committed_at,
      committed_at: sub.committed_at,
      funded_at: sub.funded_at,
      subscription_number: sub.subscription_number,
      subscription_date: sub.subscription_date,
      // Additional useful fields
      effective_date: sub.effective_date,
      funding_due_at: sub.funding_due_at,
      num_shares: sub.num_shares,
      price_per_share: sub.price_per_share,
      pack_sent_at: sub.pack_sent_at,
      // Improved null safety: Show ID as fallback to help staff lookup missing records
      deal_name: deal?.name || `Unknown (ID: ${sub.deal_id?.slice(0, 8) || 'N/A'})`,
      investor_name: investor?.display_name || investor?.legal_name || `Unknown (ID: ${sub.investor_id?.slice(0, 8) || 'N/A'})`,
      document_id: document?.id || null,
      document_file_key: document?.file_key || null,
      document_file_name: document?.name || null,
      document_mime_type: document?.mime_type || null,
      document_file_size: document?.file_size_bytes || null,
      document_type: document?.type || null
    }
  })

  return (
    <SubscriptionPacksClient
      entityInfo={entityInfo}
      subscriptions={subscriptions}
    />
  )
}
