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
      .select('id, name, file_key, mime_type, owner_investor_id')
      .eq('id', documentId)
      .single()

    if (docError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Permission check: Staff can access all documents, investors can only access their own
    const isStaff = profile.role.startsWith('staff_')

    if (!isStaff) {
      // Check if investor owns this document
      const { data: investorUser } = await supabase
        .from('investor_users')
        .select('investor_id')
        .eq('user_id', user.id)
        .eq('investor_id', document.owner_investor_id)
        .single()

      if (!investorUser) {
        return NextResponse.json(
          { error: 'Access denied - you do not own this document' },
          { status: 403 }
        )
      }
    }

    // Log document details for debugging
    console.log('Generating signed URL for document:', {
      id: document.id,
      name: document.name,
      file_key: document.file_key,
      mime_type: document.mime_type,
      bucket: process.env.STORAGE_BUCKET_NAME || 'documents'
    })

    // Generate signed URL (expires in 1 hour)
    const { data: signedUrlData, error: signedUrlError} = await serviceSupabase.storage
      .from(process.env.STORAGE_BUCKET_NAME || 'documents')
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
