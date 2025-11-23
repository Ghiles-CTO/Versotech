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

  // Validate that document is a PDF (signature system only works with PDFs)
  if (document.mime_type && !document.mime_type.includes('pdf')) {
    return NextResponse.json({
      error: 'Only PDF files can be sent for signature. Please convert the DOCX to PDF first and re-upload.',
      details: `Current file type: ${document.mime_type}`
    }, { status: 400 })
  }

  // Get subscription with investor details including user_id from join table
  const { data: subscription } = await serviceSupabase
    .from('subscriptions')
    .select(`
      *,
      investor:investors(
        id,
        legal_name,
        display_name,
        email,
        investor_users!inner(user_id)
      ),
      vehicle:vehicles(id, name)
    `)
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
    // Note: No workflow_run_id because this is a manually uploaded document, not n8n generated
    const investorSigPayload = {
      investor_id: subscription.investor_id,
      signer_email: subscription.investor.email,
      signer_name: subscription.investor.legal_name || subscription.investor.display_name,
      document_type: 'subscription',
      google_drive_url: urlData.signedUrl, // Use Supabase signed URL
      signer_role: 'investor',
      signature_position: 'party_a',
      subscription_id: subscriptionId, // Link to subscription instead of workflow
      document_id: documentId // Link to the actual document
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
      investor_id: subscription.investor_id,
      signer_email: 'cto@versoholdings.com',
      signer_name: 'Julien Machot',
      document_type: 'subscription',
      google_drive_url: urlData.signedUrl,
      signer_role: 'admin',
      signature_position: 'party_b',
      subscription_id: subscriptionId, // Link to subscription instead of workflow
      document_id: documentId // Link to the actual document
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
        status: 'pending_signature'
      })
      .eq('id', documentId)

    // Tasks are created automatically by createSignatureRequest() in signature/client.ts
    // No need for manual task creation here - it would create duplicates

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
