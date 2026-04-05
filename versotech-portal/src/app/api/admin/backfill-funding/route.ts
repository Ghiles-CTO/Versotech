import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { ensureFundingInstructionArtifacts } from '@/lib/funding-instructions/service'

const BACKFILL_SECRET = 'ashish-funding-backfill-2026-04-05'

/**
 * One-off backfill endpoint for Ashish's subscription funding instructions.
 * DELETE THIS ROUTE after use.
 *
 * Usage: POST /api/admin/backfill-funding
 *        Header: x-backfill-secret: ashish-funding-backfill-2026-04-05
 */
export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-backfill-secret')
  if (secret !== BACKFILL_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const subscriptionId = 'f27292a8-682a-47a7-b324-a70dc4e59d8d'
  const supabase = createServiceClient()

  // Verify state before backfill
  const { data: sub, error: subError } = await supabase
    .from('subscriptions')
    .select('id, status, commitment, currency, funding_instruction_snapshot, funding_instruction_generated_at')
    .eq('id', subscriptionId)
    .single()

  if (subError || !sub) {
    return NextResponse.json({ error: 'Subscription not found', details: subError }, { status: 404 })
  }

  if (sub.status !== 'committed') {
    return NextResponse.json({ error: `Unexpected status: ${sub.status}` }, { status: 400 })
  }

  if (sub.funding_instruction_snapshot != null) {
    return NextResponse.json({ message: 'Already has funding snapshot — nothing to do' })
  }

  const result = await ensureFundingInstructionArtifacts({
    supabase: supabase as any,
    subscriptionId,
    sendInvestorNotifications: true,
    sendAutomaticEmail: true,
  })

  if (!result) {
    return NextResponse.json({ error: 'ensureFundingInstructionArtifacts returned null' }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    snapshot: {
      currency: result.snapshot.currency,
      gross_amount: result.snapshot.gross_amount,
      due_at: result.snapshot.due_at,
    },
    document_id: result.fundingDocument?.id || null,
    opportunity_link: result.opportunityLink,
  })
}
