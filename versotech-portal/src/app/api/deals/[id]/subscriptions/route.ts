import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { trackDealEvent } from '@/lib/analytics'

const submissionSchema = z.object({
  investor_id: z.string().uuid().optional(),
  payload: z.record(z.string(), z.any()).optional().default({}),
  notes: z.string().max(4000).optional().nullable(),
  subscription_type: z.enum(['personal', 'entity']).optional(),
  counterparty_entity_id: z.string().uuid().optional().nullable()
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

  const { investor_id, payload, notes, subscription_type, counterparty_entity_id } = parsed.data

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

  // Check if investor has data room access (granted via NDA signature)
  const { data: dataRoomAccess } = await serviceSupabase
    .from('deal_data_room_access')
    .select('id, expires_at, revoked_at')
    .eq('deal_id', dealId)
    .eq('investor_id', resolvedInvestorId)
    .is('revoked_at', null)
    .maybeSingle()

  if (!dataRoomAccess && !isStaff) {
    return NextResponse.json(
      { error: 'You must have active data room access to submit a subscription' },
      { status: 403 }
    )
  }

  // Check if access has expired
  if (dataRoomAccess && dataRoomAccess.expires_at) {
    const expiryDate = new Date(dataRoomAccess.expires_at)
    if (expiryDate < new Date() && !isStaff) {
      return NextResponse.json(
        { error: 'Your data room access has expired. Please request an extension.' },
        { status: 403 }
      )
    }
  }

  // Auto-cancel any existing pending submissions before creating new one
  // This prevents duplicate pending submissions and maintains clean workflow state
  await serviceSupabase
    .from('deal_subscription_submissions')
    .update({ status: 'cancelled' })
    .eq('deal_id', dealId)
    .eq('investor_id', resolvedInvestorId)
    .eq('status', 'pending_review')

  const { data: submission, error: insertError } = await serviceSupabase
    .from('deal_subscription_submissions')
    .insert({
      deal_id: dealId,
      investor_id: resolvedInvestorId,
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

  // NOTE: Approval is automatically created by database trigger 'create_deal_subscription_approval'
  // when status = 'pending_review'. See migration 20251102093000_deal_workflow_phase1_finish.sql

  return NextResponse.json({
    success: true,
    submission
  })
}
