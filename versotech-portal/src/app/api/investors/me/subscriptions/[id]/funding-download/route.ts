import { NextResponse } from 'next/server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { ensureFundingInstructionArtifacts } from '@/lib/funding-instructions/service'

const DEAL_DOCUMENTS_BUCKET = process.env.DEAL_DOCUMENTS_BUCKET || 'deal-documents'

function buildAttachmentDisposition(fileName: string) {
  const fallback = fileName.replace(/[^\w.\- ]+/g, '_')
  return `attachment; filename="${fallback}"; filename*=UTF-8''${encodeURIComponent(fileName)}`
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: subscriptionId } = await params
    const clientSupabase = await createClient()
    const { data: { user }, error: authError } = await clientSupabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

    if (!artifacts?.fundingDocument?.file_key || !artifacts.fundingDocument.name) {
      return NextResponse.json({
        error: 'Funding instructions are not available for this subscription yet.',
      }, { status: 409 })
    }

    const { data: pdfBlob, error: downloadError } = await serviceSupabase.storage
      .from(DEAL_DOCUMENTS_BUCKET)
      .download(artifacts.fundingDocument.file_key)

    if (downloadError || !pdfBlob) {
      return NextResponse.json({
        error: 'Failed to load funding instructions PDF.',
      }, { status: 500 })
    }

    const pdfBuffer = Buffer.from(await pdfBlob.arrayBuffer())

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': String(pdfBuffer.length),
        'Cache-Control': 'no-store',
        'Content-Disposition': buildAttachmentDisposition(artifacts.fundingDocument.name),
      },
    })
  } catch (error) {
    console.error('[funding-download] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
