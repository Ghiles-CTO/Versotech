import { randomUUID } from 'crypto'

import {
  EntityInvestorHoldingSummary,
  EntityInvestorSubscriptionSummary,
  EntityInvestorSummary
} from '@/components/entities/types'

type EntityInvestorLinkRow = {
  id: string
  relationship_role: string | null
  allocation_status: string | null
  invite_sent_at: string | null
  created_at: string
  updated_at: string | null
  notes: string | null
  investor?: EntityInvestorSummary['investor']
  subscription?: {
    id: string
    commitment: number | null
    currency: string | null
    status: string | null
    effective_date: string | null
    funding_due_at: string | null
    units: number | null
    acknowledgement_notes: string | null
    created_at: string | null
  } | null
}

type SubscriptionRow = {
  id: string
  investor_id: string | null
  vehicle_id?: string | null
  commitment: number | null
  currency: string | null
  status: string | null
  effective_date: string | null
  funding_due_at: string | null
  units: number | null
  acknowledgement_notes: string | null
  created_at: string | null
  investor?: EntityInvestorSummary['investor']
}

type HoldingRow = {
  id: string
  investor_id: string | null
  deal_id: string | null
  subscription_submission_id?: string | null
  status: string | null
  subscribed_amount: number | null
  currency: string | null
  effective_date: string | null
  funding_due_at: string | null
  funded_at: string | null
  created_at: string | null
  updated_at: string | null
  investor?: EntityInvestorSummary['investor']
}

type DealRow = {
  id: string
  name?: string | null
}

export interface MergeEntityInvestorParams {
  entityInvestors?: EntityInvestorLinkRow[] | null
  subscriptions?: SubscriptionRow[] | null
  holdings?: HoldingRow[] | null
  deals?: DealRow[] | null
}

const ALLOCATION_PRIORITY: Record<string, number> = {
  active: 0,
  committed: 1,
  pending: 2,
  closed: 3,
  cancelled: 4,
  archived: 5
}

const HOLDING_STATUS_TO_ALLOCATION: Record<string, string> = {
  funded: 'active',
  active: 'active',
  pending: 'pending',
  pending_funding: 'pending',
  committed: 'committed',
  closed: 'closed',
  cancelled: 'cancelled'
}

function normalizeSubscription(
  source: 'linked' | 'auto_discovered' | 'holding_projection',
  row: {
    id?: string | null
    commitment: number | null
    currency: string | null
    status: string | null
    effective_date: string | null
    funding_due_at: string | null
    units: number | null
    acknowledgement_notes: string | null
    created_at: string | null
  }
): EntityInvestorSubscriptionSummary {
  return {
    id: row.id ?? randomUUID(),
    commitment: row.commitment ?? null,
    currency: row.currency ?? null,
    status: row.status ?? null,
    effective_date: row.effective_date ?? null,
    funding_due_at: row.funding_due_at ?? null,
    units: row.units ?? null,
    acknowledgement_notes: row.acknowledgement_notes ?? null,
    created_at: row.created_at ?? null,
    origin: source
  }
}

function normalizeHolding(
  holding: HoldingRow,
  dealNames: Map<string, string | null>
): EntityInvestorHoldingSummary {
  const dealId = holding.deal_id ?? 'unknown'
  return {
    id: holding.id,
    deal_id: dealId,
    deal_name: dealNames.get(dealId) ?? null,
    status: holding.status ?? null,
    subscribed_amount: holding.subscribed_amount ?? null,
    currency: holding.currency ?? null,
    effective_date: holding.effective_date ?? null,
    funding_due_at: holding.funding_due_at ?? null,
    funded_at: holding.funded_at ?? null,
    created_at: holding.created_at ?? null,
    updated_at: holding.updated_at ?? null
  }
}

function subscriptionFromHolding(holding: HoldingRow): EntityInvestorSubscriptionSummary {
  return normalizeSubscription('holding_projection', {
    id: holding.subscription_submission_id ?? `holding-${holding.id}`,
    commitment: holding.subscribed_amount ?? null,
    currency: holding.currency ?? null,
    status: HOLDING_STATUS_TO_ALLOCATION[holding.status ?? 'pending'] ?? 'pending',
    effective_date: holding.effective_date ?? null,
    funding_due_at: holding.funding_due_at ?? null,
    units: null,
    acknowledgement_notes: null,
    created_at: holding.created_at ?? null
  })
}

function deriveStatusFromSubscriptions(subscriptions: EntityInvestorSubscriptionSummary[]): string | null {
  if (subscriptions.length === 0) return null
  const statuses = subscriptions
    .map((sub) => sub.status ?? 'pending')
    .sort((a, b) => (ALLOCATION_PRIORITY[a] ?? 99) - (ALLOCATION_PRIORITY[b] ?? 99))
  return statuses[0] ?? null
}

function deriveStatusFromHoldings(holdings: EntityInvestorHoldingSummary[]): string | null {
  if (holdings.length === 0) return null
  const statuses = holdings
    .map((holding) => HOLDING_STATUS_TO_ALLOCATION[holding.status ?? 'pending'] ?? 'pending')
    .sort((a, b) => (ALLOCATION_PRIORITY[a] ?? 99) - (ALLOCATION_PRIORITY[b] ?? 99))
  return statuses[0] ?? null
}

function coerceAllocationStatus(
  existingStatus: string | null | undefined,
  subscriptions: EntityInvestorSubscriptionSummary[],
  holdings: EntityInvestorHoldingSummary[]
): string {
  const normalizedExisting = existingStatus ?? null
  const subscriptionDerived = deriveStatusFromSubscriptions(subscriptions)
  const holdingsDerived = deriveStatusFromHoldings(holdings)

  const candidates = [
    normalizedExisting,
    subscriptionDerived,
    holdingsDerived
  ].filter((status): status is string => Boolean(status))

  if (candidates.length === 0) return 'pending'

  const sorted = candidates.sort(
    (a, b) => (ALLOCATION_PRIORITY[a] ?? 99) - (ALLOCATION_PRIORITY[b] ?? 99)
  )
  return sorted[0]
}

function computeTotal(subscriptions: EntityInvestorSubscriptionSummary[]): number | null {
  const sum = subscriptions.reduce((acc, sub) => acc + (sub.commitment ?? 0), 0)
  return sum > 0 ? sum : null
}

function computeHoldingsTotal(holdings: EntityInvestorHoldingSummary[]): number | null {
  const sum = holdings.reduce((acc, holding) => acc + (holding.subscribed_amount ?? 0), 0)
  return sum > 0 ? sum : null
}

function pickLatestSubscription(subscriptions: EntityInvestorSubscriptionSummary[]): EntityInvestorSubscriptionSummary | null {
  if (subscriptions.length === 0) return null
  const sorted = [...subscriptions].sort((a, b) => {
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0
    return bTime - aTime
  })
  return sorted[0] ?? null
}

export function mergeEntityInvestorData({
  entityInvestors = [],
  subscriptions = [],
  holdings = [],
  deals = []
}: MergeEntityInvestorParams): EntityInvestorSummary[] {
  const investorMap = new Map<string, EntityInvestorSummary>()
  const subscriptionIdsSeen = new Set<string>()
  const dealNames = new Map<string, string | null>()

  deals?.forEach((deal) => {
    if (!deal?.id) return
    dealNames.set(deal.id, deal.name ?? null)
  })

  entityInvestors?.forEach((link) => {
    const investorId =
      link.investor?.id ??
      (link as any).investor_id ??
      link.id

    const normalizedSubscriptions: EntityInvestorSubscriptionSummary[] = []
    if (link.subscription) {
      const normalized = normalizeSubscription('linked', link.subscription)
      normalizedSubscriptions.push(normalized)
      subscriptionIdsSeen.add(normalized.id)
    }

    const entry: EntityInvestorSummary = {
      id: link.id,
      relationship_role: link.relationship_role ?? null,
      allocation_status: link.allocation_status ?? null,
      invite_sent_at: link.invite_sent_at ?? null,
      created_at: link.created_at,
      updated_at: link.updated_at ?? null,
      notes: link.notes ?? null,
      investor: link.investor ?? null,
      subscription: pickLatestSubscription(normalizedSubscriptions),
      subscriptions: normalizedSubscriptions,
      holdings: [],
      total_commitment: computeTotal(normalizedSubscriptions),
      total_holdings_amount: null,
      source: 'entity_link'
    }

    investorMap.set(investorId, entry)
  })

  subscriptions?.forEach((subscriptionRow) => {
    if (!subscriptionRow?.investor_id || subscriptionIdsSeen.has(subscriptionRow.id)) {
      return
    }

    const normalized = normalizeSubscription('auto_discovered', subscriptionRow)
    subscriptionIdsSeen.add(normalized.id)

    const existing = investorMap.get(subscriptionRow.investor_id)
    if (existing) {
      existing.subscriptions = existing.subscriptions ?? []
      existing.subscriptions.push(normalized)
      existing.subscription = pickLatestSubscription(existing.subscriptions)
      existing.total_commitment = computeTotal(existing.subscriptions)
      existing.source =
        existing.source === 'entity_link' && (existing.holdings?.length ?? 0) > 0
          ? 'hybrid'
          : existing.source === 'entity_link'
            ? 'entity_link'
            : 'subscription_only'
      if (!existing.investor) {
        existing.investor = subscriptionRow.investor ?? null
      }
    } else {
      const entry: EntityInvestorSummary = {
        id: `subscription-${subscriptionRow.id}`,
        relationship_role: 'Subscription Holder',
        allocation_status: subscriptionRow.status ?? 'pending',
        invite_sent_at: null,
        created_at: subscriptionRow.created_at ?? new Date().toISOString(),
        updated_at: null,
        notes: 'Auto-discovered via subscription record',
        investor: subscriptionRow.investor ?? null,
        subscription: normalized,
        subscriptions: [normalized],
        holdings: [],
        total_commitment: normalized.commitment ?? null,
        total_holdings_amount: null,
        source: 'subscription_only'
      }
      investorMap.set(subscriptionRow.investor_id, entry)
    }
  })

  holdings?.forEach((holding) => {
    if (!holding?.investor_id) return
    const normalizedHolding = normalizeHolding(holding, dealNames)
    const existing = investorMap.get(holding.investor_id)

    if (existing) {
      existing.holdings = existing.holdings ?? []
      const isDuplicate = existing.holdings.some((item) => item.id === normalizedHolding.id)
      if (!isDuplicate) {
        existing.holdings.push(normalizedHolding)
      }

      existing.total_holdings_amount = computeHoldingsTotal(existing.holdings)
      if (!existing.subscription && existing.subscriptions && existing.subscriptions.length === 0) {
        const derived = subscriptionFromHolding(holding)
        existing.subscriptions = [derived]
        existing.subscription = derived
        existing.total_commitment = computeTotal(existing.subscriptions)
      }

      if (!existing.investor) {
        existing.investor = holding.investor ?? null
      }

      existing.source =
        existing.source === 'entity_link'
          ? (existing.subscriptions?.length ?? 0) > 0
            ? 'hybrid'
            : 'entity_link'
          : (existing.subscriptions?.length ?? 0) > 0
            ? 'hybrid'
            : 'holding_only'
    } else {
      const derivedSubscription = subscriptionFromHolding(holding)
      const entry: EntityInvestorSummary = {
        id: `holding-${holding.id}`,
        relationship_role: 'Holding Participant',
        allocation_status:
          HOLDING_STATUS_TO_ALLOCATION[holding.status ?? 'pending'] ?? 'pending',
        invite_sent_at: null,
        created_at: holding.created_at ?? new Date().toISOString(),
        updated_at: holding.updated_at ?? null,
        notes: `Auto-discovered holding for deal ${normalizedHolding.deal_name ?? holding.deal_id ?? ''}`.trim(),
        investor: holding.investor ?? null,
        subscription: derivedSubscription,
        subscriptions: [derivedSubscription],
        holdings: [normalizedHolding],
        total_commitment: derivedSubscription.commitment ?? null,
        total_holdings_amount: normalizedHolding.subscribed_amount ?? null,
        source: 'holding_only'
      }
      investorMap.set(holding.investor_id, entry)
    }
  })

  for (const entry of investorMap.values()) {
    entry.subscriptions = entry.subscriptions ?? []
    entry.holdings = entry.holdings ?? []

    entry.total_commitment = computeTotal(entry.subscriptions)
    entry.total_holdings_amount = computeHoldingsTotal(entry.holdings)
    entry.subscription = pickLatestSubscription(entry.subscriptions)
    entry.allocation_status = coerceAllocationStatus(
      entry.allocation_status,
      entry.subscriptions,
      entry.holdings
    )

    const hasEntityLink = entry.source === 'entity_link'
    const hasSubscriptions = (entry.subscriptions?.length ?? 0) > 0
    const hasHoldings = (entry.holdings?.length ?? 0) > 0

    if (hasEntityLink && (hasSubscriptions || hasHoldings)) {
      entry.source = 'hybrid'
    } else if (!hasEntityLink && hasSubscriptions && hasHoldings) {
      entry.source = 'hybrid'
    } else if (!hasEntityLink && hasSubscriptions && !hasHoldings) {
      entry.source = 'subscription_only'
    } else if (!hasEntityLink && !hasSubscriptions && hasHoldings) {
      entry.source = 'holding_only'
    }
  }

  return Array.from(investorMap.values()).sort((a, b) => {
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0
    return bTime - aTime
  })
}
