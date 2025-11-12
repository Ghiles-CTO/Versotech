import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  const { id: subscriptionId, documentId } = await params

  const clientSupabase = await createClient()
  const { data: { user }, error: authError } = await clientSupabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify staff access
  const { data: profile } = await clientSupabase
    .from('profiles')
    .select('role, display_name, email')
    .eq('id', user.id)
    .single()

  const isStaff = profile?.role?.startsWith('staff_')
  if (!isStaff) {
    return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
  }

  const serviceSupabase = createServiceClient()

  // Get document and subscription details
  const { data: document } = await serviceSupabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .eq('subscription_id', subscriptionId)
    .single()

  if (!document) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  const { data: subscription } = await serviceSupabase
    .from('subscriptions')
    .select('*, investor:investors(*)')
    .eq('id', subscriptionId)
    .single()

  if (!subscription) {
    return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
  }

  // Get signed URL for document
  const { data: urlData } = await serviceSupabase.storage
    .from('deal-documents')
    .createSignedUrl(document.file_key, 7 * 24 * 60 * 60) // 7 days

  if (!urlData?.signedUrl) {
    return NextResponse.json({ error: 'Failed to generate document URL' }, { status: 500 })
  }

  // Create TWO signature requests (investor + staff)
  try {
    // 1. Investor signature request
    const investorSigPayload = {
      workflow_run_id: documentId, // Use document ID as workflow reference
      investor_id: subscription.investor_id,
      signer_email: subscription.investor.email,
      signer_name: subscription.investor.legal_name || subscription.investor.display_name,
      document_type: 'subscription',
      google_drive_url: urlData.signedUrl, // Use Supabase signed URL
      signer_role: 'investor',
      signature_position: 'party_a'
    }

    const investorSigResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/signature/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(investorSigPayload)
    })

    if (!investorSigResponse.ok) {
      const errorText = await investorSigResponse.text()
      throw new Error(`Failed to create investor signature request: ${errorText}`)
    }

    const investorSigData = await investorSigResponse.json()

    // 2. Staff signature request
    const staffSigPayload = {
      workflow_run_id: documentId,
      investor_id: subscription.investor_id,
      signer_email: 'cto@versoholdings.com',
      signer_name: 'Julien Machot',
      document_type: 'subscription',
      google_drive_url: urlData.signedUrl,
      signer_role: 'admin',
      signature_position: 'party_b'
    }

    const staffSigResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/signature/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(staffSigPayload)
    })

    if (!staffSigResponse.ok) {
      const errorText = await staffSigResponse.text()
      throw new Error(`Failed to create staff signature request: ${errorText}`)
    }

    const staffSigData = await staffSigResponse.json()

    // Update document status
    await serviceSupabase
      .from('documents')
      .update({
        ready_for_signature: true,
        status: 'pending_signature',
        signature_workflow_run_id: documentId
      })
      .eq('id', documentId)

    console.log('✅ Dual signature requests created for subscription pack:', {
      document_id: documentId,
      investor_request: investorSigData.signature_request_id,
      staff_request: staffSigData.signature_request_id
    })

    return NextResponse.json({
      success: true,
      investor_signature_request: investorSigData,
      staff_signature_request: staffSigData
    })

  } catch (error) {
    console.error('Error creating signature requests:', error)
    return NextResponse.json({
      error: 'Failed to initiate signature workflow',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
