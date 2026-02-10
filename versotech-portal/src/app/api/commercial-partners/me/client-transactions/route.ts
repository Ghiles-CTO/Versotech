import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

type MembershipProgression = {
  interest_confirmed_at?: string | null
  nda_signed_at?: string | null
  data_room_granted_at?: string | null
}

type ClientTransaction = {
  id: string
  client_name: string
  client_email: string | null
  client_type: string | null
  is_active: boolean
  created_at: string
  deal_id: string | null
  deal_name: string | null
  deal_status: string | null
  investor_id: string | null
  subscription_id: string | null
  subscription_amount: number | null
  currency: string | null
  subscription_status: string | null
  subscription_date: string | null
  journey_stage: 'new_lead' | 'interested' | 'subscribing' | 'funded' | 'passed'
  has_termsheet: boolean
  has_dataroom_access: boolean
  estimated_commission: number | null
  commission_rate_bps: number | null
}

type Summary = {
  totalClients: number
  activeClients: number
  totalTransactions: number
  totalValue: number
  totalValueByCurrency: Record<string, number>
  estimatedCommission: number
  estimatedCommissionByCurrency: Record<string, number>
}

function normalizeCurrencyCode(currency: string | null | undefined): string {
  const code = (currency || '').trim().toUpperCase()
  if (code.length === 3) return code
  return 'USD'
}

function addCurrencyTotal(
  totals: Record<string, number>,
  currency: string | null | undefined,
  amount: number | null | undefined
) {
  const code = normalizeCurrencyCode(currency)
  const value = Number(amount) || 0
  totals[code] = (totals[code] || 0) + value
}

function getJourneyStage(
  subscriptionStatus: string | null,
  hasSubscription: boolean,
  membership?: MembershipProgression
): ClientTransaction['journey_stage'] {
  if (!hasSubscription) {
    if (membership?.data_room_granted_at) return 'interested'
    if (membership?.nda_signed_at) return 'interested'
    if (membership?.interest_confirmed_at) return 'interested'
    return 'new_lead'
  }

  switch (subscriptionStatus) {
    case 'funded':
    case 'active':
      return 'funded'
    case 'signed':
    case 'committed':
    case 'pending':
    case 'approved':
      return 'subscribing'
    case 'cancelled':
    case 'rejected':
    case 'withdrawn':
      return 'passed'
    default:
      return 'interested'
  }
}

function normalizeJoin<T>(value: T | T[] | null): T | null {
  if (!value) return null
  return Array.isArray(value) ? value[0] || null : value
}

export async function GET() {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: cpUser } = await serviceSupabase
      .from('commercial_partner_users')
      .select('commercial_partner_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!cpUser?.commercial_partner_id) {
      // Staff fallback - show limited dataset
      const { data: clientsData } = await serviceSupabase
        .from('commercial_partner_clients')
        .select(`
          id,
          client_name,
          client_email,
          client_type,
          is_active,
          created_at,
          created_for_deal_id,
          client_investor_id,
          deal:created_for_deal_id (
            id,
            name,
            status,
            currency
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100)

      const processed = (clientsData || []).map((client: any) => {
        const deal = normalizeJoin(client.deal as any)
        return {
          id: client.id,
          client_name: client.client_name || 'Unknown Client',
          client_email: client.client_email,
          client_type: client.client_type,
          is_active: client.is_active ?? true,
          created_at: client.created_at,
          deal_id: client.created_for_deal_id,
          deal_name: deal?.name || null,
          deal_status: deal?.status || null,
          investor_id: client.client_investor_id,
          subscription_id: null,
          subscription_amount: null,
          currency: deal?.currency || null,
          subscription_status: null,
          subscription_date: null,
          journey_stage: 'new_lead',
          has_termsheet: !!client.created_for_deal_id,
          has_dataroom_access: false,
          estimated_commission: null,
          commission_rate_bps: 0,
        }
      })

      const summary: Summary = {
        totalClients: processed.length,
        activeClients: processed.filter(c => c.is_active).length,
        totalTransactions: 0,
        totalValue: 0,
        totalValueByCurrency: {},
        estimatedCommission: 0,
        estimatedCommissionByCurrency: {},
      }

      return NextResponse.json({
        staff_view: true,
        partner: null,
        placement_agreement: null,
        clients: processed,
        summary,
      })
    }

    const cpId = cpUser.commercial_partner_id

    const { data: partner } = await serviceSupabase
      .from('commercial_partners')
      .select('id, name, legal_name, type, status, logo_url')
      .eq('id', cpId)
      .single()

    const { data: agreement } = await serviceSupabase
      .from('placement_agreements')
      .select('id, default_commission_bps, status')
      .eq('commercial_partner_id', cpId)
      .eq('status', 'active')
      .maybeSingle()

    const { data: clientsData, error: clientsError } = await serviceSupabase
      .from('commercial_partner_clients')
      .select(`
        id,
        client_name,
        client_email,
        client_type,
        is_active,
        created_at,
        created_for_deal_id,
        client_investor_id,
        deal:created_for_deal_id (
          id,
          name,
          status,
          currency
        )
      `)
      .eq('commercial_partner_id', cpId)
      .order('created_at', { ascending: false })

    if (clientsError) {
      console.error('[cp-client-transactions] Clients fetch error:', clientsError)
      return NextResponse.json({ error: 'Failed to load clients' }, { status: 500 })
    }

    const investorIds = (clientsData || [])
      .filter((client: any) => client.client_investor_id)
      .map((client: any) => client.client_investor_id)

    // Get dealIds from client records (will combine with subscription dealIds after fetch)
    const dealIdsFromClients = (clientsData || [])
      .filter((client: any) => client.created_for_deal_id)
      .map((client: any) => client.created_for_deal_id)

    let subscriptionsMap: Record<string, any[]> = {}
    if (investorIds.length > 0) {
      const { data: subs } = await serviceSupabase
        .from('subscriptions')
        .select(`
          id,
          investor_id,
          deal_id,
          commitment,
          currency,
          status,
          subscription_date,
          deals (
            id,
            name,
            status,
            currency
          )
        `)
        .in('investor_id', investorIds)
        .eq('proxy_commercial_partner_id', cpId)
        .order('created_at', { ascending: false })

      if (subs) {
        subs.forEach((sub: any) => {
          if (!subscriptionsMap[sub.investor_id]) {
            subscriptionsMap[sub.investor_id] = []
          }
          subscriptionsMap[sub.investor_id].push(sub)
        })
      }
    }

    // Combine dealIds from BOTH client links AND subscriptions
    const dealIdsFromSubscriptions = Object.values(subscriptionsMap)
      .flat()
      .map((sub: any) => sub.deal_id)
      .filter(Boolean)

    const allDealIds = [...new Set([...dealIdsFromClients, ...dealIdsFromSubscriptions])]

    let membershipMap: Record<string, MembershipProgression> = {}
    if (investorIds.length > 0 && allDealIds.length > 0) {
      const { data: memberships } = await serviceSupabase
        .from('deal_memberships')
        .select('investor_id, deal_id, interest_confirmed_at, nda_signed_at, data_room_granted_at')
        .in('investor_id', investorIds)
        .in('deal_id', allDealIds)

      if (memberships) {
        memberships.forEach((m: any) => {
          const key = `${m.investor_id}:${m.deal_id}`
          membershipMap[key] = {
            interest_confirmed_at: m.interest_confirmed_at,
            nda_signed_at: m.nda_signed_at,
            data_room_granted_at: m.data_room_granted_at,
          }
        })
      }
    }

    let dataroomAccessMap: Record<string, boolean> = {}
    if (allDealIds.length > 0 && investorIds.length > 0) {
      const { data: accessRecords } = await serviceSupabase
        .from('deal_data_room_access')
        .select('deal_id, investor_id')
        .in('deal_id', allDealIds)
        .in('investor_id', investorIds)
        .is('revoked_at', null)
        .or(`expires_at.is.null,expires_at.gte.${new Date().toISOString()}`)

      if (accessRecords) {
        accessRecords.forEach((record: any) => {
          const key = `${record.deal_id}:${record.investor_id}`
          dataroomAccessMap[key] = true
        })
      }
    }

    const commissionBps = agreement?.default_commission_bps || 0
    const processed: ClientTransaction[] = []

    ;(clientsData || []).forEach((client: any) => {
      const subscriptions = client.client_investor_id
        ? subscriptionsMap[client.client_investor_id] || []
        : []

      if (subscriptions.length === 0) {
        // Try to find membership from explicit deal link first
        let membership: MembershipProgression | undefined = undefined

        if (client.client_investor_id && client.created_for_deal_id) {
          const explicitKey = `${client.client_investor_id}:${client.created_for_deal_id}`
          membership = membershipMap[explicitKey]
        }

        // If no explicit link membership, check if there are any memberships for this investor
        // (This handles cases where the client is associated via other paths)
        if (!membership && client.client_investor_id) {
          // Find any membership for this investor in our membershipMap
          const investorPrefix = `${client.client_investor_id}:`
          const matchingKey = Object.keys(membershipMap).find(key => key.startsWith(investorPrefix))
          if (matchingKey) {
            membership = membershipMap[matchingKey]
          }
        }

        const deal = normalizeJoin(client.deal as any)

        processed.push({
          id: client.id,
          client_name: client.client_name || 'Unknown Client',
          client_email: client.client_email,
          client_type: client.client_type,
          is_active: client.is_active ?? true,
          created_at: client.created_at,
          deal_id: client.created_for_deal_id,
          deal_name: deal?.name || null,
          deal_status: deal?.status || null,
          investor_id: client.client_investor_id,
          subscription_id: null,
          subscription_amount: null,
          currency: deal?.currency || null,
          subscription_status: null,
          subscription_date: null,
          journey_stage: getJourneyStage(null, false, membership),
          has_termsheet: !!client.created_for_deal_id,
          has_dataroom_access: !!(
            client.created_for_deal_id &&
            client.client_investor_id &&
            dataroomAccessMap[`${client.created_for_deal_id}:${client.client_investor_id}`]
          ),
          estimated_commission: null,
          commission_rate_bps: commissionBps,
        })
      } else {
        subscriptions.forEach((sub: any) => {
          const commitment = sub.commitment || 0
          const estimatedComm = commissionBps > 0 ? (commitment * commissionBps) / 10000 : null
          const membershipKey = client.client_investor_id && sub.deal_id
            ? `${client.client_investor_id}:${sub.deal_id}`
            : ''
          const membership = membershipKey ? membershipMap[membershipKey] : undefined

          const deal = normalizeJoin(sub.deals as any) || normalizeJoin(client.deal as any)

          processed.push({
            id: `${client.id}-${sub.id}`,
            client_name: client.client_name || 'Unknown Client',
            client_email: client.client_email,
            client_type: client.client_type,
            is_active: client.is_active ?? true,
            created_at: sub.subscription_date || client.created_at,
            deal_id: sub.deal_id,
            deal_name: deal?.name || null,
            deal_status: deal?.status || null,
            investor_id: client.client_investor_id,
            subscription_id: sub.id,
            subscription_amount: commitment,
            currency: sub.currency || deal?.currency || null,
            subscription_status: sub.status,
            subscription_date: sub.subscription_date,
            journey_stage: getJourneyStage(sub.status, true, membership),
            has_termsheet: true,
            has_dataroom_access: !!(
              sub.deal_id &&
              client.client_investor_id &&
              dataroomAccessMap[`${sub.deal_id}:${client.client_investor_id}`]
            ),
            estimated_commission: estimatedComm,
            commission_rate_bps: commissionBps,
          })
        })
      }
    })

    const uniqueClients = new Set((clientsData || []).map((client: any) => client.id))
    const activeClients = (clientsData || []).filter((client: any) => client.is_active).length
    const withSubscription = processed.filter(client => client.subscription_amount)
    const totalValue = withSubscription.reduce((sum, client) => sum + (client.subscription_amount || 0), 0)
    const estimatedCommission = withSubscription.reduce((sum, client) => sum + (client.estimated_commission || 0), 0)
    const totalValueByCurrency: Record<string, number> = {}
    const estimatedCommissionByCurrency: Record<string, number> = {}
    withSubscription.forEach((client) => {
      addCurrencyTotal(totalValueByCurrency, client.currency, client.subscription_amount)
      addCurrencyTotal(estimatedCommissionByCurrency, client.currency, client.estimated_commission)
    })

    const summary: Summary = {
      totalClients: uniqueClients.size,
      activeClients,
      totalTransactions: withSubscription.length,
      totalValue,
      totalValueByCurrency,
      estimatedCommission,
      estimatedCommissionByCurrency,
    }

    return NextResponse.json({
      staff_view: false,
      partner,
      placement_agreement: agreement,
      clients: processed,
      summary,
    })
  } catch (error) {
    console.error('[cp-client-transactions] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
