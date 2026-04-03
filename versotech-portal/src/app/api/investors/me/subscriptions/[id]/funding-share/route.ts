import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import {
  ensureFundingInstructionArtifacts,
  sendFundingInstructionEmail,
} from '@/lib/funding-instructions/service'

const shareFundingSchema = z.object({
  recipientEmail: z.string().email('Enter a valid email address'),
})

const DEAL_DOCUMENTS_BUCKET = process.env.DEAL_DOCUMENTS_BUCKET || 'deal-documents'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: subscriptionId } = await params
    const clientSupabase = await createClient()
    const { data: { user }, error: authError } = await clientSupabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => null)
    const parsed = shareFundingSchema.safeParse(body ?? {})

    if (!parsed.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: parsed.error.issues,
      }, { status: 400 })
    }

    const serviceSupabase = createServiceClient()
    const { data: subscription } = await serviceSupabase
      .from('subscriptions')
      .select('id, investor_id')
      .eq('id', subscriptionId)
      .maybeSingle()

    if (!subscription?.investor_id) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    const { data: investorLink } = await serviceSupabase
      .from('investor_users')
      .select('user_id')
      .eq('investor_id', subscription.investor_id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (!investorLink) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const artifacts = await ensureFundingInstructionArtifacts({
      supabase: serviceSupabase,
      subscriptionId,
      sendInvestorNotifications: false,
      sendAutomaticEmail: false,
    })

    if (!artifacts?.snapshot || !artifacts.fundingDocument?.file_key) {
      return NextResponse.json({
        error: 'Funding instructions are not available for this subscription yet.',
      }, { status: 409 })
    }

    const { data: pdfBlob, error: downloadError } = await serviceSupabase.storage
      .from(DEAL_DOCUMENTS_BUCKET)
      .download(artifacts.fundingDocument.file_key)

    if (downloadError || !pdfBlob) {
      return NextResponse.json({
        error: 'Failed to load funding instructions attachment.',
      }, { status: 500 })
    }

    const emailResult = await sendFundingInstructionEmail({
      to: parsed.data.recipientEmail,
      recipientName: 'there',
      snapshot: artifacts.snapshot,
      pdfBuffer: Buffer.from(await pdfBlob.arrayBuffer()),
      subjectPrefix: `Funding instructions shared for ${artifacts.snapshot.vehicle_name || artifacts.snapshot.deal_name || 'your investment'}`,
      introLine: `Attached are the funding instructions shared from the VERSO portal for ${artifacts.snapshot.vehicle_name || artifacts.snapshot.deal_name || 'the investment'}.`,
    })

    if (!emailResult.success) {
      return NextResponse.json({
        error: emailResult.error || 'Failed to send funding instructions email.',
      }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[funding-share] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
