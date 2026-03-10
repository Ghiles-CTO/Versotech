import { NextRequest, NextResponse } from 'next/server'

import { auditLogger } from '@/lib/audit'
import { requireStaffActor } from '@/lib/home/api'
import { homeInterestPatchSchema } from '@/lib/home/validation'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const access = await requireStaffActor()

  if ('error' in access) {
    return NextResponse.json({ error: access.error }, { status: access.status })
  }

  const { serviceSupabase, user } = access
  const parsed = homeInterestPatchSchema.safeParse(await request.json().catch(() => ({})))

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  if (!Object.keys(parsed.data).length) {
    return NextResponse.json({ error: 'No changes provided' }, { status: 400 })
  }

  const { data, error } = await serviceSupabase
    .from('home_interest_submissions')
    .update(parsed.data)
    .eq('id', id)
    .select(`
      *,
      home_item:home_items(id, title, kind),
      investor:investors(id, legal_name),
      user_profile:profiles(id, email, display_name)
    `)
    .maybeSingle()

  if (error) {
    console.error('[admin/home/interests] Failed to update interest:', error)
    return NextResponse.json({ error: 'Failed to update home interest submission' }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: 'Home interest submission not found' }, { status: 404 })
  }

  await auditLogger.log({
    actor_user_id: user.id,
    action: 'update_home_interest_submission',
    entity: 'home_interest_submissions',
    entity_id: id,
    metadata: parsed.data,
  })

  return NextResponse.json({ interest: data })
}
