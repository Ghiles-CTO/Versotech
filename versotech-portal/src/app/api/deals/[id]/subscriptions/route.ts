import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { trackDealEvent } from '@/lib/analytics'

const submissionSchema = z.object({
  investor_id: z.string().uuid().optional(),
  payload: z.record(z.string(), z.any()).optional().default({}),
  notes: z.string().max(4000).optional().nullable()
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

  const isStaff = profile?.role?.startsWith('staff_') ?? false

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

  return NextResponse.json({ submissions: data ?? [] })
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

  const { investor_id, payload, notes } = parsed.data

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, display_name')
    .eq('id', user.id)
    .single()

  const isStaff = profile?.role?.startsWith('staff_') ?? false

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

  const { data: membership } = await supabase
    .from('deal_memberships')
    .select('deal_id')
    .eq('deal_id', dealId)
    .eq('investor_id', resolvedInvestorId)
    .maybeSingle()

  if (!membership && !isStaff) {
    return NextResponse.json(
      { error: 'Investor does not have access to this deal' },
      { status: 403 }
    )
  }

  const { data: submission, error: insertError } = await serviceSupabase
    .from('deal_subscription_submissions')
    .insert({
      deal_id: dealId,
      investor_id: resolvedInvestorId,
      payload_json: payload ?? {},
      status: 'pending_review',
      created_by: user.id
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
      notes,
      payload
    }
  })

  // AUTO-CREATE APPROVAL for subscription review
  try {
    const { data: deal } = await serviceSupabase
      .from('deals')
      .select('name, currency')
      .eq('id', dealId)
      .single()

    const { data: investor } = await serviceSupabase
      .from('investors')
      .select('legal_name')
      .eq('id', resolvedInvestorId)
      .single()

    const amount = payload?.amount || 0
    const currency = payload?.currency || deal?.currency || 'USD'

    const { data: approval, error: approvalError } = await serviceSupabase
      .from('approvals')
      .insert({
        entity_type: 'deal_subscription',
        entity_id: submission.id,
        requested_by: user.id,
        related_investor_id: resolvedInvestorId,
        related_deal_id: dealId,
        status: 'pending',
        priority: 'high',
        title: `Subscription Request - ${investor?.legal_name || 'Investor'}`,
        description: `Subscription request for ${deal?.name || 'deal'}: ${new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: currency,
          minimumFractionDigits: 0
        }).format(amount)}`,
        entity_metadata: {
          subscription_submission_id: submission.id,
          amount_requested: amount,
          currency: currency,
          bank_confirmation: payload?.bank_confirmation || false,
          notes: payload?.notes || null
        }
      })
      .select()
      .single()

    if (approvalError) {
      console.error('Failed to create approval for subscription:', approvalError)
      // Don't fail the submission if approval creation fails
    } else {
      console.log('✅ Approval created for subscription:', {
        approval_id: approval.id,
        submission_id: submission.id,
        investor_id: resolvedInvestorId,
        deal_id: dealId
      })
    }
  } catch (approvalCreationError) {
    console.error('Error creating approval for subscription:', approvalCreationError)
    // Don't fail the submission if approval creation fails
  }

  return NextResponse.json({
    success: true,
    submission
  })
}
