import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'

const payloadSchema = z.object({
  deal_id: z.string().uuid(),
  investor_id: z.string().uuid(),
  member_id: z.string().uuid().optional(), // Specific signatory who signed
  signature_request_id: z.string().uuid().optional(), // The signature request that was completed
  interest_id: z.string().uuid().optional(),
  approval_id: z.string().uuid().optional(),
  expires_at: z.string().datetime().optional().nullable(),
  document_url: z.string().url().optional().nullable(),
  metadata: z.record(z.string(), z.any()).optional().default({})
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
    member_id,
    signature_request_id,
    interest_id,
    approval_id,
    expires_at,
    document_url,
    metadata
  } = parsed.data

  // If member_id provided, record individual signatory signature
  if (member_id) {
    const { error: signatoryError } = await serviceSupabase
      .from('deal_signatory_ndas')
      .upsert({
        deal_id,
        investor_id,
        member_id,
        signed_at: new Date().toISOString(),
        signature_data: { document_url, metadata }
      }, { onConflict: 'deal_id,member_id' })

    if (signatoryError) {
      console.error('Failed to record signatory NDA:', signatoryError)
    }

    // Update signature request status if provided
    if (signature_request_id) {
      await serviceSupabase
        .from('signature_requests')
        .update({
          status: 'signed',
          signature_timestamp: new Date().toISOString()
        })
        .eq('id', signature_request_id)
    }
  }

  // Check if ALL signatories have now signed (entity-level check)
  const { data: signatoryStatus } = await serviceSupabase
    .rpc('check_all_signatories_signed', {
      p_deal_id: deal_id,
      p_investor_id: investor_id
    })

  const allSignatoriesSigned = signatoryStatus?.[0]?.all_signed ?? false
  const totalSignatories = signatoryStatus?.[0]?.total_signatories ?? 0
  const signedCount = signatoryStatus?.[0]?.signed_count ?? 0

  // If there are signatories and not all have signed, don't grant data room yet
  if (totalSignatories > 0 && !allSignatoriesSigned) {
    console.log(`NDA: ${signedCount}/${totalSignatories} signatories signed for investor ${investor_id} on deal ${deal_id}`)

    // Log partial completion but don't grant access yet
    await serviceSupabase.from('deal_activity_events').insert({
      deal_id,
      investor_id,
      event_type: 'nda_signatory_signed',
      payload: {
        member_id,
        signed_count: signedCount,
        total_signatories: totalSignatories,
        pending: signatoryStatus?.[0]?.pending_signatories
      }
    })

    return NextResponse.json({
      success: true,
      partial: true,
      message: `Signatory NDA recorded. ${signedCount}/${totalSignatories} signatories have signed.`,
      pending_signatories: signatoryStatus?.[0]?.pending_signatories
    })
  }

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
        granted_at: new Date().toISOString(),
        revoked_at: null,
        revoked_by: null
      },
      { onConflict: 'deal_id,investor_id' }
    )
    .select('id')
    .single()

  if (accessInsert.error) {
    console.error('Failed to upsert data room access:', accessInsert.error)
  }

  let ownerUserId: string | null = null
  try {
    const { data: investorUsers } = await serviceSupabase
      .from('investor_users')
      .select('user_id')
      .eq('investor_id', investor_id)
      .order('created_at', { ascending: true })
      .limit(1)

    ownerUserId = investorUsers?.[0]?.user_id ?? null
  } catch (lookupError) {
    console.error('Failed to resolve investor user for NDA completion', lookupError)
  }

  try {
    await serviceSupabase
      .from('deal_data_room_documents')
      .update({
        visible_to_investors: true,
        updated_at: new Date().toISOString()
      })
      .eq('deal_id', deal_id)
      .eq('visible_to_investors', false)
  } catch (docError) {
    console.error('Failed to reset document visibility for deal', docError)
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

  if (ownerUserId) {
    try {
      const { data: dealRecord } = await serviceSupabase
        .from('deals')
        .select('name')
        .eq('id', deal_id)
        .maybeSingle()

      const dealName = dealRecord?.name ?? 'the deal'

      await serviceSupabase.from('investor_notifications').insert({
        user_id: ownerUserId,
        investor_id,
        title: 'Data room unlocked',
        message: `Your NDA for ${dealName} is complete. The data room is now available for review.`,
        link: '/versoholdings/data-rooms',
        metadata: {
          type: 'nda_complete',
          deal_id,
          access_id: accessInsert.data?.id ?? null
        }
      })
    } catch (notificationError) {
      console.error('Failed to create NDA completion notification', notificationError)
    }
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
    actor_user_id: undefined,
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
