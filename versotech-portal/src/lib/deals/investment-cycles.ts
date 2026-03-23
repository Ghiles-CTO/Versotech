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

export type SubmissionCycleIntent = 'continue_cycle' | 'start_new_cycle'

type DealRoundScope = {
  status?: string | null
  close_at?: string | null
  closed_processed_at?: string | null
}

type TermSheetRoundScope = {
  status?: string | null
  completion_date?: string | null
  closed_processed_at?: string | null
}

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
  action: 'created' | 'resumed' | 'replaced'
  replacedCycleId?: string | null
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

function hasDatePassed(value: string | null | undefined): boolean {
  if (!value) return false
  const timestamp = new Date(value).getTime()
  return Number.isFinite(timestamp) && timestamp <= Date.now()
}

export function isDealClosedForInvestmentRounds(deal: DealRoundScope | null | undefined): boolean {
  if (!deal) return true
  if (deal.closed_processed_at) return true
  if (deal.status === 'closed' || deal.status === 'cancelled') return true
  return hasDatePassed(deal.close_at)
}

export function isTermSheetClosedForInvestmentRounds(termSheet: TermSheetRoundScope | null | undefined): boolean {
  if (!termSheet) return true
  if (termSheet.closed_processed_at) return true
  if (termSheet.status === 'closed' || termSheet.status === 'cancelled') return true
  return hasDatePassed(termSheet.completion_date)
}

export async function assertInvestmentCycleScopeAvailable(
  supabase: SupabaseClient,
  dealId: string,
  termSheetId: string,
  options: { requirePublishedTermSheet?: boolean } = {}
): Promise<void> {
  const { data: deal, error: dealError } = await supabase
    .from('deals')
    .select('id, status, close_at, closed_processed_at')
    .eq('id', dealId)
    .maybeSingle()

  if (dealError) {
    throw dealError
  }

  if (!deal) {
    throw new Error('Deal not found.')
  }

  if (isDealClosedForInvestmentRounds(deal)) {
    throw new Error('This opportunity is no longer open for investment actions.')
  }

  const { data: termSheet, error: termSheetError } = await supabase
    .from('deal_fee_structures')
    .select('id, status, completion_date, closed_processed_at')
    .eq('id', termSheetId)
    .eq('deal_id', dealId)
    .maybeSingle()

  if (termSheetError) {
    throw termSheetError
  }

  if (!termSheet) {
    throw new Error('The selected term sheet does not exist for this deal.')
  }

  if (options.requirePublishedTermSheet && termSheet.status !== 'published') {
    throw new Error('Only published term sheets can be used to start a new investment round.')
  }

  if (isTermSheetClosedForInvestmentRounds(termSheet)) {
    throw new Error('This term sheet is no longer open for investment actions.')
  }
}

function commercialConfigChanged(
  cycle: DealInvestmentCycleRow,
  config: {
    role: string
    referredByEntityId?: string | null
    referredByEntityType?: string | null
    assignedFeePlanId?: string | null
  }
): boolean {
  return (
    cycle.role !== config.role ||
    (cycle.referred_by_entity_id || null) !== (config.referredByEntityId || null) ||
    (cycle.referred_by_entity_type || null) !== (config.referredByEntityType || null) ||
    (cycle.assigned_fee_plan_id || null) !== (config.assignedFeePlanId || null)
  )
}

async function getNextCycleSequenceNumber(
  supabase: SupabaseClient,
  dealId: string,
  investorId: string
): Promise<number> {
  const { data: latestCycle, error: latestCycleError } = await supabase
    .from('deal_investment_cycles' as any)
    .select('sequence_number')
    .eq('deal_id', dealId)
    .eq('investor_id', investorId)
    .order('sequence_number', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (latestCycleError) {
    throw latestCycleError
  }

  return (latestCycle?.sequence_number ?? 0) + 1
}

export async function getExistingFormalSubscriptionForCycle(
  supabase: SupabaseClient,
  cycleId: string
): Promise<{ id: string; status: string } | null> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('id, status')
    .eq('cycle_id', cycleId)
    .not('status', 'in', '(cancelled,rejected)')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data ?? null
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

export async function assertPublishedDealTermSheet(
  supabase: SupabaseClient,
  dealId: string,
  termSheetId: string
): Promise<void> {
  await assertInvestmentCycleScopeAvailable(supabase, dealId, termSheetId, {
    requirePublishedTermSheet: true,
  })
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
    const shouldPatchCommercialConfig = commercialConfigChanged(liveCycle, {
      role,
      referredByEntityId,
      referredByEntityType,
      assignedFeePlanId,
    })

    if (shouldPatchCommercialConfig && !canReplaceLiveCycle(liveCycle.status)) {
      throw new Error(
        'Investor already has an active workflow on this term sheet. Commercial changes are only allowed before subscription review starts.'
      )
    }

    const patch: Record<string, unknown> = {}
    if ((liveCycle.user_id || null) !== userId) {
      patch.user_id = userId
    }
    if (!liveCycle.dispatched_at) {
      patch.dispatched_at = now
    }
    if (shouldPatchCommercialConfig) {
      patch.role = role
      patch.referred_by_entity_id = referredByEntityId
      patch.referred_by_entity_type = referredByEntityType
      patch.assigned_fee_plan_id = assignedFeePlanId
    }

    if (Object.keys(patch).length === 0) {
      return {
        cycle: liveCycle,
        created: false,
        resumed: true,
        action: 'resumed',
      }
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
      action: 'resumed',
    }
  }

  if (conflictingLiveCycle) {
    if (!canReplaceLiveCycle(conflictingLiveCycle.status)) {
      throw new Error('Investor already has an active term sheet workflow for this opportunity')
    }

    const { error: replaceError } = await supabase
      .from('deal_investment_cycles' as any)
      .update({
        status: 'cancelled',
        cancelled_at: now,
        rejection_reason: 'Replaced before subscription review by dispatch to a different term sheet.',
        metadata: {
          ...(conflictingLiveCycle.metadata || {}),
          replacement_kind: 'term_sheet_switch',
          replacement_term_sheet_id: termSheetId,
          replacement_triggered_at: now,
        },
      })
      .eq('id', conflictingLiveCycle.id)

    if (replaceError) {
      throw replaceError
    }
  }

  const nextSequence = await getNextCycleSequenceNumber(supabase, dealId, investorId)

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
    action: conflictingLiveCycle ? 'replaced' : 'created',
    replacedCycleId: conflictingLiveCycle?.id || null,
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
    intent: SubmissionCycleIntent
  }
): Promise<DealInvestmentCycleRow> {
  if (args.intent === 'continue_cycle') {
    if (!args.cycleId) {
      throw new Error('cycleId is required to continue an existing investment cycle')
    }

    const cycle = await getCycleById(supabase, args.cycleId)
    if (!cycle) {
      throw new Error('Investment cycle not found')
    }
    if (cycle.deal_id !== args.dealId || cycle.investor_id !== args.investorId) {
      throw new Error('Investment cycle does not belong to this opportunity')
    }
    const retryableRejectedInitialCycle =
      cycle.status === 'rejected' &&
      cycle.sequence_number === 1

    if (!isCycleStatusLive(cycle.status) && !retryableRejectedInitialCycle) {
      throw new Error('Investment cycle is already closed')
    }

    await assertInvestmentCycleScopeAvailable(supabase, cycle.deal_id, cycle.term_sheet_id)

    const existingSubscription = await getExistingFormalSubscriptionForCycle(supabase, cycle.id)
    if (existingSubscription) {
      throw new Error('This investment cycle already has a subscription. Start a new round to invest more.')
    }

    const { data: openSubmission, error: openSubmissionError } = await supabase
      .from('deal_subscription_submissions')
      .select('id')
      .eq('cycle_id', cycle.id)
      .in('status', ['pending_review', 'approved'])
      .limit(1)
      .maybeSingle()

    if (openSubmissionError) {
      throw openSubmissionError
    }

    if (openSubmission) {
      throw new Error('This investment cycle already has a submission in review.')
    }

    return cycle
  }

  if (!args.termSheetId) {
    throw new Error('termSheetId is required to start a new investment cycle')
  }

  const { data: liveCycle, error: liveCycleError } = await supabase
    .from('deal_investment_cycles' as any)
    .select('id, term_sheet_id, status')
    .eq('deal_id', args.dealId)
    .eq('investor_id', args.investorId)
    .in('status', [...LIVE_CYCLE_STATUSES])
    .order('sequence_number', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (liveCycleError) {
    throw liveCycleError
  }

  if (liveCycle) {
    if (liveCycle.term_sheet_id === args.termSheetId) {
      throw new Error('A live workflow already exists for this term sheet. Continue the current cycle instead.')
    }
    throw new Error('Investor already has an active workflow for this opportunity.')
  }

  await assertInvestmentCycleScopeAvailable(supabase, args.dealId, args.termSheetId, {
    requirePublishedTermSheet: true,
  })

  const { data: previousCycleForTermSheet, error: previousCycleError } = await supabase
    .from('deal_investment_cycles' as any)
    .select('*')
    .eq('deal_id', args.dealId)
    .eq('investor_id', args.investorId)
    .eq('term_sheet_id', args.termSheetId)
    .in('status', ['funded', 'active'])
    .order('sequence_number', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (previousCycleError) {
    throw previousCycleError
  }

  if (!previousCycleForTermSheet) {
    throw new Error('A new round can only be started from an existing funded term-sheet history.')
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
