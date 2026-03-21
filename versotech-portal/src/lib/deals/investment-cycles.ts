import { SupabaseClient } from '@supabase/supabase-js'

export const LIVE_CYCLE_STATUSES = [
  'dispatched',
  'viewed',
  'interest_confirmed',
  'submission_pending_review',
  'approved',
  'pack_generated',
  'pack_sent',
  'signed',
] as const

export const TERMINAL_CYCLE_STATUSES = [
  'funded',
  'active',
  'cancelled',
  'rejected',
] as const

export type DealInvestmentCycleStatus =
  | (typeof LIVE_CYCLE_STATUSES)[number]
  | (typeof TERMINAL_CYCLE_STATUSES)[number]

export type DealInvestmentCycleRow = {
  id: string
  deal_id: string
  user_id: string | null
  investor_id: string
  term_sheet_id: string
  role: string
  referred_by_entity_id: string | null
  referred_by_entity_type: string | null
  assigned_fee_plan_id: string | null
  sequence_number: number
  status: DealInvestmentCycleStatus
  created_at: string
  updated_at: string
  dispatched_at: string | null
  viewed_at: string | null
  interest_confirmed_at: string | null
  submission_pending_at: string | null
  approved_at: string | null
  pack_generated_at: string | null
  pack_sent_at: string | null
  signed_at: string | null
  funded_at: string | null
  activated_at: string | null
  cancelled_at: string | null
  rejected_at: string | null
  rejection_reason: string | null
  metadata?: Record<string, unknown> | null
}

export type CreateOrResumeCycleResult = {
  cycle: DealInvestmentCycleRow
  created: boolean
  resumed: boolean
}

type CycleCreateArgs = {
  supabase: SupabaseClient
  dealId: string
  userId: string
  investorId: string
  termSheetId: string
  role: string
  createdBy?: string | null
  referredByEntityId?: string | null
  referredByEntityType?: string | null
  assignedFeePlanId?: string | null
  dispatchTimestamp?: string
}

type CycleProgressArgs = {
  supabase: SupabaseClient
  cycleId: string
  status?: DealInvestmentCycleStatus
  timestamps?: Partial<Record<
    | 'dispatched_at'
    | 'viewed_at'
    | 'interest_confirmed_at'
    | 'submission_pending_at'
    | 'approved_at'
    | 'pack_generated_at'
    | 'pack_sent_at'
    | 'signed_at'
    | 'funded_at'
    | 'activated_at'
    | 'cancelled_at'
    | 'rejected_at',
    string | null
  >>
  rejectionReason?: string | null
}

function isCycleStatusLive(status: string | null | undefined): boolean {
  return !!status && LIVE_CYCLE_STATUSES.includes(status as (typeof LIVE_CYCLE_STATUSES)[number])
}

function canReplaceLiveCycle(status: string | null | undefined): boolean {
  return status === 'dispatched' || status === 'viewed' || status === 'interest_confirmed'
}

export function getCycleStage(cycle: Partial<DealInvestmentCycleRow> | null | undefined): number {
  if (!cycle) return 0
  if (cycle.activated_at || cycle.status === 'active') return 10
  if (cycle.funded_at || cycle.status === 'funded') return 9
  if (cycle.signed_at || cycle.status === 'signed') return 8
  if (cycle.pack_sent_at || cycle.status === 'pack_sent') return 7
  if (cycle.pack_generated_at || cycle.status === 'pack_generated') return 6
  if (cycle.approved_at || cycle.status === 'approved') return 5
  if (cycle.submission_pending_at || cycle.status === 'submission_pending_review') return 4
  if (cycle.interest_confirmed_at || cycle.status === 'interest_confirmed') return 3
  if (cycle.viewed_at || cycle.status === 'viewed') return 2
  if (cycle.dispatched_at || cycle.status === 'dispatched') return 1
  return 0
}

export async function getCycleById(
  supabase: SupabaseClient,
  cycleId: string
): Promise<DealInvestmentCycleRow | null> {
  const { data, error } = await supabase
    .from('deal_investment_cycles' as any)
    .select('*')
    .eq('id', cycleId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return (data as DealInvestmentCycleRow | null) ?? null
}

export async function getLatestCycleForInvestorTermSheet(
  supabase: SupabaseClient,
  dealId: string,
  investorId: string,
  termSheetId: string
): Promise<DealInvestmentCycleRow | null> {
  const { data, error } = await supabase
    .from('deal_investment_cycles' as any)
    .select('*')
    .eq('deal_id', dealId)
    .eq('investor_id', investorId)
    .eq('term_sheet_id', termSheetId)
    .order('sequence_number', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw error
  }

  return (data as DealInvestmentCycleRow | null) ?? null
}

export async function createOrResumeDealInvestmentCycle({
  supabase,
  dealId,
  userId,
  investorId,
  termSheetId,
  role,
  createdBy = null,
  referredByEntityId = null,
  referredByEntityType = null,
  assignedFeePlanId = null,
  dispatchTimestamp,
}: CycleCreateArgs): Promise<CreateOrResumeCycleResult> {
  const now = dispatchTimestamp || new Date().toISOString()

  const { data: liveCycles, error: liveCycleError } = await supabase
    .from('deal_investment_cycles' as any)
    .select('*')
    .eq('deal_id', dealId)
    .eq('investor_id', investorId)
    .in('status', [...LIVE_CYCLE_STATUSES])
    .order('sequence_number', { ascending: false })
    .order('created_at', { ascending: false })

  if (liveCycleError) {
    throw liveCycleError
  }

  const liveCycleList = (liveCycles as DealInvestmentCycleRow[] | null) ?? []
  const liveCycle = liveCycleList.find(cycle => cycle.term_sheet_id === termSheetId) || null
  const conflictingLiveCycle = liveCycleList.find(cycle => cycle.term_sheet_id !== termSheetId) || null

  if (liveCycle) {
    const patch: Record<string, unknown> = {
      user_id: userId,
      role,
      referred_by_entity_id: referredByEntityId,
      referred_by_entity_type: referredByEntityType,
      assigned_fee_plan_id: assignedFeePlanId,
    }

    if (!liveCycle.dispatched_at) {
      patch.dispatched_at = now
    }

    const { data: updatedCycle, error: updateError } = await supabase
      .from('deal_investment_cycles' as any)
      .update(patch)
      .eq('id', liveCycle.id)
      .select('*')
      .single()

    if (updateError) {
      throw updateError
    }

    return {
      cycle: updatedCycle as DealInvestmentCycleRow,
      created: false,
      resumed: true,
    }
  }

  if (conflictingLiveCycle) {
    if (!canReplaceLiveCycle(conflictingLiveCycle.status)) {
      throw new Error('Investor already has an active term sheet workflow for this opportunity')
    }

    const { data: replacedCycle, error: replaceError } = await supabase
      .from('deal_investment_cycles' as any)
      .update({
        user_id: userId,
        term_sheet_id: termSheetId,
        role,
        referred_by_entity_id: referredByEntityId,
        referred_by_entity_type: referredByEntityType,
        assigned_fee_plan_id: assignedFeePlanId,
        status: 'dispatched',
        dispatched_at: now,
        viewed_at: null,
        interest_confirmed_at: null,
        submission_pending_at: null,
        approved_at: null,
        pack_generated_at: null,
        pack_sent_at: null,
        signed_at: null,
        funded_at: null,
        activated_at: null,
        cancelled_at: null,
        rejected_at: null,
        rejection_reason: null,
      })
      .eq('id', conflictingLiveCycle.id)
      .select('*')
      .single()

    if (replaceError || !replacedCycle) {
      throw replaceError
    }

    return {
      cycle: replacedCycle as DealInvestmentCycleRow,
      created: false,
      resumed: true,
    }
  }

  const { data: latestCycle, error: latestCycleError } = await supabase
    .from('deal_investment_cycles' as any)
    .select('sequence_number')
    .eq('deal_id', dealId)
    .eq('investor_id', investorId)
    .eq('term_sheet_id', termSheetId)
    .order('sequence_number', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (latestCycleError) {
    throw latestCycleError
  }

  const nextSequence = (latestCycle?.sequence_number ?? 0) + 1

  const { data: insertedCycle, error: insertError } = await supabase
    .from('deal_investment_cycles' as any)
    .insert({
      deal_id: dealId,
      user_id: userId,
      investor_id: investorId,
      term_sheet_id: termSheetId,
      role,
      referred_by_entity_id: referredByEntityId,
      referred_by_entity_type: referredByEntityType,
      assigned_fee_plan_id: assignedFeePlanId,
      sequence_number: nextSequence,
      status: 'dispatched',
      created_by: createdBy,
      dispatched_at: now,
    })
    .select('*')
    .single()

  if (insertError || !insertedCycle) {
    throw insertError
  }

  return {
    cycle: insertedCycle as DealInvestmentCycleRow,
    created: true,
    resumed: false,
  }
}

export async function updateDealInvestmentCycleProgress({
  supabase,
  cycleId,
  status,
  timestamps = {},
  rejectionReason,
}: CycleProgressArgs): Promise<DealInvestmentCycleRow | null> {
  const patch: Record<string, unknown> = {
    ...timestamps,
  }

  if (status) {
    patch.status = status
  }

  if (rejectionReason !== undefined) {
    patch.rejection_reason = rejectionReason
  }

  const { data, error } = await supabase
    .from('deal_investment_cycles' as any)
    .update(patch)
    .eq('id', cycleId)
    .select('*')
    .maybeSingle()

  if (error) {
    throw error
  }

  return (data as DealInvestmentCycleRow | null) ?? null
}

export async function getOrCreateSubmissionCycle(
  supabase: SupabaseClient,
  args: {
    dealId: string
    investorId: string
    userId: string
    role: string
    cycleId?: string | null
    termSheetId?: string | null
    createdBy?: string | null
    referredByEntityId?: string | null
    referredByEntityType?: string | null
    assignedFeePlanId?: string | null
  }
): Promise<DealInvestmentCycleRow> {
  if (args.cycleId) {
    const cycle = await getCycleById(supabase, args.cycleId)
    if (!cycle) {
      throw new Error('Investment cycle not found')
    }
    if (cycle.deal_id !== args.dealId || cycle.investor_id !== args.investorId) {
      throw new Error('Investment cycle does not belong to this opportunity')
    }
    if (!isCycleStatusLive(cycle.status)) {
      throw new Error('Investment cycle is already closed')
    }
    return cycle
  }

  if (!args.termSheetId) {
    throw new Error('termSheetId is required when cycleId is not provided')
  }

  const existingCycle = await getLatestCycleForInvestorTermSheet(
    supabase,
    args.dealId,
    args.investorId,
    args.termSheetId
  )

  if (existingCycle && isCycleStatusLive(existingCycle.status)) {
    return existingCycle
  }

  if (
    existingCycle &&
    existingCycle.status !== 'funded' &&
    existingCycle.status !== 'active' &&
    existingCycle.status !== 'cancelled' &&
    existingCycle.status !== 'rejected'
  ) {
    return existingCycle
  }

  const created = await createOrResumeDealInvestmentCycle({
    supabase,
    dealId: args.dealId,
    investorId: args.investorId,
    userId: args.userId,
    termSheetId: args.termSheetId,
    role: args.role,
    createdBy: args.createdBy ?? null,
    referredByEntityId: args.referredByEntityId ?? null,
    referredByEntityType: args.referredByEntityType ?? null,
    assignedFeePlanId: args.assignedFeePlanId ?? null,
  })

  return created.cycle
}

export async function getLatestActiveOrRecentCycle(
  supabase: SupabaseClient,
  dealId: string,
  investorId: string
): Promise<DealInvestmentCycleRow | null> {
  const { data, error } = await supabase
    .from('deal_investment_cycles' as any)
    .select('*')
    .eq('deal_id', dealId)
    .eq('investor_id', investorId)
    .order('sequence_number', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    throw error
  }

  const cycles = (data as DealInvestmentCycleRow[] | null) ?? []
  return cycles.find(cycle => isCycleStatusLive(cycle.status)) || cycles[0] || null
}
