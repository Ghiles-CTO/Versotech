import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'

const payloadSchema = z.object({
  deal_id: z.string().uuid(),
  investor_id: z.string().uuid(),
  interest_id: z.string().uuid().optional(),
  approval_id: z.string().uuid().optional(),
  expires_at: z.string().datetime().optional().nullable(),
  document_url: z.string().url().optional().nullable(),
  metadata: z.record(z.any()).optional().default({})
})

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const parsed = payloadSchema.safeParse(body ?? {})

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid payload', details: parsed.error.errors },
      { status: 400 }
    )
  }

  const serviceSupabase = createServiceClient()
  const {
    deal_id,
    investor_id,
    interest_id,
    approval_id,
    expires_at,
    document_url,
    metadata
  } = parsed.data

  const eventInsert = await serviceSupabase
    .from('automation_webhook_events')
    .insert({
      event_type: 'nda_complete',
      related_deal_id: deal_id,
      related_investor_id: investor_id,
      payload: {
        interest_id,
        approval_id,
        expires_at,
        document_url,
        metadata
      }
    })
    .select('id')
    .single()

  if (eventInsert.error) {
    console.error('Failed to persist automation event:', eventInsert.error)
  }

  if (interest_id) {
    const { error } = await serviceSupabase
      .from('investor_deal_interest')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString()
      })
      .eq('id', interest_id)

    if (error) {
      console.error('Failed to update investor_deal_interest status:', error)
    }
  }

  if (approval_id) {
    const { error } = await serviceSupabase
      .from('approvals')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', approval_id)

    if (error) {
      console.error('Failed to update approval record:', error)
    }
  }

  const accessInsert = await serviceSupabase
    .from('deal_data_room_access')
    .upsert(
      {
        deal_id,
        investor_id,
        auto_granted: true,
        expires_at: expires_at ? new Date(expires_at).toISOString() : null,
        granted_by: null,
        granted_at: new Date().toISOString()
      },
      { onConflict: 'deal_id,investor_id' }
    )
    .select('id')
    .single()

  if (accessInsert.error) {
    console.error('Failed to upsert data room access:', accessInsert.error)
  }

  try {
    const taskUpdate = serviceSupabase
      .from('tasks')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('owner_investor_id', investor_id)
      .eq('kind', 'deal_nda_signature')

    if (interest_id) {
      taskUpdate.eq('related_entity_id', interest_id)
    } else {
      taskUpdate.eq('related_entity_type', 'deal_interest')
    }

    await taskUpdate

    const { data: existingAllocationTasks } = await serviceSupabase
      .from('tasks')
      .select('id')
      .eq('owner_investor_id', investor_id)
      .eq('kind', 'investment_allocation_confirmation')
      .eq('status', 'pending')
      .limit(1)

    if (!existingAllocationTasks?.length) {
      const { data: investorUsers } = await serviceSupabase
        .from('investor_users')
        .select('user_id')
        .eq('investor_id', investor_id)
        .order('created_at', { ascending: true })
        .limit(1)

      const ownerUserId = investorUsers?.[0]?.user_id ?? null

      if (ownerUserId) {
        await serviceSupabase.from('tasks').insert({
          owner_user_id: ownerUserId,
          owner_investor_id: investor_id,
          kind: 'investment_allocation_confirmation',
          category: 'investment_setup',
          title: 'Review subscription pack',
          description: 'Review the subscription documentation and submit your definitive allocation request.',
          priority: 'medium',
          related_entity_type: 'deal',
          related_entity_id: deal_id,
          due_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          instructions: {
            type: 'subscription_prepare',
            deal_id,
            expires_at: expires_at ?? null
          }
        })
      }
    }
  } catch (taskError) {
    console.error('Failed to update/create tasks for NDA completion', taskError)
  }

  try {
    await serviceSupabase.from('deal_activity_events').insert({
      deal_id,
      investor_id,
      event_type: 'nda_completed',
      payload: {
        interest_id,
        approval_id,
        expires_at,
        document_url
      }
    })
  } catch (eventError) {
    console.error('Failed to log NDA completion event', eventError)
  }

  await auditLogger.log({
    actor_user_id: null,
    action: AuditActions.UPDATE,
    entity: AuditEntities.DEALS,
    entity_id: deal_id,
    metadata: {
      type: 'automation_nda_complete',
      investor_id,
      interest_id,
      approval_id,
      expires_at,
      document_url,
      automation_event_id: eventInsert.data?.id ?? null
    }
  })

  return NextResponse.json({ success: true })
}
