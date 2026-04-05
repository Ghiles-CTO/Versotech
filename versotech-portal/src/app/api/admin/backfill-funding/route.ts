import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { ensureFundingInstructionArtifacts } from '@/lib/funding-instructions/service'

const BACKFILL_SECRET = 'ashish-funding-backfill-2026-04-05-v3'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-backfill-secret')
  if (secret !== BACKFILL_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const subscriptionId = 'f27292a8-682a-47a7-b324-a70dc4e59d8d'
  const supabase = createServiceClient()

  const { data: sub, error: subError } = await supabase
    .from('subscriptions')
    .select('id, status, funding_instruction_snapshot, funding_instruction_generated_at')
    .eq('id', subscriptionId)
    .single()

  if (subError || !sub) {
    return NextResponse.json({ error: 'Subscription not found', details: subError }, { status: 404 })
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
      wire_bank_name: result.snapshot.wire_bank_name,
      wire_iban: result.snapshot.wire_iban,
      wire_bic: result.snapshot.wire_bic,
      wire_account_holder: result.snapshot.wire_account_holder,
    },
    document_id: result.fundingDocument?.id || null,
    document_name: result.fundingDocument?.name || null,
  })
}
