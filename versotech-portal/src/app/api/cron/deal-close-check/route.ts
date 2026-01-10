/**
 * Termsheet Close Approval Check Cron Job
 *
 * GET /api/cron/deal-close-check
 *
 * Daily cron job to request CEO approval when TERMSHEETS reach their completion date.
 * - Creates a termsheet_close approval assigned to CEO for EACH termsheet
 * - Does NOT execute closing actions directly
 *
 * Closing actions (certificates, commissions) run only after CEO approves.
 * Only subscriptions linked to the approved termsheet are processed.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getCeoSigner } from '@/lib/staff/ceo-signer'

export const dynamic = 'force-dynamic'

type TermsheetCloseApprovalResult = {
  termsheetId: string
  dealId: string
  dealName: string
  approvalId?: string
  created: boolean
  skippedReason?: string
}

const STAFF_ROLES = ['ceo', 'staff_admin', 'staff_ops', 'staff_rm']

async function getFallbackRequesterId(supabase: ReturnType<typeof createServiceClient>) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .in('role', STAFF_ROLES)
    .order('role', { ascending: true })
    .limit(1)
    .maybeSingle()

  return profile?.id || null
}

interface TermsheetWithDeal {
  id: string
  deal_id: string
  version: number
  status: string
  completion_date: string
  closed_processed_at: string | null
  subscription_fee_percent: number | null
  deal: {
    id: string
    name: string
    company_name: string | null
    status: string
    currency: string | null
    vehicle_id: string | null
  }[] | {
    id: string
    name: string
    company_name: string | null
    status: string
    currency: string | null
    vehicle_id: string | null
  } | null
}

async function buildTermsheetCloseMetadata(
  supabase: ReturnType<typeof createServiceClient>,
  termsheet: TermsheetWithDeal
) {
  const dealId = termsheet.deal_id
  // Normalize deal (Supabase may return array or single object)
  const deal = Array.isArray(termsheet.deal) ? termsheet.deal[0] : termsheet.deal

  // Get funded subscriptions linked to this termsheet via deal_memberships
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
    }
  }
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET || process.env.VERCEL_CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const now = new Date()
  const results: TermsheetCloseApprovalResult[] = []
  let totalTermsheetsChecked = 0
  let approvalsCreated = 0

  try {
    // Query TERMSHEETS with completion_date reached, not yet processed
    const { data: termsheets, error: queryError } = await supabase
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
      .eq('status', 'published')
      .not('completion_date', 'is', null)
      .is('closed_processed_at', null)
      .lte('completion_date', now.toISOString())

    if (queryError) {
      console.error('[termsheet-close-cron] Failed to query termsheets:', queryError)
      return NextResponse.json(
        { error: 'Failed to query termsheets', details: queryError },
        { status: 500 }
      )
    }

    if (!termsheets || termsheets.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No termsheets ready for close approvals',
        termsheetsChecked: 0,
        approvalsCreated: 0
      })
    }

    totalTermsheetsChecked = termsheets.length
    const ceoSigner = await getCeoSigner(supabase)
    const fallbackRequesterId = ceoSigner?.id || await getFallbackRequesterId(supabase)

    for (const termsheet of termsheets as unknown as TermsheetWithDeal[]) {
      // Normalize deal (Supabase may return array or single object)
      const deal = Array.isArray((termsheet as any).deal) ? (termsheet as any).deal[0] : termsheet.deal

      // Skip if deal is not in appropriate status
      // Valid statuses from deal_status_enum: draft, open, allocation_pending, closed, cancelled
      // We process: open (active deal), allocation_pending (finalizing), closed (already closed but termsheet not processed)
      const dealStatus = deal?.status
      if (!dealStatus || !['open', 'allocation_pending', 'closed'].includes(dealStatus)) {
        results.push({
          termsheetId: termsheet.id,
          dealId: termsheet.deal_id,
          dealName: deal?.name || 'Unknown',
          created: false,
          skippedReason: `Deal status not ready: ${dealStatus}`
        })
        continue
      }

      // Check for existing approval for THIS termsheet
      const { data: existingApproval } = await supabase
        .from('approvals')
        .select('id, status')
        .eq('entity_type', 'termsheet_close')
        .eq('entity_id', termsheet.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (existingApproval && ['pending', 'approved', 'rejected'].includes(existingApproval.status)) {
        results.push({
          termsheetId: termsheet.id,
          dealId: termsheet.deal_id,
          dealName: deal?.name || 'Unknown',
          created: false,
          skippedReason: `Existing approval: ${existingApproval.status}`
        })
        continue
      }

      const metadata = await buildTermsheetCloseMetadata(supabase, termsheet)

      // Create approval for THIS termsheet
      const { data: approval, error: approvalError } = await supabase
        .from('approvals')
        .insert({
          entity_type: 'termsheet_close',
          entity_id: termsheet.id, // Termsheet ID, not deal ID
          action: 'approve',
          status: 'pending',
          priority: 'high',
          requested_by: fallbackRequesterId,
          assigned_to: ceoSigner?.id || null,
          related_deal_id: termsheet.deal_id,
          request_reason: `Termsheet completion date reached (${deal?.name} v${termsheet.version}); CEO approval required.`,
          entity_metadata: metadata
        })
        .select('id')
        .single()

      if (approvalError) {
        console.error('[termsheet-close-cron] Failed to create approval:', approvalError)
        results.push({
          termsheetId: termsheet.id,
          dealId: termsheet.deal_id,
          dealName: deal?.name || 'Unknown',
          created: false,
          skippedReason: 'Approval creation failed'
        })
        continue
      }

      approvalsCreated++
      results.push({
        termsheetId: termsheet.id,
        dealId: termsheet.deal_id,
        dealName: deal?.name || 'Unknown',
        approvalId: approval.id,
        created: true
      })
    }

    await supabase.from('audit_logs').insert({
      event_type: 'system',
      action: 'termsheet_close_approval_check_cron',
      action_details: {
        termsheets_checked: totalTermsheetsChecked,
        approvals_created: approvalsCreated,
        errors: results.filter(r => r.created === false && r.skippedReason === 'Approval creation failed').length
      },
      timestamp: now.toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: `Created ${approvalsCreated} termsheet close approvals`,
      termsheetsChecked: totalTermsheetsChecked,
      approvalsCreated,
      results
    })
  } catch (error) {
    console.error('[termsheet-close-cron] Unexpected error:', error)
    return NextResponse.json(
      {
        error: 'Unexpected error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
