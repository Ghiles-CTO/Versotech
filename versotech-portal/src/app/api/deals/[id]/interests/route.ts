import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { trackDealEvent } from '@/lib/analytics'
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

  const isStaff = profile?.role && (profile.role.startsWith('staff_') || profile.role === 'ceo')

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

  const { data: dealRecord } = await serviceSupabase
    .from('deals')
    .select('id, name, status')
    .eq('id', dealId)
    .maybeSingle()

  const { data: ownerUsers } = await serviceSupabase
    .from('investor_users')
    .select('user_id')
    .eq('investor_id', resolvedInvestorId)
    .order('created_at', { ascending: true })
    .limit(1)

  const ownerUserId = ownerUsers?.[0]?.user_id ?? null

  // Store all interests in investor_deal_interest table
  // For post-close deals: status='approved' (no approval workflow needed)
  // For open deals: status='pending_review' (triggers approval workflow via trigger)
  const { data: interest, error: insertError } = await serviceSupabase
    .from('investor_deal_interest')
    .insert({
      deal_id: dealId,
      investor_id: resolvedInvestorId,
      indicative_amount,
      indicative_currency,
      notes,
      created_by: user.id,
      status: is_post_close ? 'approved' : 'pending_review',
      is_post_close: is_post_close ?? false,
      approved_at: is_post_close ? new Date().toISOString() : null
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

  // Track analytics event
  await trackDealEvent({
    supabase: serviceSupabase,
    dealId,
    investorId: resolvedInvestorId,
    eventType: is_post_close ? 'closed_deal_interest' : 'im_interested',
    payload: {
      interest_id: interest.id,
      indicative_amount,
      indicative_currency,
      notes,
      is_post_close
    }
  })

  // Send notification to investor
  if (ownerUserId) {
    try {
      await serviceSupabase.from('investor_notifications').insert({
        user_id: ownerUserId,
        investor_id: resolvedInvestorId,
        title: is_post_close ? 'Request received' : 'Interest received',
        message: is_post_close
          ? `We will notify you when similar opportunities to ${dealRecord?.name ?? 'this deal'} become available.`
          : `Thanks for sharing your interest in ${dealRecord?.name ?? 'this deal'}. The VERSO team will review and respond shortly.`,
        link: '/versoholdings/deals',
        metadata: {
          type: is_post_close ? 'closed_deal_interest' : 'deal_interest_submitted',
          deal_id: dealId,
          interest_id: interest.id
        }
      })
    } catch (notificationError) {
      console.error('Failed to create interest notification', notificationError)
    }
  }

  // Log audit event
  await auditLogger.log({
    actor_user_id: user.id,
    action: AuditActions.CREATE,
    entity: AuditEntities.DEALS,
    entity_id: interest.id,
    metadata: {
      type: is_post_close ? 'post_close_interest' : 'deal_interest',
      deal_id: dealId,
      investor_id: resolvedInvestorId,
      indicative_amount,
      indicative_currency,
      is_post_close
    }
  })

  return NextResponse.json({
    success: true,
    interest,
    message: 'Interest submitted successfully'
  })
}
