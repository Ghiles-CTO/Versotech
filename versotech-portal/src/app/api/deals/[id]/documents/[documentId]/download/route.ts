import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { applyPdfWatermark } from '@/lib/documents/pdf-watermark'
import { applyImageWatermark } from '@/lib/documents/image-watermark'
import crypto from 'crypto'

function isPdf(fileName: string | null | undefined): boolean {
  return !!fileName && fileName.toLowerCase().endsWith('.pdf')
}

function isImage(fileName: string | null | undefined): boolean {
  if (!fileName) return false
  return /\.(jpg|jpeg|png|gif|webp|bmp|tiff?)$/i.test(fileName)
}

function isVideo(fileName: string | null | undefined): boolean {
  if (!fileName) return false
  return /\.(mp4|mov|webm|avi|mkv|m4v)$/i.test(fileName)
}

function getMimeType(fileName: string | null | undefined): string {
  if (!fileName) return 'application/octet-stream'
  const ext = fileName.toLowerCase().split('.').pop()
  const map: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    bmp: 'image/bmp',
    tif: 'image/tiff',
    tiff: 'image/tiff',
    mp4: 'video/mp4',
    mov: 'video/quicktime',
    webm: 'video/webm',
    avi: 'video/x-msvideo',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    xls: 'application/vnd.ms-excel',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    doc: 'application/msword',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ppt: 'application/vnd.ms-powerpoint',
    txt: 'text/plain',
    csv: 'text/csv',
    zip: 'application/zip',
  }
  return map[ext ?? ''] ?? 'application/octet-stream'
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  try {
    const clientSupabase = await createClient()
    const serviceSupabase = createServiceClient()
    const { id: dealId, documentId } = await params

    // Get mode from query parameters (preview or download)
    const searchParams = request.nextUrl.searchParams
    const mode = searchParams.get('mode') || 'download' // Default to download for backward compatibility

    // Authenticate user
    const { data: { user }, error: authError } = await clientSupabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get document with RLS enforcement
    const { data: document, error: docError } = await serviceSupabase
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
    const { data: profile } = await serviceSupabase
      .from('profiles')
      .select('role, display_name, email')
      .eq('id', user.id)
      .single()

    const isStaff = profile?.role?.startsWith('staff_') || profile?.role === 'ceo'

    // Block investor download mode — investors get preview only
    if (mode === 'download' && !isStaff) {
      return NextResponse.json({ error: 'Download not permitted' }, { status: 403 })
    }

    if (!isStaff) {
      const { data: membership } = await serviceSupabase
        .from('deal_memberships')
        .select('role')
        .eq('deal_id', dealId)
        .eq('user_id', user.id)
        .maybeSingle()

      if (membership?.role === 'introducer' || membership?.role === 'lawyer') {
        return NextResponse.json({
          error: 'Data room access not available for this role'
        }, { status: 403 })
      }

      // Check if document is visible to investors
      if (!document.visible_to_investors) {
        return NextResponse.json({
          error: 'Document not available'
        }, { status: 403 })
      }

      // Featured documents can be accessed without data room access
      const isFeaturedDoc = document.is_featured === true

      if (!isFeaturedDoc) {
        // Non-featured docs require active data room access
        const { data: investorUsers } = await serviceSupabase
          .from('investor_users')
          .select('investor_id')
          .eq('user_id', user.id)

        const investorIds = investorUsers?.map(iu => iu.investor_id) ?? []

        if (investorIds.length === 0) {
          return NextResponse.json({
            error: 'No investor profile found'
          }, { status: 403 })
        }

        const { data: dataRoomAccess } = await serviceSupabase
          .from('deal_data_room_access')
          .select('*')
          .eq('deal_id', dealId)
          .in('investor_id', investorIds)
          .is('revoked_at', null)
          .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
          .limit(1)
          .maybeSingle()

        if (!dataRoomAccess) {
          return NextResponse.json({
            error: 'Data room access not granted or expired'
          }, { status: 403 })
        }
      }
    }

    const bucket = process.env.DEAL_DOCUMENTS_BUCKET || 'deal-documents'

    if (!document.file_key) {
      return NextResponse.json({
        error: 'Document file is not available'
      }, { status: 404 })
    }

    // Resolve investor entity name for watermark (non-staff only)
    let entityName: string | null = null
    if (!isStaff) {
      const { data: investorUsers } = await serviceSupabase
        .from('investor_users')
        .select('investor_id')
        .eq('user_id', user.id)

      if (investorUsers && investorUsers.length > 0) {
        const { data: investor } = await serviceSupabase
          .from('investors')
          .select('legal_name')
          .eq('id', investorUsers[0].investor_id)
          .maybeSingle()

        entityName = investor?.legal_name || null
      }
    }

    const watermarkInfo = {
      downloaded_by: profile?.display_name || user.email,
      downloaded_at: new Date().toISOString(),
      document_id: document.id,
      deal_id: dealId,
      access_token: crypto.randomBytes(16).toString('hex'),
      data_room_access: true,
      viewer_email: user.email,
      viewer_name: profile?.display_name || null,
      entity_name: entityName,
    }

    const fileType = isPdf(document.file_name) ? 'pdf'
      : isImage(document.file_name) ? 'image'
      : 'other'

    const accessMethod = fileType === 'pdf' ? 'watermarked_pdf'
      : fileType === 'image' ? 'watermarked_image'
      : 'proxied_binary'

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
        access_method: accessMethod,
        deal_name: document.deals?.name,
        is_staff: isStaff
      }
    })

    // --- Video: short-lived signed URL (range requests required for playback) ---
    // Videos cannot be watermarked and need byte-range support the proxy doesn't provide.
    // A 2-minute signed URL expires before it can be meaningfully shared.
    if (isVideo(document.file_name)) {
      const { data: signedUrl, error: urlError } = await serviceSupabase.storage
        .from(bucket)
        .createSignedUrl(document.file_key, 120, { download: false })

      if (urlError || !signedUrl) {
        return NextResponse.json({ error: 'Failed to generate video link' }, { status: 500 })
      }

      return NextResponse.json({
        download_url: signedUrl.signedUrl,
        watermark: watermarkInfo,
      })
    }

    // Download raw bytes from storage (PDF, image, and other types)
    const { data: fileBlob, error: downloadError } = await serviceSupabase.storage
      .from(bucket)
      .download(document.file_key)

    if (downloadError || !fileBlob) {
      console.error('Storage download failed:', downloadError)
      return NextResponse.json({ error: 'Failed to fetch document from storage' }, { status: 500 })
    }

    const rawBytes = new Uint8Array(await fileBlob.arrayBuffer())
    const disposition = mode === 'download' ? 'attachment' : 'inline'
    const safeFileName = (document.file_name || 'document').replace(/[^\w.\-_ ]/g, '_')

    // --- PDF: watermark then stream ---
    if (fileType === 'pdf') {
      const watermarkedBytes = await applyPdfWatermark(rawBytes, {
        line1: user.email || 'Unknown',
        line2: entityName || undefined,
      })

      return new Response(Buffer.from(watermarkedBytes), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `${disposition}; filename="${safeFileName}"`,
          'Content-Length': String(watermarkedBytes.byteLength),
          'Cache-Control': 'no-store',
          'X-Watermark-Email': user.email || '',
          'X-Watermark-Entity': entityName || '',
          'X-Watermark-Name': profile?.display_name || '',
          'X-Document-Id': document.id,
        },
      })
    }

    // --- Image: watermark then stream ---
    if (fileType === 'image') {
      const watermarkedBuffer = await applyImageWatermark(rawBytes, {
        email: user.email || 'Unknown',
        entityName: entityName || undefined,
      })
      const watermarkedBytes = new Uint8Array(watermarkedBuffer)

      return new Response(watermarkedBytes, {
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': `${disposition}; filename="${safeFileName}"`,
          'Content-Length': String(watermarkedBytes.byteLength),
          'Cache-Control': 'no-store',
          'X-Watermark-Email': user.email || '',
          'X-Watermark-Entity': entityName || '',
          'X-Watermark-Name': profile?.display_name || '',
          'X-Document-Id': document.id,
        },
      })
    }

    // --- All other types (video, Excel, DOCX, etc.): proxy bytes, no mutation ---
    const mimeType = getMimeType(document.file_name)
    return new Response(Buffer.from(rawBytes), {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `${disposition}; filename="${safeFileName}"`,
        'Content-Length': String(rawBytes.byteLength),
        'Cache-Control': 'no-store',
        'X-Watermark-Email': user.email || '',
        'X-Watermark-Entity': entityName || '',
        'X-Watermark-Name': profile?.display_name || '',
        'X-Document-Id': document.id,
      },
    })

  } catch (error) {
    console.error('Deal document download error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
