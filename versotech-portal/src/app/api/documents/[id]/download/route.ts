import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: documentId } = await params

  try {
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

    // Use service client to fetch document (bypasses RLS for permission check)
    const serviceSupabase = createServiceClient()
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
        const { data: investorLinks } = await supabase
          .from('investor_users')
          .select('investor_id')
          .eq('user_id', user.id)

        const investorIds = investorLinks?.map(link => link.investor_id) || []

        // Check access via owner_investor_id
        if (document.owner_investor_id && investorIds.includes(document.owner_investor_id)) {
          hasAccess = true
        }

        // Check access via vehicle subscription
        if (!hasAccess && document.vehicle_id && investorIds.length > 0) {
          const { data: subscription } = await supabase
            .from('subscriptions')
            .select('id')
            .eq('vehicle_id', document.vehicle_id)
            .in('investor_id', investorIds)
            .maybeSingle()

          if (subscription) {
            hasAccess = true
          }
        }

        // Check access via deal membership
        if (!hasAccess && document.deal_id && investorIds.length > 0) {
          const { data: dealMember } = await supabase
            .from('deal_memberships')
            .select('deal_id')
            .eq('deal_id', document.deal_id)
            .in('investor_id', investorIds)
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

    // Determine which bucket based on document type
    const bucket = document.type === 'subscription_draft' ? 'deal-documents' : (process.env.STORAGE_BUCKET_NAME || 'documents')

    // Log document details for debugging
    console.log('Generating signed URL for document:', {
      id: document.id,
      name: document.name,
      file_key: document.file_key,
      mime_type: document.mime_type,
      bucket: bucket
    })

    // Generate signed URL (expires in 1 hour)
    const { data: signedUrlData, error: signedUrlError} = await serviceSupabase.storage
      .from(bucket)
      .createSignedUrl(document.file_key, 3600)

    if (signedUrlError || !signedUrlData) {
      console.error('Signed URL generation error:', {
        error: signedUrlError,
        document_id: document.id,
        file_key: document.file_key,
        mime_type: document.mime_type
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
            file_name: document.name
          }
        },
        { status: isNotFound ? 404 : 500 }
      )
    }

    // Return signed URL with metadata
    return NextResponse.json({
      success: true,
      url: signedUrlData.signedUrl,  // Using 'url' as expected by DocumentViewer component
      fileName: document.name,
      mimeType: document.mime_type,
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
