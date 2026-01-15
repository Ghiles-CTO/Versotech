import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { getCeoSigner } from '@/lib/staff/ceo-signer'
import { convertDocxToPdf } from '@/lib/gotenberg/convert'

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

  // Check if document is DOCX - if so, convert to PDF first
  // If already PDF, use directly (no conversion needed!)
  const isDocx = document.mime_type?.includes('wordprocessingml') ||
                 document.mime_type?.includes('msword') ||
                 document.file_key?.toLowerCase().endsWith('.docx') ||
                 document.file_key?.toLowerCase().endsWith('.doc')

  const isPdf = document.mime_type === 'application/pdf' ||
                document.file_key?.toLowerCase().endsWith('.pdf')

  let signableDocument = document
  let signableDocumentId = documentId

  if (isPdf) {
    console.log('✅ [READY-FOR-SIGNATURE] Document is already PDF, skipping conversion')
  } else if (isDocx) {
    console.log('📄 [READY-FOR-SIGNATURE] DOCX detected, converting to PDF via Gotenberg')

    // Download the DOCX from storage
    const { data: docxData, error: downloadError } = await serviceSupabase.storage
      .from('deal-documents')
      .download(document.file_key)

    if (downloadError || !docxData) {
      console.error('❌ Failed to download DOCX for conversion:', downloadError)
      return NextResponse.json({
        error: 'Failed to download document for conversion',
        details: downloadError?.message
      }, { status: 500 })
    }

    // Convert to Buffer
    const docxBuffer = Buffer.from(await docxData.arrayBuffer())
    console.log('📥 Downloaded DOCX:', { size: docxBuffer.length })

    // Convert to PDF via Gotenberg
    // Ensure filename has .docx extension (Gotenberg requires it)
    let docxFilename = document.name || 'document.docx'
    if (!docxFilename.toLowerCase().endsWith('.docx') && !docxFilename.toLowerCase().endsWith('.doc')) {
      docxFilename = `${docxFilename}.docx`
    }
    const conversionResult = await convertDocxToPdf(docxBuffer, docxFilename)

    if (!conversionResult.success || !conversionResult.pdfBuffer) {
      console.error('❌ Gotenberg conversion failed:', conversionResult.error)
      return NextResponse.json({
        error: 'Failed to convert DOCX to PDF',
        details: conversionResult.error || 'Conversion service unavailable'
      }, { status: 500 })
    }

    console.log('✅ DOCX converted to PDF:', {
      input_size: docxBuffer.length,
      output_size: conversionResult.pdfBuffer.length
    })

    // Upload the PDF to storage
    const pdfFileName = document.file_key.replace(/\.(docx?|DOCX?)$/, '.pdf')
    const pdfFileKey = pdfFileName.includes('/converted/')
      ? pdfFileName
      : pdfFileName.replace(/\/([^/]+)$/, '/converted/$1')

    const { error: uploadError } = await serviceSupabase.storage
      .from('deal-documents')
      .upload(pdfFileKey, conversionResult.pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true
      })

    if (uploadError) {
      console.error('❌ Failed to upload converted PDF:', uploadError)
      return NextResponse.json({
        error: 'Failed to save converted PDF',
        details: uploadError.message
      }, { status: 500 })
    }

    console.log('📤 Uploaded converted PDF:', pdfFileKey)

    // Create a new document record for the PDF
    const pdfDocName = (document.name || 'Document').replace(/\.(docx?|DOCX?)$/i, '.pdf')
    const { data: pdfDocument, error: pdfDocError } = await serviceSupabase
      .from('documents')
      .insert({
        subscription_id: subscriptionId,
        deal_id: document.deal_id,
        vehicle_id: document.vehicle_id,
        folder_id: document.folder_id,
        type: 'subscription_pack',
        name: pdfDocName,
        file_key: pdfFileKey,
        mime_type: 'application/pdf',
        file_size_bytes: conversionResult.pdfBuffer.length,
        status: 'final',
        ready_for_signature: false,
        current_version: 1,
        created_by: user.id
      })
      .select()
      .single()

    if (pdfDocError || !pdfDocument) {
      console.error('❌ Failed to create PDF document record:', pdfDocError)
      return NextResponse.json({
        error: 'Failed to create document record for converted PDF',
        details: pdfDocError?.message
      }, { status: 500 })
    }

    console.log('✅ Created PDF document record:', pdfDocument.id)

    // Update the original DOCX document status to indicate it has been converted
    await serviceSupabase
      .from('documents')
      .update({
        status: 'draft',
        metadata: { converted_to_pdf: pdfDocument.id, converted_at: new Date().toISOString() }
      })
      .eq('id', document.id)

    // Use the new PDF document for signature
    signableDocument = pdfDocument
    signableDocumentId = pdfDocument.id

    console.log('🔄 Proceeding with converted PDF for signature:', {
      original_docx_id: document.id,
      new_pdf_id: pdfDocument.id
    })
  } else if (document.mime_type && !document.mime_type.includes('pdf')) {
    // Not DOCX and not PDF - unsupported format
    return NextResponse.json({
      error: 'Unsupported file format. Only PDF and DOCX files can be sent for signature.',
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
        type,
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
    .eq('document_id', signableDocumentId)
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

  // Get signed URL for document (use the signable PDF)
  const { data: urlData } = await serviceSupabase.storage
    .from('deal-documents')
    .createSignedUrl(signableDocument.file_key, 7 * 24 * 60 * 60) // 7 days

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
    // Check if investor is entity type - auto-fetch signatories from investor_members
    const isEntityInvestor = subscription.investor.type === 'entity' ||
                             subscription.investor.type === 'institutional'

    if (isEntityInvestor) {
      // Fetch authorized signatories for entity investor
      const { data: entityMembers } = await serviceSupabase
        .from('investor_members')
        .select('id, full_name, email')
        .eq('investor_id', subscription.investor_id)
        .eq('is_signatory', true)
        .eq('is_active', true)

      if (entityMembers && entityMembers.length > 0) {
        signatories = entityMembers.map(m => ({
          id: m.id,
          full_name: m.full_name,
          email: m.email
        }))
        console.log(`👥 [READY-FOR-SIGNATURE] Auto-fetched ${signatories.length} signatories for entity investor`)
      } else {
        // Entity but no signatories marked - fall back to investor name
        console.warn('[READY-FOR-SIGNATURE] Entity investor has no signatories marked, using investor name')
        signatories = [{
          id: 'investor_primary',
          full_name: subscription.investor.legal_name || subscription.investor.display_name,
          email: subscription.investor.email
        }]
      }
    } else {
      // Individual investor: use investor's primary email
      signatories = [{
        id: 'investor_primary',
        full_name: subscription.investor.legal_name || subscription.investor.display_name,
        email: subscription.investor.email
      }]
    }
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
        document_id: signableDocumentId,
        member_id: signatory.id !== 'investor_primary' ? signatory.id : undefined,
        total_party_a_signatories: signatories.length // For multi-signatory positioning
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
    const ceoSigner = await getCeoSigner(serviceSupabase)

    // Graceful fallback: If no CEO signer found and not using arranger, use the current staff user
    // This allows signature workflows to proceed even when no CEO profile exists
    const useStaffFallback = body.countersigner_type !== 'arranger' && !ceoSigner
    if (useStaffFallback) {
      console.warn('[ready-for-signature] No CEO signer found, falling back to current staff user:', {
        user_id: user.id,
        email: profile?.email,
        display_name: profile?.display_name
      })
    }

    // Use CEO if available, otherwise fall back to current staff user
    let countersignerEmail = ceoSigner?.email || (useStaffFallback ? profile?.email : '') || ''
    let countersignerName = ceoSigner?.displayName || (useStaffFallback ? profile?.display_name : '') || 'Staff Admin'
    let signerRole: 'admin' | 'arranger' = 'admin'

    // If still no countersigner after fallback, return error
    if (!countersignerEmail && body.countersigner_type !== 'arranger') {
      return NextResponse.json(
        { error: 'No countersigner available. Please configure a CEO profile or use arranger countersigning.' },
        { status: 400 }
      )
    }

    // If arranger is selected as countersigner, fetch arranger details
    if (body.countersigner_type === 'arranger' && body.arranger_id) {
      // Get arranger details with primary user
      // Note: arranger_entities has no 'company_name' - use legal_name
      const { data: arranger, error: arrangerError } = await serviceSupabase
        .from('arranger_entities')
        .select(`
          id,
          legal_name,
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

      // Note: profiles has 'display_name' not 'full_name'
      const { data: arrangerProfile } = await serviceSupabase
        .from('profiles')
        .select('email, display_name')
        .eq('id', primaryUserId)
        .single()

      if (!arrangerProfile?.email) {
        throw new Error('Arranger user profile not found')
      }

      countersignerEmail = arrangerProfile.email
      countersignerName = arrangerProfile.display_name || arranger.legal_name
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
      document_id: signableDocumentId
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

    // Update document status (update the signable PDF document)
    await serviceSupabase
      .from('documents')
      .update({
        ready_for_signature: true,
        status: 'pending_signature'
      })
      .eq('id', signableDocumentId)

    const now = new Date().toISOString()
    await serviceSupabase
      .from('subscriptions')
      .update({ pack_sent_at: now })
      .eq('id', subscriptionId)
      .is('pack_sent_at', null)
    await serviceSupabase
      .from('subscriptions')
      .update({ pack_generated_at: now })
      .eq('id', subscriptionId)
      .is('pack_generated_at', null)

    // Notify arranger users when pack is sent for signature
    if (subscription.deal_id) {
      const { data: deal } = await serviceSupabase
        .from('deals')
        .select('arranger_entity_id, name')
        .eq('id', subscription.deal_id)
        .single()

      if (deal?.arranger_entity_id) {
        const { data: arrangerUsers } = await serviceSupabase
          .from('arranger_users')
          .select('user_id')
          .eq('arranger_id', deal.arranger_entity_id)

        if (arrangerUsers && arrangerUsers.length > 0) {
          const investorName = subscription.investor?.display_name || subscription.investor?.legal_name || 'Investor'
          const dealName = deal.name || 'the deal'

          const notifications = arrangerUsers.map((au: { user_id: string }) => ({
            user_id: au.user_id,
            investor_id: null,
            title: 'Subscription Pack Sent',
            message: `Subscription pack for ${investorName} (${dealName}) has been sent for signature.`,
            link: '/versotech_main/versosign'
          }))

          await serviceSupabase.from('investor_notifications').insert(notifications)
          console.log('📧 Notified arranger users about pack sent:', arrangerUsers.length)
        }
      }
    }

    console.log('✅ Multi-signatory signature requests created for subscription pack:', {
      document_id: signableDocumentId,
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
