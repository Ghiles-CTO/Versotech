import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { signature_request_id, workflow_run_id, document_type, status } = body

  console.log('📝 Signature completion webhook received:', {
    signature_request_id,
    workflow_run_id,
    document_type,
    status
  })

  // TODO: Verify webhook signature (implementation depends on signature provider)

  const supabase = createServiceClient()

  if (document_type === 'subscription') {
    // Check if BOTH signatures are complete
    const { data: signatures } = await supabase
      .from('signature_requests')
      .select('*')
      .eq('workflow_run_id', workflow_run_id)

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
