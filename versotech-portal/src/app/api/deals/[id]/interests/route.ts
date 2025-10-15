import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const createInterestSchema = z.object({
  investor_id: z.string().uuid().optional(),
  indicative_amount: z.number().positive().optional(),
  indicative_currency: z.string().max(8).optional(),
  notes: z.string().max(4000).optional(),
  is_post_close: z.boolean().optional()
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

  const isStaff = profile?.role && profile.role.startsWith('staff_')

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

  const filter = request.nextUrl.searchParams.get('status')

  const query = serviceSupabase
    .from('investor_deal_interest')
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

  if (filter) {
    query.eq('status', filter)
  }

  if (!isStaff) {
    query.in('investor_id', investorIds)
  }

  const { data, error } = await query

  if (error) {
    console.error('Failed to fetch interests:', error)
    return NextResponse.json({ error: 'Failed to fetch interests' }, { status: 500 })
  }

  return NextResponse.json({ interests: data ?? [] })
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
  const validation = createInterestSchema.safeParse(body ?? {})
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid request data', details: validation.error.issues },
      { status: 400 }
    )
  }

  const { investor_id, indicative_amount, indicative_currency, notes, is_post_close } = validation.data

  const { data: investorLinks } = await supabase
    .from('investor_users')
    .select('investor_id')
    .eq('user_id', user.id)

  const linkedInvestorIds = investorLinks?.map(link => link.investor_id) ?? []

  if (linkedInvestorIds.length === 0) {
    return NextResponse.json(
      { error: 'No investor profile associated with this account' },
      { status: 403 }
    )
  }

  const resolvedInvestorId = investor_id
    ? linkedInvestorIds.includes(investor_id)
      ? investor_id
      : null
    : linkedInvestorIds[0]

  if (!resolvedInvestorId) {
    return NextResponse.json(
      { error: 'Not authorized to submit interest for the specified investor' },
      { status: 403 }
    )
  }

  const { data: dealMembership } = await supabase
    .from('deal_memberships')
    .select('deal_id')
    .eq('deal_id', dealId)
    .eq('investor_id', resolvedInvestorId)
    .maybeSingle()

  if (!dealMembership) {
    return NextResponse.json(
      { error: 'You do not have access to this deal' },
      { status: 403 }
    )
  }

  // For post-close deals, only record in signals table (no approval workflow)
  if (is_post_close) {
    const { error: signalError } = await serviceSupabase
      .from('investor_interest_signals')
      .insert({
        deal_id: dealId,
        investor_id: resolvedInvestorId,
        signal_type: 'similar_deal_notification_request',
        created_by: user.id,
        metadata: {
          indicative_amount,
          indicative_currency,
          notes
        }
      })

    if (signalError) {
      console.error('Failed to create interest signal:', signalError)
      return NextResponse.json({ error: 'Failed to submit interest' }, { status: 500 })
    }

    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.CREATE,
      entity: AuditEntities.DEALS,
      entity_id: dealId,
      metadata: {
        type: 'post_close_interest',
        deal_id: dealId,
        investor_id: resolvedInvestorId,
        indicative_amount,
        indicative_currency
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Interest recorded successfully'
    })
  }

  // For open deals, create interest with approval workflow
  const { data: interest, error: insertError } = await serviceSupabase
    .from('investor_deal_interest')
    .insert({
      deal_id: dealId,
      investor_id: resolvedInvestorId,
      indicative_amount,
      indicative_currency,
      notes,
      created_by: user.id,
      status: 'pending_review'
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

  if (insertError || !interest) {
    console.error('Failed to create interest:', insertError)
    return NextResponse.json({ error: 'Failed to submit interest' }, { status: 500 })
  }

  await auditLogger.log({
    actor_user_id: user.id,
    action: AuditActions.CREATE,
    entity: AuditEntities.DEALS,
    entity_id: interest.id,
    metadata: {
      type: 'deal_interest',
      deal_id: dealId,
      investor_id: resolvedInvestorId,
      indicative_amount,
      indicative_currency
    }
  })

  return NextResponse.json({
    success: true,
    interest,
    message: 'Interest submitted successfully'
  })
}
