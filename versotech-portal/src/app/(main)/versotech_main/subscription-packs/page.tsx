import { createClient, createServiceClient } from '@/lib/supabase/server'
import { AlertCircle } from 'lucide-react'
import { SubscriptionPacksClient } from './subscription-packs-client'

export const dynamic = 'force-dynamic'

export default async function SubscriptionPacksPage() {
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
            Please log in to view subscription packs.
          </p>
        </div>
      </div>
    )
  }

  const serviceSupabase = createServiceClient()

  const { data: personas } = await serviceSupabase.rpc('get_user_personas', {
    p_user_id: user.id
  })

  const isLawyer = personas?.some((p: any) => p.persona_type === 'lawyer') || false

  if (!isLawyer) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Lawyer Access Required
          </h3>
          <p className="text-muted-foreground">
            This section is available only to assigned legal counsel.
          </p>
        </div>
      </div>
    )
  }

  const { data: lawyerUser } = await serviceSupabase
    .from('lawyer_users')
    .select('lawyer_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!lawyerUser?.lawyer_id) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No Lawyer Profile Linked
          </h3>
          <p className="text-muted-foreground">
            Please contact the VERSO team to link your lawyer profile.
          </p>
        </div>
      </div>
    )
  }

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

  if (!dealIds.length) {
    return (
      <SubscriptionPacksClient
        lawyerInfo={lawyer ? {
          id: lawyer.id,
          firm_name: lawyer.firm_name,
          display_name: lawyer.display_name,
          specializations: lawyer.specializations ?? null,
          is_active: lawyer.is_active
        } : null}
        subscriptions={[]}
      />
    )
  }

  // Fetch SIGNED subscriptions (committed, partially_funded, active) for assigned deals
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
      committed_at,
      funded_at,
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
    .in('status', ['committed', 'partially_funded', 'active'])
    .order('committed_at', { ascending: false })

  const subscriptionIds = (subscriptionsData || []).map((s: any) => s.id)

  // Fetch signed documents for these subscriptions
  let documentsMap: Record<string, any> = {}
  if (subscriptionIds.length > 0) {
    const { data: documents } = await serviceSupabase
      .from('documents')
      .select('id, subscription_id, file_key, name, created_at, status, type')
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
    const deal = Array.isArray(sub.deals) ? sub.deals[0] : sub.deals
    const investor = Array.isArray(sub.investors) ? sub.investors[0] : sub.investors
    const document = documentsMap[sub.id]

    return {
      id: sub.id,
      deal_id: sub.deal_id,
      investor_id: sub.investor_id,
      status: sub.status,
      commitment: sub.commitment,
      currency: sub.currency || 'USD',
      funded_amount: sub.funded_amount || 0,
      committed_at: sub.committed_at,
      funded_at: sub.funded_at,
      deal_name: deal?.name || 'Unknown deal',
      investor_name: investor?.display_name || investor?.legal_name || 'Unknown investor',
      document_id: document?.id || null,
      document_file_key: document?.file_key || null,
      document_file_name: document?.name || null
    }
  })

  return (
    <SubscriptionPacksClient
      lawyerInfo={lawyer ? {
        id: lawyer.id,
        firm_name: lawyer.firm_name,
        display_name: lawyer.display_name,
        specializations: lawyer.specializations ?? null,
        is_active: lawyer.is_active
      } : null}
      subscriptions={subscriptions}
    />
  )
}
