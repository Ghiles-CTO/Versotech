import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { trackDealEvent } from '@/lib/analytics'
import { canEntityInvest, getEligibilityBlockersSummary } from '@/lib/entities/entity-investment-eligibility'
import {
  assertPublishedDealTermSheet,
  getOrCreateSubmissionCycle,
  type SubmissionCycleIntent,
  updateDealInvestmentCycleProgress,
} from '@/lib/deals/investment-cycles'

const submissionSchema = z.object({
  investor_id: z.string().uuid().optional(),
  payload: z.record(z.string(), z.any()).optional().default({}),
  notes: z.string().max(4000).optional().nullable(),
  subscription_type: z.enum(['personal', 'entity']).optional(),
  counterparty_entity_id: z.string().uuid().optional().nullable(),
  intent: z.enum(['continue_cycle', 'start_new_cycle']).optional().nullable(),
  cycle_id: z.string().uuid().optional().nullable(),
  term_sheet_id: z.string().uuid().optional().nullable(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: dealId } = await params
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isStaff = profile?.role?.startsWith('staff_') || profile?.role === 'ceo'

  const { data: investorLinks } = await supabase
    .from('investor_users')
    .select('investor_id')
    .eq('user_id', user.id)

  const investorIds = investorLinks?.map(link => link.investor_id) ?? []

  if (!isStaff && investorIds.length === 0) {
    return NextResponse.json(
      { error: 'No investor profile associated with this account' },
      { status: 403 }
    )
  }

  const query = serviceSupabase
    .from('deal_subscription_submissions')
    .select(
      `
        *,
        investors (
          id,
          legal_name
        ),
        documents!subscription_submission_id (
          id,
          name,
          type,
          status,
          file_key,
          mime_type,
          file_size_bytes,
          created_at,
          created_by
        )
      `
    )
    .eq('deal_id', dealId)
    .order('submitted_at', { ascending: false })

  if (!isStaff) {
    query.in('investor_id', investorIds)
  }

  const { data, error } = await query
  if (error) {
    console.error('Failed to fetch subscription submissions:', error)
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 })
  }

  // Enrich each submission with pack status derived from documents
  const enrichedSubmissions = (data ?? []).map((submission: any) => {
    const documents = submission.documents || []
    let packStatus: 'no_pack' | 'draft' | 'final' | 'pending_signature' | 'signed' = 'no_pack'
    let packDocumentId: string | undefined

    if (documents.length > 0) {
      // Sort by created_at DESC to get most recent document
      const sortedDocs = [...documents].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      const latestDoc = sortedDocs[0]
      packDocumentId = latestDoc.id

      // Determine pack status based on document status
      if (latestDoc.status === 'signed' || latestDoc.status === 'executed') {
        packStatus = 'signed'
      } else if (latestDoc.status === 'pending_signature' || latestDoc.status === 'awaiting_signature') {
        packStatus = 'pending_signature'
      } else if (latestDoc.status === 'final') {
        packStatus = 'final'
      } else if (latestDoc.status === 'draft') {
        packStatus = 'draft'
      }
    }

    return {
      ...submission,
      pack_status: packStatus,
      pack_document_id: packDocumentId,
      document_count: documents.length,
      subscription_id: submission.formal_subscription_id || null
    }
  })

  return NextResponse.json({ submissions: enrichedSubmissions })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: dealId } = await params
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const parsed = submissionSchema.safeParse(body ?? {})

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request data', details: (parsed.error as any).errors },
      { status: 400 }
    )
  }

  const {
    investor_id,
    payload,
    notes,
    subscription_type,
    counterparty_entity_id,
    intent,
    cycle_id,
    term_sheet_id,
  } = parsed.data

  // Validate entity selection
  if (subscription_type === 'entity' && !counterparty_entity_id) {
    return NextResponse.json(
      { error: 'Counterparty entity ID is required when subscription type is "entity"' },
      { status: 400 }
    )
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, display_name')
    .eq('id', user.id)
    .single()

  const isStaff = profile?.role?.startsWith('staff_') || profile?.role === 'ceo'

  const { data: investorLinks } = await supabase
    .from('investor_users')
    .select('investor_id')
    .eq('user_id', user.id)

  const investorIds = investorLinks?.map(link => link.investor_id) ?? []

  if (!isStaff && investorIds.length === 0) {
    return NextResponse.json(
      { error: 'No investor profile associated with this account' },
      { status: 403 }
    )
  }

  const resolvedInvestorId = investor_id ?? investorIds[0]

  if (investor_id && !isStaff && !investorIds.includes(investor_id)) {
    return NextResponse.json(
      { error: 'Not authorized to submit for the specified investor' },
      { status: 403 }
    )
  }

  if (!resolvedInvestorId) {
    return NextResponse.json(
      { error: 'Investor ID is required' },
      { status: 400 }
    )
  }

  // Validate counterparty entity ownership if provided
  if (counterparty_entity_id) {
    const { data: entity, error: entityError } = await serviceSupabase
      .from('investor_counterparty')
      .select('id')
      .eq('id', counterparty_entity_id)
      .eq('investor_id', resolvedInvestorId)
      .eq('is_active', true)
      .maybeSingle()

    if (entityError || !entity) {
      return NextResponse.json(
        { error: 'Invalid counterparty entity or entity does not belong to this investor' },
        { status: 403 }
      )
    }
  }

  const { data: investorRecord, error: investorError } = await serviceSupabase
    .from('investors')
    .select('account_approval_status, kyc_status, status')
    .eq('id', resolvedInvestorId)
    .maybeSingle()

  if (investorError || !investorRecord) {
    console.error('Failed to fetch investor account approval status:', investorError)
    return NextResponse.json(
      { error: 'Unable to verify account approval status' },
      { status: 500 }
    )
  }

  const investorStatus = investorRecord.status?.toLowerCase() ?? null
  const normalizedAccountStatus = (investorStatus === 'unauthorized' || investorStatus === 'blacklisted')
    ? 'unauthorized'
    : investorRecord.account_approval_status

  const { data: dealRecord, error: dealError } = await serviceSupabase
    .from('deals')
    .select('id, status')
    .eq('id', dealId)
    .maybeSingle()

  if (dealError || !dealRecord) {
    return NextResponse.json(
      { error: 'Deal not found' },
      { status: 404 }
    )
  }

  if (!['open', 'allocation_pending'].includes(dealRecord.status)) {
    return NextResponse.json(
      { error: `Deal is not open for subscriptions. Current status: ${dealRecord.status}` },
      { status: 400 }
    )
  }

  if (normalizedAccountStatus !== 'approved') {
    return NextResponse.json(
      {
        error: 'Account approval required before subscribing.',
        account_approval_status: normalizedAccountStatus,
        kyc_status: investorRecord.kyc_status
      },
      { status: 403 }
    )
  }

  // Entity Investment Eligibility Gate
  // Check if the investor entity meets all requirements:
  // 1. Entity KYC must be approved
  // 2. All signatory members must be CEO-approved with completed KYC
  const eligibility = await canEntityInvest(serviceSupabase, resolvedInvestorId, 'investor')

  if (!eligibility.canInvest) {
    const summary = getEligibilityBlockersSummary(eligibility.blockers)
    console.log('[Subscription] Entity not eligible to invest:', {
      investor_id: resolvedInvestorId,
      blockers: eligibility.blockers
    })

    return NextResponse.json(
      {
        error: 'This entity is not eligible to invest at this time',
        eligibility_error: true,
        blockers: eligibility.blockers,
        summary: summary,
        details: `Unable to submit subscription: ${summary}. Please ensure all KYC requirements are met and signatory members are approved.`
      },
      { status: 403 }
    )
  }

  // Note: Data room access check removed - investors can now subscribe directly
  // without requiring data room access first (per client request Dec 2025)

  const { data: membership } = await serviceSupabase
    .from('deal_memberships')
    .select(`
      deal_id,
      user_id,
      investor_id,
      role,
      referred_by_entity_id,
      referred_by_entity_type,
      assigned_fee_plan_id,
      term_sheet_id
    `)
    .eq('deal_id', dealId)
    .eq('investor_id', resolvedInvestorId)
    .maybeSingle()

  const resolvedIntent: SubmissionCycleIntent | null =
    intent || (cycle_id ? 'continue_cycle' : term_sheet_id ? 'start_new_cycle' : null)

  if (!resolvedIntent) {
    return NextResponse.json(
      { error: 'Subscription intent is required. Specify whether you are continuing a round or starting a new one.' },
      { status: 400 }
    )
  }

  if (resolvedIntent === 'continue_cycle' && !cycle_id) {
    return NextResponse.json(
      { error: 'cycle_id is required when continuing an investment cycle' },
      { status: 400 }
    )
  }

  let effectiveTermSheetId = term_sheet_id || null

  if (resolvedIntent === 'continue_cycle' && cycle_id) {
    const { data: selectedCycle } = await serviceSupabase
      .from('deal_investment_cycles' as any)
      .select('term_sheet_id')
      .eq('id', cycle_id)
      .maybeSingle()
    effectiveTermSheetId = selectedCycle?.term_sheet_id || null
  }

  if (resolvedIntent === 'start_new_cycle' && !effectiveTermSheetId) {
    return NextResponse.json(
      { error: 'term_sheet_id is required when starting a new investment cycle' },
      { status: 400 }
    )
  }

  if (resolvedIntent === 'start_new_cycle' && effectiveTermSheetId) {
    try {
      await assertPublishedDealTermSheet(serviceSupabase, dealId, effectiveTermSheetId)
    } catch (termSheetError) {
      return NextResponse.json(
        { error: termSheetError instanceof Error ? termSheetError.message : 'Invalid term sheet selection' },
        { status: 400 }
      )
    }
  }

  let cycle
  try {
    cycle = await getOrCreateSubmissionCycle(serviceSupabase, {
      dealId,
      investorId: resolvedInvestorId,
      userId: membership?.user_id || user.id,
      role: membership?.role || 'investor',
      cycleId: cycle_id || null,
      termSheetId: effectiveTermSheetId,
      createdBy: user.id,
      referredByEntityId: membership?.referred_by_entity_id || null,
      referredByEntityType: membership?.referred_by_entity_type || null,
      assignedFeePlanId: membership?.assigned_fee_plan_id || null,
      intent: resolvedIntent,
    })
  } catch (cycleError) {
    console.error('Failed to resolve submission cycle:', cycleError)
    return NextResponse.json(
      { error: cycleError instanceof Error ? cycleError.message : 'Failed to resolve investment cycle' },
      { status: 400 }
    )
  }

  const { data: submission, error: insertError } = await serviceSupabase
    .from('deal_subscription_submissions')
    .insert({
      deal_id: dealId,
      investor_id: resolvedInvestorId,
      cycle_id: cycle.id,
      term_sheet_id: cycle.term_sheet_id,
      payload_json: payload ?? {},
      status: 'pending_review',
      created_by: user.id,
      subscription_type: subscription_type || 'personal',
      counterparty_entity_id: counterparty_entity_id || null
    })
    .select(
      `
        *,
        investors (
          id,
          legal_name
        )
      `
    )
    .single()

  if (insertError || !submission) {
    console.error('Failed to create subscription submission:', insertError)
    return NextResponse.json({ error: 'Failed to submit subscription' }, { status: 500 })
  }

  // Set interest_confirmed_at on membership — submitting a subscription IS confirming interest
  await serviceSupabase
    .from('deal_memberships')
    .update({
      interest_confirmed_at: new Date().toISOString(),
      viewed_at: new Date().toISOString()
    })
    .eq('deal_id', dealId)
    .eq('investor_id', resolvedInvestorId)
    .is('interest_confirmed_at', null)

  try {
    await updateDealInvestmentCycleProgress({
      supabase: serviceSupabase,
      cycleId: cycle.id,
      status: 'submission_pending_review',
      timestamps: {
        viewed_at: cycle.viewed_at || new Date().toISOString(),
        interest_confirmed_at: cycle.interest_confirmed_at || new Date().toISOString(),
        submission_pending_at: new Date().toISOString(),
      },
    })
  } catch (cycleProgressError) {
    console.error('Failed to update cycle submission progress:', cycleProgressError)
  }

  await trackDealEvent({
    supabase: serviceSupabase,
    dealId,
    investorId: resolvedInvestorId,
    eventType: 'data_room_submit',
    payload: {
      submission_id: submission.id,
      amount: payload?.amount ?? payload?.subscription_amount ?? null,
      currency: payload?.currency ?? null
    }
  })

  await auditLogger.log({
    actor_user_id: user.id,
    action: AuditActions.CREATE,
    entity: AuditEntities.DEALS,
    entity_id: submission.id,
    metadata: {
      type: 'subscription_submission',
      deal_id: dealId,
      investor_id: resolvedInvestorId,
      cycle_id: cycle.id,
      term_sheet_id: cycle.term_sheet_id,
      notes,
      payload
    }
  })

  // NOTE: Approval is automatically created by database trigger 'create_deal_subscription_approval'
  // when status = 'pending_review'. See migration 20251102093000_deal_workflow_phase1_finish.sql

  return NextResponse.json({
    success: true,
    submission,
    cycle,
  })
}
