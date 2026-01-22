import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { marked } from 'marked'
// NOTE: syncTermSheetToFeePlan is deprecated and no longer called.
// Fee models must be manually created and linked to term sheets.
// See: FEE_SYSTEM_ANALYSIS_AND_REFACTORING_PLAN.md

const termSheetFieldsSchema = z.object({
  term_sheet_date: z.string().optional().nullable(),
  transaction_type: z.string().max(255).optional().nullable(),
  opportunity_summary: z.string().optional().nullable(),
  issuer: z.string().optional().nullable(),
  vehicle: z.string().optional().nullable(),
  exclusive_arranger: z.string().optional().nullable(),
  purchaser: z.string().optional().nullable(),
  seller: z.string().optional().nullable(),
  structure: z.string().optional().nullable(),
  allocation_up_to: z.number().nullable().optional(),
  price_per_share_text: z.string().optional().nullable(),
  price_per_share: z.number().nullable().optional(),
  cost_per_share: z.number().nullable().optional(),
  minimum_ticket: z.number().nullable().optional(),
  maximum_ticket: z.number().nullable().optional(),
  subscription_fee_percent: z.number().nullable().optional(),
  management_fee_percent: z.number().nullable().optional(),
  carried_interest_percent: z.number().nullable().optional(),
  legal_counsel: z.string().optional().nullable(),
  interest_confirmation_deadline: z.string().optional().nullable(),
  capital_call_timeline: z.string().optional().nullable(),
  completion_date_text: z.string().optional().nullable(),
  completion_date: z.string().optional().nullable(),
  in_principle_approval_text: z.string().optional().nullable(),
  subscription_pack_note: z.string().optional().nullable(),
  share_certificates_note: z.string().optional().nullable(),
  subject_to_change_note: z.string().optional().nullable(),
  validity_date: z.string().optional().nullable(),
  term_sheet_html: z.string().optional().nullable(),
  term_sheet_attachment_key: z.string().optional().nullable()
})

const createTermSheetSchema = termSheetFieldsSchema.extend({
  effective_at: z.string().optional().nullable()
})

const updateTermSheetSchema = z.object({
  structure_id: z.string().uuid(),
  updates: termSheetFieldsSchema.extend({
    effective_at: z.string().optional().nullable(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
    version: z.number().int().positive().optional()
  })
})

function toNullable<T>(value: T | undefined | null) {
  return value ?? null
}

function parseDate(value: string | null | undefined) {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
}

function renderMarkdown(value: string | null | undefined) {
  if (!value) return null
  return marked.parse(value)
}

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

  if (!profile || !(profile.role.startsWith('staff_') || profile.role === 'ceo')) {
    return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
  }

  const statusFilter = request.nextUrl.searchParams.get('status')

  const query = serviceSupabase
    .from('deal_fee_structures')
    .select('*')
    .eq('deal_id', dealId)
    .order('created_at', { ascending: false })

  if (statusFilter) {
    query.eq('status', statusFilter)
  }

  const { data, error } = await query
  if (error) {
    console.error('Failed to fetch term sheets:', error)
    return NextResponse.json({ error: 'Failed to fetch term sheets' }, { status: 500 })
  }

  return NextResponse.json({ term_sheets: data ?? [] })
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

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !(profile.role.startsWith('staff_') || profile.role === 'ceo')) {
    return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
  }

  const body = await request.json().catch(() => ({}))
  const payload = createTermSheetSchema.safeParse(body)

  if (!payload.success) {
    return NextResponse.json(
      { error: 'Invalid request data', details: (payload.error as any).errors },
      { status: 400 }
    )
  }

  const {
    effective_at,
    term_sheet_html: _ignoredHtml,
    ...fields
  } = payload.data

  const { data: existing } = await serviceSupabase
    .from('deal_fee_structures')
    .select('version')
    .eq('deal_id', dealId)
    .order('version', { ascending: false })
    .limit(1)

  const nextVersion = (existing?.[0]?.version ?? 0) + 1

  const normalizedFields = Object.fromEntries(
    Object.entries(fields).map(([key, value]) => {
      if (['allocation_up_to', 'minimum_ticket', 'maximum_ticket', 'price_per_share', 'cost_per_share'].includes(key)) {
        return [key, typeof value === 'number' ? value : null]
      }
      if (['subscription_fee_percent', 'management_fee_percent', 'carried_interest_percent'].includes(key)) {
        return [key, typeof value === 'number' ? value : null]
      }
      if (['term_sheet_date', 'interest_confirmation_deadline', 'validity_date', 'completion_date'].includes(key)) {
        return [key, parseDate(value as string | null | undefined)]
      }
      return [key, toNullable(value)]
    })
  )

  const insertPayload = {
    deal_id: dealId,
    status: 'draft' as const,
    version: nextVersion,
    created_by: user.id,
    effective_at: parseDate(effective_at),
    ...normalizedFields,
    term_sheet_html: renderMarkdown(fields.opportunity_summary)
  }

  const { data, error } = await serviceSupabase
    .from('deal_fee_structures')
    .insert(insertPayload)
    .select('*')
    .single()

  if (error) {
    console.error('Failed to create term sheet:', error)
    return NextResponse.json({ error: 'Failed to create term sheet' }, { status: 500 })
  }

  await auditLogger.log({
    actor_user_id: user.id,
    action: AuditActions.CREATE,
    entity: AuditEntities.DEALS,
    entity_id: dealId,
    metadata: {
      type: 'deal_fee_structure',
      term_sheet_id: data.id,
      version: data.version,
      status: data.status
    }
  })

  // NOTE: Auto-sync to fee plan has been removed.
  // Fee models must be manually created by staff and linked to term sheets.
  // See: FEE_SYSTEM_ANALYSIS_AND_REFACTORING_PLAN.md

  return NextResponse.json({ term_sheet: data })
}

export async function PATCH(
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

  if (!profile || !(profile.role.startsWith('staff_') || profile.role === 'ceo')) {
    return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
  }

  const body = await request.json().catch(() => ({}))
  const parsed = updateTermSheetSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request data', details: (parsed.error as any).errors },
      { status: 400 }
    )
  }

  const { structure_id, updates } = parsed.data

  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString()
  }

  if (updates.status) {
    updatePayload.status = updates.status
    if (updates.status === 'published') {
      updatePayload.published_at = new Date().toISOString()
      updatePayload.archived_at = null
      updatePayload.effective_at = parseDate(updates.effective_at) ?? new Date().toISOString()
    } else if (updates.status === 'archived') {
      updatePayload.archived_at = new Date().toISOString()
    } else if (updates.status === 'draft') {
      updatePayload.published_at = null
      updatePayload.archived_at = null
    }
  }

  if (updates.version) {
    updatePayload.version = updates.version
  }

  Object.entries(updates).forEach(([key, value]) => {
    if (['status', 'version', 'effective_at', 'term_sheet_html'].includes(key)) {
      return
    }
    if (['term_sheet_date', 'interest_confirmation_deadline', 'validity_date', 'completion_date'].includes(key)) {
      updatePayload[key] = parseDate(value as string | null | undefined)
      return
    }
    if (['allocation_up_to', 'minimum_ticket', 'maximum_ticket', 'price_per_share', 'cost_per_share'].includes(key)) {
      updatePayload[key] = typeof value === 'number' ? value : null
      return
    }
    if (['subscription_fee_percent', 'management_fee_percent', 'carried_interest_percent'].includes(key)) {
      updatePayload[key] = typeof value === 'number' ? value : null
      return
    }
    updatePayload[key] = toNullable(value)
  })

  if (Object.prototype.hasOwnProperty.call(updates, 'opportunity_summary')) {
    updatePayload.term_sheet_html = renderMarkdown(updates.opportunity_summary)
  }

  const { data, error } = await serviceSupabase
    .from('deal_fee_structures')
    .update(updatePayload)
    .eq('id', structure_id)
    .eq('deal_id', dealId)
    .select('*')
    .single()

  if (error) {
    console.error('Failed to update term sheet:', error)
    return NextResponse.json({ error: 'Failed to update term sheet' }, { status: 500 })
  }

  await auditLogger.log({
    actor_user_id: user.id,
    action: AuditActions.UPDATE,
    entity: AuditEntities.DEALS,
    entity_id: dealId,
    metadata: {
      type: 'deal_fee_structure',
      term_sheet_id: structure_id,
      status: data.status,
      version: data.version
    }
  })

  // NOTE: Auto-sync to fee plan has been removed.
  // Fee models must be manually created by staff and linked to term sheets.
  // See: FEE_SYSTEM_ANALYSIS_AND_REFACTORING_PLAN.md

  return NextResponse.json({ term_sheet: data })
}
