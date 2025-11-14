import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import crypto from 'crypto'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: dealId, documentId } = await params

    // Get mode from query parameters (preview or download)
    const searchParams = request.nextUrl.searchParams
    const mode = searchParams.get('mode') || 'download' // Default to download for backward compatibility

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get document with RLS enforcement
    const { data: document, error: docError } = await supabase
      .from('deal_data_room_documents')
      .select(`
        *,
        deals:deal_id (
          id,
          name,
          status
        )
      `)
      .eq('id', documentId)
      .eq('deal_id', dealId)
      .single()

    if (docError || !document) {
      return NextResponse.json({
        error: 'Document not found or access denied'
      }, { status: 404 })
    }

    // Check if investor has data room access (for non-staff users)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, display_name, email')
      .eq('id', user.id)
      .single()

    const isStaff = profile?.role?.startsWith('staff_')

    if (!isStaff) {
      // Check if document is visible to investors
      if (!document.visible_to_investors) {
        return NextResponse.json({
          error: 'Document not available'
        }, { status: 403 })
      }

      // Check if investor has active data room access
      const { data: investorUsers } = await supabase
        .from('investor_users')
        .select('investor_id')
        .eq('user_id', user.id)

      const investorIds = investorUsers?.map(iu => iu.investor_id) ?? []

      if (investorIds.length === 0) {
        return NextResponse.json({
          error: 'No investor profile found'
        }, { status: 403 })
      }

      const { data: dataRoomAccess } = await supabase
        .from('deal_data_room_access')
        .select('*')
        .eq('deal_id', dealId)
        .in('investor_id', investorIds)
        .is('revoked_at', null)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
        .single()

      if (!dataRoomAccess) {
        return NextResponse.json({
          error: 'Data room access not granted or expired'
        }, { status: 403 })
      }
    }

    // Generate pre-signed URL with 2-minute expiry for deal documents
    const expiresIn = 120 // 2 minutes for deal data room documents
    const bucket = process.env.DEAL_DOCUMENTS_BUCKET || 'deal-documents'

    const { data: signedUrl, error: urlError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(document.file_key, expiresIn, {
        download: mode === 'download' // Only force download when mode is explicitly 'download'
      })

    if (urlError || !signedUrl) {
      console.error('Error creating signed URL:', urlError)
      return NextResponse.json({
        error: 'Failed to generate download link'
      }, { status: 500 })
    }

    // Create watermark information
    const watermarkInfo = {
      downloaded_by: profile?.display_name || user.email,
      downloaded_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + (expiresIn * 1000)).toISOString(),
      document_id: document.id,
      deal_id: dealId,
      access_token: crypto.randomBytes(16).toString('hex'),
      data_room_access: true
    }

    // Log document access for audit trail
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.DOCUMENT_DOWNLOAD,
      entity: AuditEntities.DEALS,
      entity_id: dealId,
      metadata: {
        document_id: document.id,
        file_key: document.file_key,
        file_name: document.file_name,
        folder: document.folder,
        user_role: profile?.role,
        access_method: 'pre_signed_url',
        expiry_seconds: expiresIn,
        deal_name: document.deals?.name,
        is_staff: isStaff
      }
    })

    return NextResponse.json({
      download_url: signedUrl.signedUrl,
      mode: mode, // Include the mode in response
      document: {
        id: document.id,
        name: document.file_name,
        file_name: document.file_name,
        file_key: document.file_key,
        folder: document.folder,
        created_at: document.created_at
      },
      watermark: watermarkInfo,
      expires_in_seconds: expiresIn,
      instructions: {
        security_notice: "This document is confidential and part of a secured data room. Unauthorized distribution is prohibited.",
        expiry_notice: `Download link expires in ${expiresIn / 60} minutes for security.`,
        audit_notice: "All data room document access is logged for compliance and audit purposes."
      }
    })

  } catch (error) {
    console.error('Deal document download error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
