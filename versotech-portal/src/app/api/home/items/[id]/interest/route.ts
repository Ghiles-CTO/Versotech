import { NextRequest, NextResponse } from 'next/server'

import { auditLogger } from '@/lib/audit'
import { requireInvestorActor } from '@/lib/home/api'
import { isHomeItemActive } from '@/lib/home/query'
import { homeInterestCreateSchema } from '@/lib/home/validation'
import { notifyHomeInterestRecipients } from '@/lib/home/notifications'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const access = await requireInvestorActor()

  if ('error' in access) {
    return NextResponse.json({ error: access.error }, { status: access.status })
  }

  const { serviceSupabase, user, investorId } = access
  const parsed = homeInterestCreateSchema.safeParse(await request.json().catch(() => ({})))

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { data: item, error: itemError } = await serviceSupabase
    .from('home_items')
    .select('id, title, kind, status, cta_action, starts_at, ends_at')
    .eq('id', id)
    .maybeSingle()

  if (itemError) {
    console.error('[home-interest] Failed to load item:', itemError)
    return NextResponse.json({ error: 'Failed to load home item' }, { status: 500 })
  }

  if (!item || item.status !== 'published' || item.cta_action !== 'interest_capture') {
    return NextResponse.json({ error: 'Home item is not available for interest capture' }, { status: 404 })
  }

  if (!isHomeItemActive(item as any)) {
    return NextResponse.json({ error: 'Home item is not currently active' }, { status: 409 })
  }

  const payload = {
    home_item_id: id,
    user_id: user.id,
    investor_id: investorId,
    note: parsed.data.note,
  }

  const insertResult = await serviceSupabase
    .from('home_interest_submissions')
    .insert(payload)
    .select('*')
    .single()

  let created = true
  let submission = insertResult.data

  if (insertResult.error) {
    if (insertResult.error.code === '23505') {
      created = false
      const { data: existingSubmission, error: existingError } = await serviceSupabase
        .from('home_interest_submissions')
        .select('*')
        .eq('home_item_id', id)
        .eq('user_id', user.id)
        .maybeSingle()

      if (existingError || !existingSubmission) {
        console.error('[home-interest] Failed to resolve existing submission:', existingError)
        return NextResponse.json({ error: 'Failed to load existing submission' }, { status: 500 })
      }

      submission = existingSubmission
    } else {
      console.error('[home-interest] Failed to create submission:', insertResult.error)
      return NextResponse.json({ error: 'Failed to capture interest' }, { status: 500 })
    }
  }

  if (created) {
    const { data: investor } = await serviceSupabase
      .from('investors')
      .select('legal_name')
      .eq('id', investorId)
      .maybeSingle()

    const investorName = investor?.legal_name || 'An investor'

    await notifyHomeInterestRecipients({
      actorUserId: user.id,
      investorId,
      investorName,
      itemId: item.id,
      itemKind: item.kind,
      itemTitle: item.title,
    })

    await auditLogger.log({
      actor_user_id: user.id,
      action: 'home_interest_submitted',
      entity: 'home_interest_submissions',
      entity_id: submission?.id,
      metadata: {
        home_item_id: item.id,
        home_item_kind: item.kind,
        investor_id: investorId,
      },
    })
  }

  return NextResponse.json({
    success: true,
    created,
    submission,
  })
}
