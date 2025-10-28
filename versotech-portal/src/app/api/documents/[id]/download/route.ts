import { createClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: documentId } = await params

    // Get document with RLS enforcement (user can only see entitled documents)
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select(`
        *,
        investors:owner_investor_id (legal_name),
        vehicles:vehicle_id (name, type),
        created_by_profile:created_by (display_name, email)
      `)
      .eq('id', documentId)
      .single()

    if (docError || !document) {
      return NextResponse.json({ error: 'Document not found or access denied' }, { status: 404 })
    }

    // Generate pre-signed URL with short expiry (15 minutes)
    const expiresIn = 15 * 60 // 15 minutes in seconds
    const { data: signedUrl, error: urlError } = await supabase.storage
      .from(process.env.STORAGE_BUCKET_NAME || 'documents')
      .createSignedUrl(document.file_key, expiresIn, {
        download: true,
        transform: {
          width: undefined, // Don't transform documents
          height: undefined,
          resize: undefined,
          format: undefined,
          quality: undefined
        }
      })

    if (urlError || !signedUrl) {
      console.error('Error creating signed URL:', urlError)
      return NextResponse.json({ error: 'Failed to generate download link' }, { status: 500 })
    }

    // Get user profile for audit logging
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, display_name, email')
      .eq('id', user.id)
      .single()

    // Log document access for audit trail
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.DOCUMENT_DOWNLOAD,
      entity: AuditEntities.DOCUMENTS,
      entity_id: document.id,
      metadata: {
        file_key: document.file_key,
        document_type: document.type,
        user_role: profile?.role,
        access_method: 'pre_signed_url',
        expiry_minutes: 15,
        investor_name: document.investors?.legal_name,
        vehicle_name: document.vehicles?.name
      }
    })

    // Add watermark information to the response
    const watermarkInfo = {
      downloaded_by: profile?.display_name || user.email,
      downloaded_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + (expiresIn * 1000)).toISOString(),
      document_id: document.id,
      access_token: crypto.randomBytes(16).toString('hex') // For tracking
    }

    return NextResponse.json({
      download_url: signedUrl.signedUrl,
      document: {
        id: document.id,
        type: document.type,
        file_key: document.file_key,
        created_at: document.created_at,
        created_by: document.created_by_profile?.display_name
      },
      watermark: watermarkInfo,
      expires_in_seconds: expiresIn,
      instructions: {
        security_notice: "This document is confidential and intended solely for the authorized recipient. Unauthorized distribution is prohibited.",
        expiry_notice: `Download link expires in ${expiresIn / 60} minutes for security.`,
        audit_notice: "All document access is logged for compliance and audit purposes."
      }
    })

  } catch (error) {
    console.error('Document download error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

