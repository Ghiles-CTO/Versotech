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
      .select('id, name, file_key, mime_type, type, owner_investor_id, vehicle_id, deal_id')
      .eq('id', documentId)
      .single()

    if (docError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Permission check: Staff can access all documents, investors can only access their own
    const isStaff = profile.role.startsWith('staff_') || profile.role === 'ceo'

    if (!isStaff) {
      // Get investor IDs for this user
      const { data: investorLinks } = await supabase
        .from('investor_users')
        .select('investor_id')
        .eq('user_id', user.id)

      const investorIds = investorLinks?.map(link => link.investor_id) || []

      if (investorIds.length === 0) {
        return NextResponse.json(
          { error: 'Access denied - no investor profile found' },
          { status: 403 }
        )
      }

      let hasAccess = false

      // Check access via owner_investor_id
      if (document.owner_investor_id && investorIds.includes(document.owner_investor_id)) {
        hasAccess = true
      }

      // Check access via vehicle subscription
      if (!hasAccess && document.vehicle_id) {
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
      if (!hasAccess && document.deal_id) {
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
