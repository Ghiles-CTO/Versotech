import { createClient, createServiceClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { MandateDetailClient } from '@/components/mandates/mandate-detail-client'
import { AlertCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface PageParams {
  params: Promise<{ mandateId: string }>
}

/**
 * Mandate Detail Page for Arrangers
 *
 * Security: Only allows access if the user has arranger persona AND
 * the deal's arranger_entity_id matches one of the user's arranger entities.
 *
 * Shows:
 * - Deal overview with investor pipeline (names visible, amounts hidden)
 * - Term sheets
 * - Data room documents (auto-access for arrangers)
 * - Pending signature tasks
 */
export default async function MandateDetailPage({ params }: PageParams) {
  const { mandateId } = await params
  const clientSupabase = await createClient()
  const { data: { user }, error: userError } = await clientSupabase.auth.getUser()

  if (!user || userError) {
    redirect('/versotech_main/login')
  }

  const serviceSupabase = createServiceClient()

  // Check user personas - arranger OR staff can view mandates
  const { data: personas } = await serviceSupabase.rpc('get_user_personas', {
    p_user_id: user.id
  })

  const isStaff = personas?.some(
    (p: any) => p.persona_type === 'staff'
  ) || false
  const isArranger = personas?.some(
    (p: any) => p.persona_type === 'arranger'
  ) || false

  if (!isStaff && !isArranger) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Access Restricted
          </h3>
          <p className="text-muted-foreground">
            Mandate details are only available to staff and arrangers.
          </p>
        </div>
      </div>
    )
  }

  // Get the user's arranger entity IDs (if arranger)
  let arrangerIds: string[] = []
  if (isArranger) {
    const { data: arrangerLinks } = await serviceSupabase
      .from('arranger_users')
      .select('arranger_id')
      .eq('user_id', user.id)
    arrangerIds = arrangerLinks?.map(link => link.arranger_id) || []
  }

  // Build the select query for deal
  const dealSelect = `
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
      deal_id,
      user_id,
      investor_id,
      role,
      dispatched_at,
      viewed_at,
      interest_confirmed_at,
      nda_signed_at,
      data_room_granted_at,
      investors:investor_id (
        id,
        legal_name,
        type,
        kyc_status
      )
    )
  `

  // Fetch the deal - staff see any, arrangers only their own mandates
  let deal: any = null
  let dealError: any = null

  if (isStaff) {
    // Staff can see any deal
    const result = await serviceSupabase
      .from('deals')
      .select(dealSelect)
      .eq('id', mandateId)
      .single()
    deal = result.data
    dealError = result.error
  } else if (isArranger && arrangerIds.length > 0) {
    // Arranger can only see their mandates
    const result = await serviceSupabase
      .from('deals')
      .select(dealSelect)
      .eq('id', mandateId)
      .in('arranger_entity_id', arrangerIds)
      .single()
    deal = result.data
    dealError = result.error
  } else {
    // No valid access
    notFound()
  }

  if (dealError) {
    console.error('[MandateDetailPage] Deal query error:', dealError)
    notFound()
  }

  if (!deal) {
    notFound()
  }

  // Fetch term sheets
  const { data: termSheets } = await serviceSupabase
    .from('deal_fee_structures')
    .select('*')
    .eq('deal_id', mandateId)
    .order('created_at', { ascending: false })

  // Fetch data room documents (arrangers get auto-access)
  const { data: dataRoomDocuments } = await serviceSupabase
    .from('deal_data_room_documents')
    .select(`
      id,
      file_key,
      folder,
      created_at,
      created_by,
      created_by_profile:created_by (
        display_name
      )
    `)
    .eq('deal_id', mandateId)
    .order('folder', { ascending: true })
    .order('created_at', { ascending: true })

  // Fetch subscriptions for journey tracking (without amounts for privacy)
  const { data: subscriptions } = await serviceSupabase
    .from('subscriptions')
    .select(`
      id,
      investor_id,
      status,
      pack_generated_at,
      pack_sent_at,
      signed_at,
      funded_at,
      investors:investor_id (
        id,
        legal_name,
        type
      )
    `)
    .eq('deal_id', mandateId)

  // Fetch pending signature tasks for this mandate
  const { data: pendingTasks } = await serviceSupabase
    .from('tasks')
    .select('*')
    .eq('related_deal_id', mandateId)
    .in('kind', ['countersignature', 'subscription_pack_signature'])
    .in('status', ['pending', 'in_progress'])
    .order('due_at', { ascending: true, nullsFirst: false })

  // Fetch investor interests
  const { data: interests } = await serviceSupabase
    .from('investor_deal_interest')
    .select(`
      *,
      investors (
        id,
        legal_name
      )
    `)
    .eq('deal_id', mandateId)
    .order('submitted_at', { ascending: false })

  // Fetch ALL signature requests for this deal (pending + completed) - Row 69 user story
  const { data: signatureHistory } = await serviceSupabase
    .from('signature_requests')
    .select(`
      id,
      signer_name,
      signer_email,
      signer_role,
      document_type,
      status,
      signature_timestamp,
      email_sent_at,
      created_at,
      subscription_id,
      investor_id,
      investors:investor_id (
        id,
        legal_name
      )
    `)
    .eq('deal_id', mandateId)
    .order('created_at', { ascending: false })

  return (
    <MandateDetailClient
      deal={deal}
      termSheets={termSheets || []}
      dataRoomDocuments={dataRoomDocuments || []}
      subscriptions={subscriptions || []}
      pendingTasks={pendingTasks || []}
      interests={interests || []}
      signatureHistory={signatureHistory || []}
    />
  )
}
