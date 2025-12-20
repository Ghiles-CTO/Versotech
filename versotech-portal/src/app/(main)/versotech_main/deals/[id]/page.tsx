import { createClient, createServiceClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { DealDetailClient } from './deal-detail-client'

export const dynamic = 'force-dynamic'

interface PageParams {
  params: Promise<{ id: string }>
}

/**
 * Staff Deal Detail Page
 *
 * CEO/Staff view for managing a deal including:
 * - Deal overview and metadata
 * - Member list with 10-stage journey tracking
 * - Dispatch functionality to add new members
 * - Subscription status tracking
 */
export default async function DealDetailPage({ params }: PageParams) {
  const { id: dealId } = await params
  const clientSupabase = await createClient()
  const { data: { user }, error: userError } = await clientSupabase.auth.getUser()

  if (!user || userError) {
    redirect('/versotech_main/login')
  }

  const serviceSupabase = createServiceClient()

  // Check staff access
  const { data: personas } = await serviceSupabase.rpc('get_user_personas', {
    p_user_id: user.id
  })

  const hasStaffAccess = personas?.some(
    (p: any) => p.persona_type === 'staff'
  ) || false

  if (!hasStaffAccess) {
    redirect('/versotech_main/deals')
  }

  // Fetch deal with all related data
  const { data: deal, error: dealError } = await serviceSupabase
    .from('deals')
    .select(`
      *,
      vehicles (
        id,
        name,
        type,
        status
      ),
      arranger_entities (
        id,
        name,
        type
      )
    `)
    .eq('id', dealId)
    .single()

  if (dealError || !deal) {
    notFound()
  }

  // Fetch deal memberships with user/investor details
  const { data: memberships } = await serviceSupabase
    .from('deal_memberships')
    .select(`
      deal_id,
      user_id,
      investor_id,
      role,
      invited_by,
      invited_at,
      accepted_at,
      dispatched_at,
      viewed_at,
      interest_confirmed_at,
      nda_signed_at,
      data_room_granted_at,
      referred_by_entity_id,
      referred_by_entity_type,
      profiles:user_id (
        id,
        display_name,
        email
      ),
      investors:investor_id (
        id,
        name,
        investor_type,
        kyc_status
      )
    `)
    .eq('deal_id', dealId)
    .order('dispatched_at', { ascending: false, nullsFirst: false })

  // Fetch subscriptions for this deal to get pack/signing status
  const { data: subscriptions } = await serviceSupabase
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

  // Create a map of investor_id to subscription for quick lookup
  const subscriptionMap = new Map(
    (subscriptions || []).map(s => [s.investor_id, s])
  )

  // Enhance memberships with subscription data and flatten Supabase array returns
  const enhancedMemberships = (memberships || []).map(m => ({
    ...m,
    // Supabase returns joined relations as arrays - extract first item
    profiles: Array.isArray(m.profiles) ? m.profiles[0] || null : m.profiles,
    investors: Array.isArray(m.investors) ? m.investors[0] || null : m.investors,
    // Map.get returns undefined if not found, convert to null for type compatibility
    subscription: m.investor_id ? (subscriptionMap.get(m.investor_id) ?? null) : null
  }))

  // Fetch available users for dispatch (investors, partners, introducers, etc.)
  const { data: availableUsers } = await serviceSupabase
    .from('profiles')
    .select(`
      id,
      display_name,
      email,
      role
    `)
    .in('role', ['investor', 'partner', 'introducer', 'commercial_partner', 'lawyer'])
    .order('display_name')

  // Filter out users already in the deal
  const existingUserIds = new Set((memberships || []).map(m => m.user_id))
  const dispatchableUsers = (availableUsers || []).filter(u => !existingUserIds.has(u.id))

  return (
    <DealDetailClient
      deal={deal}
      memberships={enhancedMemberships}
      dispatchableUsers={dispatchableUsers}
      currentUserId={user.id}
    />
  )
}
