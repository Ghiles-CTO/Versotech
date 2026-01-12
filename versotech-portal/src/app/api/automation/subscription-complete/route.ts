import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'

const payloadSchema = z.object({
  deal_id: z.string().uuid(),
  investor_id: z.string().uuid(),
  subscription_id: z.string().uuid().optional(),
  approval_id: z.string().uuid().optional(),
  agreement_url: z.string().url().optional().nullable(),
  metadata: z.record(z.string(), z.any()).optional().default({}),
  allocation_amount: z.number().optional().nullable()
})

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const parsed = payloadSchema.safeParse(body ?? {})

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid payload', details: (parsed.error as any).errors },
      { status: 400 }
    )
  }

  const serviceSupabase = createServiceClient()
  const {
    deal_id,
    investor_id,
    subscription_id,
    approval_id,
    agreement_url,
    metadata,
    allocation_amount
  } = parsed.data

  let derivedAmount: number | null = allocation_amount ?? null
  let derivedCurrency: string | null = (metadata?.currency as string | undefined) ?? null

  if (!derivedAmount) {
    const metadataAmount = metadata?.amount ?? metadata?.payload?.amount
    if (typeof metadataAmount === 'number') {
      derivedAmount = metadataAmount
    } else if (typeof metadataAmount === 'string') {
      const parsedAmount = parseFloat(metadataAmount)
      derivedAmount = Number.isNaN(parsedAmount) ? null : parsedAmount
    }
  }

  if (!derivedCurrency) {
    const metadataCurrency = metadata?.payload?.currency
    if (typeof metadataCurrency === 'string') {
      derivedCurrency = metadataCurrency
    }
  }

  const eventInsert = await serviceSupabase
    .from('automation_webhook_events')
    .insert({
      event_type: 'subscription_complete',
      related_deal_id: deal_id,
      related_investor_id: investor_id,
      payload: {
        subscription_id,
        approval_id,
        agreement_url,
        metadata,
        allocation_amount
      }
    })
    .select('id')
    .single()

  if (eventInsert.error) {
    console.error('Failed to persist automation event:', eventInsert.error)
  }

  if (subscription_id) {
    const { error } = await serviceSupabase
      .from('deal_subscription_submissions')
      .update({
        status: 'approved',
        decided_at: new Date().toISOString(),
        decided_by: null
      })
      .eq('id', subscription_id)

    if (error) {
      console.error('Failed to update subscription submission status:', error)
    }

    if (!derivedAmount || !derivedCurrency) {
      const { data: submissionRow } = await serviceSupabase
        .from('deal_subscription_submissions')
        .select('payload_json')
        .eq('id', subscription_id)
        .maybeSingle()

      if (!derivedAmount) {
        const payloadAmount = submissionRow?.payload_json?.amount
        if (typeof payloadAmount === 'number') {
          derivedAmount = payloadAmount
        } else if (typeof payloadAmount === 'string') {
          const parsedAmount = parseFloat(payloadAmount)
          derivedAmount = Number.isNaN(parsedAmount) ? null : parsedAmount
        }
      }

      if (!derivedCurrency) {
        const payloadCurrency = submissionRow?.payload_json?.currency
        if (typeof payloadCurrency === 'string') {
          derivedCurrency = payloadCurrency
        }
      }
    }
  }

  try {
    const taskUpdate = serviceSupabase
      .from('tasks')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('owner_investor_id', investor_id)
      .eq('kind', 'investment_allocation_confirmation')

    if (subscription_id) {
      taskUpdate.eq('related_entity_id', subscription_id)
    }

    await taskUpdate

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
        kind: 'investment_funding_instructions',
        category: 'investment_setup',
        title: 'Prepare funding for allocation',
        description: 'Review funding instructions and ensure capital is ready for the allocation timeline.',
        priority: 'high',
        related_entity_type: 'deal',
        related_entity_id: deal_id,
        related_deal_id: deal_id,  // Direct deal reference for VERSOSign queries
        due_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        instructions: {
          type: 'funding_preparation',
          deal_id,
          expected_amount: allocation_amount ?? null,
          agreement_url: agreement_url ?? null
        }
      })

      try {
        await serviceSupabase.from('investor_notifications').insert({
          user_id: ownerUserId,
          investor_id,
          title: 'Subscription confirmed',
          message: `Your allocation for ${deal_id} has been confirmed. Review the funding instructions to proceed.`,
          link: `/versotech_main/opportunities/${deal_id}?tab=data-room`
        })
      } catch (notificationError) {
        console.error('Failed to create investor notification', notificationError)
      }
    }
  } catch (taskError) {
    console.error('Failed to update/create tasks for subscription completion', taskError)
  }

  try {
    if (!derivedCurrency) {
      const { data: dealRow } = await serviceSupabase
        .from('deals')
        .select('currency')
        .eq('id', deal_id)
        .maybeSingle()
      derivedCurrency = dealRow?.currency ?? 'USD'
    }

    if (derivedAmount) {
      const holdingStatus = allocation_amount ? 'funded' : 'pending_funding'
      const payload = {
        investor_id,
        deal_id,
        subscription_submission_id: subscription_id ?? null,
        approval_id: approval_id ?? null,
        status: holdingStatus,
        subscribed_amount: derivedAmount,
        currency: derivedCurrency ?? 'USD',
        effective_date: new Date().toISOString().slice(0, 10),
        funding_due_at: allocation_amount ? null : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        funded_at: allocation_amount ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      }

      await serviceSupabase
        .from('investor_deal_holdings')
        .upsert(payload, { onConflict: 'investor_id,deal_id' })
    }
  } catch (holdingError) {
    console.error('Failed to upsert investor deal holding', holdingError)
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

  try {
    await serviceSupabase.from('deal_activity_events').insert({
      deal_id,
      investor_id,
      event_type: 'subscription_completed',
      payload: {
        subscription_id,
        approval_id,
        agreement_url,
        allocation_amount: derivedAmount,
        currency: derivedCurrency
      }
    })
  } catch (eventError) {
    console.error('Failed to log subscription completion event', eventError)
  }

  await auditLogger.log({
    actor_user_id: undefined,
    action: AuditActions.UPDATE,
    entity: AuditEntities.DEALS,
    entity_id: deal_id,
    metadata: {
      type: 'automation_subscription_complete',
      investor_id,
      subscription_id,
      approval_id,
      agreement_url,
      allocation_amount,
      automation_event_id: eventInsert.data?.id ?? null
    }
  })

  return NextResponse.json({ success: true })
}
