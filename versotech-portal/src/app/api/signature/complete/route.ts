import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  // Get raw body for signature verification
  const rawBody = await request.text()

  // Verify webhook signature for security
  const receivedSignature = request.headers.get('x-signature-verification') ||
                           request.headers.get('x-dropbox-signature') ||
                           request.headers.get('x-docusign-signature-1')

  if (!receivedSignature) {
    console.error('⚠️ Webhook signature missing in headers')
    return NextResponse.json({ error: 'Unauthorized - no signature' }, { status: 401 })
  }

  // Calculate expected signature using HMAC-SHA256
  const webhookSecret = process.env.ESIGN_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('❌ ESIGN_WEBHOOK_SECRET not configured')
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex')

  // Compare signatures (constant-time comparison to prevent timing attacks)
  const signatureValid = crypto.timingSafeEqual(
    Buffer.from(receivedSignature),
    Buffer.from(expectedSignature)
  )

  if (!signatureValid) {
    console.error('❌ Invalid webhook signature')
    return NextResponse.json({ error: 'Unauthorized - invalid signature' }, { status: 401 })
  }

  // Parse the verified body
  const body = JSON.parse(rawBody)
  const { signature_request_id, workflow_run_id, document_type, status } = body

  console.log('✅ Signature webhook verified and received:', {
    signature_request_id,
    workflow_run_id,
    document_type,
    status
  })

  const supabase = createServiceClient()

  if (document_type === 'subscription') {
    // Check if BOTH signatures are complete
    const { data: signatures } = await supabase
      .from('signature_requests')
      .select('*')
      .eq('workflow_run_id', workflow_run_id)
      .order('created_at', { ascending: true })

    const allSigned = signatures?.every(sig => sig.status === 'signed')

    console.log('📊 Signature status check:', {
      total_signatures: signatures?.length,
      all_signed: allSigned
    })

    if (allSigned) {
      // Update document status to 'signed'
      await supabase
        .from('documents')
        .update({ status: 'signed' })
        .eq('id', workflow_run_id)

      console.log('✅ Document marked as signed:', workflow_run_id)

      // Update subscription status to 'committed'
      const { data: document } = await supabase
        .from('documents')
        .select('subscription_id')
        .eq('id', workflow_run_id)
        .single()

      if (document?.subscription_id) {
        await supabase
          .from('subscriptions')
          .update({
            status: 'committed',
            signed_doc_id: workflow_run_id,
            committed_at: new Date().toISOString()
          })
          .eq('id', document.subscription_id)

        console.log('✅ Subscription marked as committed:', document.subscription_id)
      }
    }
  }

  return NextResponse.json({ success: true })
}
