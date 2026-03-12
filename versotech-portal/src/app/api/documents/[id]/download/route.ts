import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { readActivePersonaCookieValues, resolveActiveInvestorLink } from '@/lib/kyc/active-investor-link'
import {
  buildOfficePreviewUrl,
  getOfficePreviewType,
  isOfficePreviewSupported,
} from '@/lib/documents/office-viewer'

function resolveDocumentBucket(
  fileKey: string,
  documentType: string | null,
  subscriptionId: string | null
) {
  const documentsBucket = process.env.STORAGE_BUCKET_NAME || 'documents'
  const dealDocumentsBucket = process.env.DEAL_DOCUMENTS_BUCKET || 'deal-documents'

  if (
    fileKey.startsWith('subscriptions/') ||
    fileKey.startsWith('introducer-agreements/') ||
    fileKey.startsWith('placement-agreements/')
  ) {
    return dealDocumentsBucket
  }

  if (fileKey.startsWith('documents/')) {
    return documentsBucket
  }

  const dealDocumentTypes = ['subscription_draft', 'subscription_pack', 'subscription_final', 'deal_document']
  if (dealDocumentTypes.includes(documentType || '') || subscriptionId) {
    return dealDocumentsBucket
  }

  return documentsBucket
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: documentId } = await params

  try {
    const mode = request.nextUrl.searchParams.get('mode') || 'download'

    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    const requestedFileKey = request.nextUrl.searchParams.get('file_key')

    // Use service client to fetch document (bypasses RLS for permission check)
    const serviceSupabase = createServiceClient()
    const { cookiePersonaType, cookiePersonaId } = readActivePersonaCookieValues(request.cookies)
    const { link: activeInvestorLink } = await resolveActiveInvestorLink<{ investor_id: string }>({
      supabase: serviceSupabase,
      userId: user.id,
      cookiePersonaType,
      cookiePersonaId,
      select: 'investor_id',
    })
    const activeInvestorId = activeInvestorLink?.investor_id ?? null
    const { data: document, error: docError } = await serviceSupabase
      .from('documents')
      .select('id, name, file_key, mime_type, type, owner_investor_id, vehicle_id, deal_id, subscription_id, partner_id, commercial_partner_id, introducer_id')
      .eq('id', documentId)
      .single()

    if (docError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Permission check: Staff can access all documents, lawyers can access their deals, investors their own
    const isStaff = profile.role.startsWith('staff_') || profile.role === 'ceo'

    if (requestedFileKey && !isStaff) {
      return NextResponse.json(
        { error: 'Version downloads are only available to staff' },
        { status: 403 }
      )
    }

    if (!isStaff) {
      let hasAccess = false

      // Check if user is a lawyer assigned to this document's deal
      const { data: lawyerUser } = await serviceSupabase
        .from('lawyer_users')
        .select('lawyer_id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (lawyerUser?.lawyer_id) {
        let dealId = document.deal_id || null

        if (!dealId && document.subscription_id) {
          const { data: subscription } = await serviceSupabase
            .from('subscriptions')
            .select('deal_id')
            .eq('id', document.subscription_id)
            .maybeSingle()

          dealId = subscription?.deal_id || null
        }

        if (dealId) {
          const { data: assignment } = await serviceSupabase
            .from('deal_lawyer_assignments')
            .select('id')
            .eq('deal_id', dealId)
            .eq('lawyer_id', lawyerUser.lawyer_id)
            .maybeSingle()

          if (assignment) {
            hasAccess = true
          } else {
            const { data: lawyer } = await serviceSupabase
              .from('lawyers')
              .select('assigned_deals')
              .eq('id', lawyerUser.lawyer_id)
              .maybeSingle()

            if (lawyer?.assigned_deals?.includes(dealId)) {
              hasAccess = true
            }
          }
        }
      }

      // If not a lawyer with access, check arranger access
      if (!hasAccess) {
        const { data: arrangerUser } = await serviceSupabase
          .from('arranger_users')
          .select('arranger_id')
          .eq('user_id', user.id)
          .maybeSingle()

        if (arrangerUser?.arranger_id) {
          let dealId = document.deal_id || null

          // Get deal_id from subscription if not directly on document
          if (!dealId && document.subscription_id) {
            const { data: subscription } = await serviceSupabase
              .from('subscriptions')
              .select('deal_id')
              .eq('id', document.subscription_id)
              .maybeSingle()

            dealId = subscription?.deal_id || null
          }

          // Check if this deal is managed by the arranger
          if (dealId) {
            const { data: managedDeal } = await serviceSupabase
              .from('deals')
              .select('id')
              .eq('id', dealId)
              .eq('arranger_entity_id', arrangerUser.arranger_id)
              .maybeSingle()

            if (managedDeal) {
              hasAccess = true
            }
          }
        }
      }

      // If not a lawyer or arranger with access, check investor access
      if (!hasAccess) {
        // Check access via owner_investor_id
        if (activeInvestorId && document.owner_investor_id === activeInvestorId) {
          hasAccess = true
        }

        // Check access via vehicle subscription
        if (!hasAccess && document.vehicle_id && activeInvestorId) {
          const { data: subscription } = await supabase
            .from('subscriptions')
            .select('id')
            .eq('vehicle_id', document.vehicle_id)
            .eq('investor_id', activeInvestorId)
            .maybeSingle()

          if (subscription) {
            hasAccess = true
          }
        }

        // Check access via deal membership
        if (!hasAccess && document.deal_id && activeInvestorId) {
          const { data: dealMember } = await supabase
            .from('deal_memberships')
            .select('deal_id')
            .eq('deal_id', document.deal_id)
            .eq('investor_id', activeInvestorId)
            .maybeSingle()

          if (dealMember) {
            hasAccess = true
          }
        }
      }

      // Check Partner access - documents belonging to their partner entity
      if (!hasAccess && document.partner_id) {
        const { data: partnerUser } = await serviceSupabase
          .from('partner_users')
          .select('partner_id')
          .eq('user_id', user.id)
          .eq('partner_id', document.partner_id)
          .maybeSingle()

        if (partnerUser) {
          hasAccess = true
        }
      }

      // Check Commercial Partner access - documents belonging to their CP entity
      if (!hasAccess && document.commercial_partner_id) {
        const { data: cpUser } = await serviceSupabase
          .from('commercial_partner_users')
          .select('commercial_partner_id')
          .eq('user_id', user.id)
          .eq('commercial_partner_id', document.commercial_partner_id)
          .maybeSingle()

        if (cpUser) {
          hasAccess = true
        }
      }

      // Check Introducer access - documents belonging to their introducer entity
      if (!hasAccess && document.introducer_id) {
        const { data: introducerUser } = await serviceSupabase
          .from('introducer_users')
          .select('introducer_id')
          .eq('user_id', user.id)
          .eq('introducer_id', document.introducer_id)
          .maybeSingle()

        if (introducerUser) {
          hasAccess = true
        }
      }

      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Access denied - you do not have access to this document' },
          { status: 403 }
        )
      }
    }

    let resolvedFileKey = document.file_key
    let resolvedMimeType = document.mime_type

    if (requestedFileKey) {
      const { data: versionRecord, error: versionError } = await serviceSupabase
        .from('document_versions')
        .select('file_key, mime_type')
        .eq('document_id', documentId)
        .eq('file_key', requestedFileKey)
        .maybeSingle()

      if (versionError || !versionRecord) {
        return NextResponse.json(
          { error: 'Document version not found' },
          { status: 404 }
        )
      }

      resolvedFileKey = versionRecord.file_key
      resolvedMimeType = versionRecord.mime_type || document.mime_type
    }

    if (!resolvedFileKey) {
      return NextResponse.json(
        { error: 'Document file not found' },
        { status: 404 }
      )
    }

    const bucket = resolveDocumentBucket(
      resolvedFileKey,
      document.type,
      document.subscription_id
    )
    const resolvedFileName = resolvedFileKey.split('/').pop() || document.name
    const officePreviewType = mode === 'preview'
      ? getOfficePreviewType(resolvedFileName, resolvedMimeType)
      : null

    if (officePreviewType && isOfficePreviewSupported(resolvedFileName, resolvedMimeType)) {
      const { data: signedPreviewUrl, error: signedPreviewError } = await serviceSupabase.storage
        .from(bucket)
        .createSignedUrl(resolvedFileKey, 900)

      if (signedPreviewError || !signedPreviewUrl) {
        console.error('Signed Office preview URL generation error:', {
          error: signedPreviewError,
          document_id: document.id,
          file_key: resolvedFileKey,
          mime_type: resolvedMimeType,
        })

        return NextResponse.json(
          { error: 'Failed to generate document preview' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        download_url: buildOfficePreviewUrl(signedPreviewUrl.signedUrl),
        url: buildOfficePreviewUrl(signedPreviewUrl.signedUrl),
        preview_strategy: 'office_embed',
        document: {
          id: document.id,
          name: resolvedFileName,
          type: officePreviewType,
          preview_strategy: 'office_embed',
        },
        expires_in_seconds: 900,
      })
    }

    // Log document details for debugging
    console.log('Generating signed URL for document:', {
      id: document.id,
      name: resolvedFileName,
      file_key: resolvedFileKey,
      mime_type: resolvedMimeType,
      bucket: bucket
    })

    // Generate signed URL (expires in 1 hour)
    const { data: signedUrlData, error: signedUrlError} = await serviceSupabase.storage
      .from(bucket)
      .createSignedUrl(resolvedFileKey, 3600)

    if (signedUrlError || !signedUrlData) {
      console.error('Signed URL generation error:', {
        error: signedUrlError,
        document_id: document.id,
        file_key: resolvedFileKey,
        mime_type: resolvedMimeType
      })

      // Provide more specific error message
      const errorMessage = signedUrlError?.message || 'Failed to generate download URL'
      const isNotFound = errorMessage.includes('not found') || errorMessage.includes('404')

      return NextResponse.json(
        {
          error: isNotFound
            ? 'Document file not found in storage. It may have been deleted or not uploaded correctly.'
            : errorMessage,
          details: {
            document_id: document.id,
            file_name: resolvedFileName
          }
        },
        { status: isNotFound ? 404 : 500 }
      )
    }

    // Return signed URL with metadata
    return NextResponse.json({
      success: true,
      url: signedUrlData.signedUrl,  // Using 'url' as expected by DocumentViewer component
      fileName: resolvedFileName,
      mimeType: resolvedMimeType,
      expiresAt: new Date(Date.now() + 3600 * 1000).toISOString()
    })

  } catch (error) {
    console.error('Document download error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
