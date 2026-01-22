/**
 * Manual Termsheet Close Request
 *
 * POST /api/deals/[id]/fee-structures/[structureId]/request-close
 *
 * Manually triggers CEO approval for termsheet closing.
 * Can be used before or after the completion date.
 * Only works for published termsheets.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getCeoSigner } from '@/lib/staff/ceo-signer'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; structureId: string }> }
) {
  const { id: dealId, structureId: termsheetId } = await params
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify user has staff access
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', user.id)
    .single()

  const staffRoles = ['ceo', 'staff_admin', 'staff_ops', 'staff_rm']
  if (!profile || !staffRoles.includes(profile.role)) {
    return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
  }

  // Use service client for the rest (needs to bypass RLS for some queries)
  const serviceClient = createServiceClient()

  // Fetch the termsheet with deal info
  const { data: termsheet, error: termsheetError } = await serviceClient
    .from('deal_fee_structures')
    .select(`
      id,
      deal_id,
      version,
      status,
      completion_date,
      closed_processed_at,
      subscription_fee_percent,
      deal:deals!deal_fee_structures_deal_id_fkey (
        id,
        name,
        company_name,
        status,
        currency,
        vehicle_id
      )
    `)
    .eq('id', termsheetId)
    .eq('deal_id', dealId)
    .single()

  if (termsheetError || !termsheet) {
    return NextResponse.json({ error: 'Termsheet not found' }, { status: 404 })
  }

  // Must be published
  if (termsheet.status !== 'published') {
    return NextResponse.json(
      { error: 'Only published termsheets can be closed' },
      { status: 400 }
    )
  }

  // Check if already processed
  if (termsheet.closed_processed_at) {
    return NextResponse.json(
      { error: 'Termsheet has already been processed for closing' },
      { status: 400 }
    )
  }

  // Normalize deal (Supabase may return array or single object)
  const deal = Array.isArray(termsheet.deal) ? termsheet.deal[0] : termsheet.deal

  // Check deal status
  if (!deal || !['open', 'allocation_pending', 'closed'].includes(deal.status)) {
    return NextResponse.json(
      { error: `Deal status must be open, allocation_pending, or closed. Current: ${deal?.status}` },
      { status: 400 }
    )
  }

  // Check for existing pending/approved approval
  const { data: existingApproval } = await serviceClient
    .from('approvals')
    .select('id, status')
    .eq('entity_type', 'termsheet_close')
    .eq('entity_id', termsheetId)
    .in('status', ['pending', 'approved'])
    .maybeSingle()

  if (existingApproval) {
    return NextResponse.json(
      {
        error: `Approval already exists with status: ${existingApproval.status}`,
        existingApprovalId: existingApproval.id
      },
      { status: 409 }
    )
  }

  // Build metadata for the approval
  const metadata = await buildTermsheetCloseMetadata(serviceClient, termsheet, deal)

  // Get CEO signer
  const ceoSigner = await getCeoSigner(serviceClient)

  // Create the approval
  const { data: approval, error: approvalError } = await serviceClient
    .from('approvals')
    .insert({
      entity_type: 'termsheet_close',
      entity_id: termsheetId,
      action: 'approve',
      status: 'pending',
      priority: 'high',
      requested_by: user.id,
      assigned_to: ceoSigner?.id || null,
      related_deal_id: dealId,
      request_reason: `Manual close request for ${deal.name} v${termsheet.version}; CEO approval required.`,
      entity_metadata: metadata
    })
    .select('id')
    .single()

  if (approvalError) {
    console.error('[request-close] Failed to create approval:', approvalError)
    return NextResponse.json(
      { error: 'Failed to create approval' },
      { status: 500 }
    )
  }

  // Audit log
  await serviceClient.from('audit_logs').insert({
    user_id: user.id,
    event_type: 'approval',
    action: 'termsheet_close_requested',
    entity_type: 'deal_fee_structure',
    entity_id: termsheetId,
    action_details: {
      deal_id: dealId,
      deal_name: deal.name,
      termsheet_version: termsheet.version,
      approval_id: approval.id,
      triggered_by: 'manual'
    },
    timestamp: new Date().toISOString()
  })

  return NextResponse.json({
    success: true,
    approvalId: approval.id,
    message: `Close approval created for ${deal.name} v${termsheet.version}`
  })
}

// Build metadata for approval (similar to cron job)
async function buildTermsheetCloseMetadata(
  supabase: ReturnType<typeof createServiceClient>,
  termsheet: any,
  deal: any
) {
  const dealId = termsheet.deal_id

  // Get funded subscriptions linked to this termsheet
  const { data: fundedSubs } = await supabase
    .from('subscriptions')
    .select(`
      id,
      funded_amount,
      investor_id,
      deal_memberships!inner (
        term_sheet_id
      )
    `)
    .eq('deal_id', dealId)
    .eq('status', 'funded')
    .eq('deal_memberships.term_sheet_id', termsheet.id)

  const fundedCount = fundedSubs?.length || 0
  const fundedTotal = (fundedSubs || []).reduce(
    (sum, sub) => sum + (Number(sub.funded_amount) || 0),
    0
  )

  // Get fee plans linked to this termsheet
  const { data: feePlans } = await supabase
    .from('fee_plans')
    .select('status, partner_id, introducer_id, commercial_partner_id')
    .eq('deal_id', dealId)
    .eq('term_sheet_id', termsheet.id)
    .eq('is_active', true)

  const feePlanStatusCounts = (feePlans || []).reduce<Record<string, number>>(
    (acc, plan) => {
      const key = plan.status || 'draft'
      acc[key] = (acc[key] || 0) + 1
      return acc
    },
    {}
  )

  const partnerIds = new Set((feePlans || []).map(fp => fp.partner_id).filter(Boolean))
  const introducerIds = new Set((feePlans || []).map(fp => fp.introducer_id).filter(Boolean))
  const commercialPartnerIds = new Set((feePlans || []).map(fp => fp.commercial_partner_id).filter(Boolean))

  return {
    termsheet_id: termsheet.id,
    termsheet_version: termsheet.version,
    completion_date: termsheet.completion_date,
    deal_id: dealId,
    deal_name: deal?.name || 'Unknown Deal',
    company_name: deal?.company_name || null,
    deal_status: deal?.status || null,
    currency: deal?.currency || null,
    funded_subscriptions_count: fundedCount,
    funded_amount_total: fundedTotal,
    fee_plan_counts: {
      total: feePlans?.length || 0,
      by_status: feePlanStatusCounts,
      partners: partnerIds.size,
      introducers: introducerIds.size,
      commercial_partners: commercialPartnerIds.size
    },
    triggered_by: 'manual'
  }
}
