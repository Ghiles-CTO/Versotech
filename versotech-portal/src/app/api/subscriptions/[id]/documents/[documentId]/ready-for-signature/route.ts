import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Schema for multi-signatory support with optional arranger countersigning
const requestSchema = z.object({
  signatory_member_ids: z.array(z.string().uuid()).optional(),
  // If no signatory_member_ids provided, falls back to investor email (backwards compatible)
  countersigner_type: z.enum(['ceo', 'arranger']).optional().default('ceo'),
  arranger_id: z.string().uuid().optional(),
  // arranger_id is required when countersigner_type is 'arranger'
}).optional()

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

  const isStaff = profile?.role?.startsWith('staff_') || profile?.role === 'ceo'
  if (!isStaff) {
    return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
  }

  // Parse request body for signatory selection
  let body: { signatory_member_ids?: string[]; countersigner_type?: 'ceo' | 'arranger'; arranger_id?: string } = {}
  try {
    const rawBody = await request.text()
    if (rawBody) {
      body = JSON.parse(rawBody)
      const validation = requestSchema.safeParse(body)
      if (!validation.success) {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
      }
    }
  } catch {
    // Empty body is OK - use default behavior
  }

  // Validate arranger_id is provided when countersigner_type is 'arranger'
  if (body.countersigner_type === 'arranger' && !body.arranger_id) {
    return NextResponse.json({
      error: 'arranger_id is required when countersigner_type is arranger'
    }, { status: 400 })
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

  // Check for existing signature requests to prevent duplicates
  const { data: existingRequests } = await serviceSupabase
    .from('signature_requests')
    .select('id, signer_role, status')
    .eq('document_id', documentId)
    .in('status', ['pending', 'signed'])

  if (existingRequests && existingRequests.length > 0) {
    const pendingCount = existingRequests.filter(r => r.status === 'pending').length
    const signedCount = existingRequests.filter(r => r.status === 'signed').length

    return NextResponse.json({
      error: 'Signature requests already exist for this document',
      details: `Found ${pendingCount} pending and ${signedCount} signed signature request(s). Cannot create duplicates.`,
      existing_requests: existingRequests.map(r => ({ id: r.id, role: r.signer_role, status: r.status }))
    }, { status: 409 }) // 409 Conflict
  }

  // Get signed URL for document
  const { data: urlData } = await serviceSupabase.storage
    .from('deal-documents')
    .createSignedUrl(document.file_key, 7 * 24 * 60 * 60) // 7 days

  if (!urlData?.signedUrl) {
    return NextResponse.json({ error: 'Failed to generate document URL' }, { status: 500 })
  }

  // Determine signatories
  type Signatory = { id: string; full_name: string; email: string }
  let signatories: Signatory[] = []

  if (body.signatory_member_ids && body.signatory_member_ids.length > 0) {
    // Multi-signatory mode: fetch selected members
    const { data: members, error: membersError } = await serviceSupabase
      .from('investor_members')
      .select('id, full_name, email')
      .in('id', body.signatory_member_ids)
      .eq('investor_id', subscription.investor_id)
      .eq('is_active', true)

    if (membersError || !members || members.length === 0) {
      return NextResponse.json({
        error: 'Selected signatories not found',
        details: 'Could not find the specified signatory members'
      }, { status: 400 })
    }

    signatories = members.map(m => ({
      id: m.id,
      full_name: m.full_name,
      email: m.email
    }))
  } else {
    // Fallback: use investor's primary email (backwards compatible)
    signatories = [{
      id: 'investor_primary',
      full_name: subscription.investor.legal_name || subscription.investor.display_name,
      email: subscription.investor.email
    }]
  }

  // Create signature requests for each signatory
  try {
    const signerPositions = ['party_a', 'party_a_2', 'party_a_3', 'party_a_4', 'party_a_5']
    const investorSignatureRequests = []

    for (let i = 0; i < signatories.length; i++) {
      const signatory = signatories[i]
      const position = signerPositions[i] || `party_a_${i + 1}`

      const investorSigPayload = {
        investor_id: subscription.investor_id,
        signer_email: signatory.email,
        signer_name: signatory.full_name,
        document_type: 'subscription',
        google_drive_url: urlData.signedUrl,
        signer_role: 'investor',
        signature_position: position,
        subscription_id: subscriptionId,
        document_id: documentId,
        member_id: signatory.id !== 'investor_primary' ? signatory.id : undefined
      }

      const investorSigResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/signature/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(investorSigPayload)
      })

      if (!investorSigResponse.ok) {
        const errorText = await investorSigResponse.text()
        throw new Error(`Failed to create investor signature request for ${signatory.full_name}: ${errorText}`)
      }

      const investorSigData = await investorSigResponse.json()
      investorSignatureRequests.push({
        signatory: signatory.full_name,
        email: signatory.email,
        ...investorSigData
      })
    }

    // Staff/Admin or Arranger signature request (countersignature)
    let countersignerEmail = 'cto@versoholdings.com'
    let countersignerName = 'Julien Machot'
    let signerRole: 'admin' | 'arranger' = 'admin'

    // If arranger is selected as countersigner, fetch arranger details
    if (body.countersigner_type === 'arranger' && body.arranger_id) {
      // Get arranger details with primary user
      const { data: arranger, error: arrangerError } = await serviceSupabase
        .from('arranger_entities')
        .select(`
          id,
          company_name,
          arranger_users!inner(user_id)
        `)
        .eq('id', body.arranger_id)
        .single()

      if (arrangerError || !arranger) {
        throw new Error(`Arranger not found: ${body.arranger_id}`)
      }

      // Get primary arranger user's profile
      const primaryUserId = (arranger.arranger_users as any)?.[0]?.user_id
      if (!primaryUserId) {
        throw new Error('Arranger has no associated users')
      }

      const { data: arrangerProfile } = await serviceSupabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', primaryUserId)
        .single()

      if (!arrangerProfile?.email) {
        throw new Error('Arranger user profile not found')
      }

      countersignerEmail = arrangerProfile.email
      countersignerName = arrangerProfile.full_name || arranger.company_name
      signerRole = 'arranger'
    }

    const staffSigPayload = {
      investor_id: subscription.investor_id,
      signer_email: countersignerEmail,
      signer_name: countersignerName,
      document_type: 'subscription',
      google_drive_url: urlData.signedUrl,
      signer_role: signerRole,
      signature_position: 'party_b',
      subscription_id: subscriptionId,
      document_id: documentId
    }

    const staffSigResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/signature/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(staffSigPayload)
    })

    if (!staffSigResponse.ok) {
      const errorText = await staffSigResponse.text()
      throw new Error(`Failed to create ${signerRole} signature request: ${errorText}`)
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

    console.log('✅ Multi-signatory signature requests created for subscription pack:', {
      document_id: documentId,
      investor_requests: investorSignatureRequests.length,
      countersigner_type: signerRole,
      countersigner_request: staffSigData.signature_request_id
    })

    return NextResponse.json({
      success: true,
      investor_signature_requests: investorSignatureRequests,
      countersigner_request: staffSigData,
      countersigner_type: signerRole,
      countersigner_name: countersignerName,
      total_signatories: signatories.length + 1 // investors + countersigner
    })

  } catch (error) {
    console.error('Error creating signature requests:', error)
    return NextResponse.json({
      error: 'Failed to initiate signature workflow',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
