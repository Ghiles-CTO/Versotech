/**
 * Commission Invoice API
 *
 * POST /api/commissions/[type]/[id]/invoice - Upload invoice PDF
 * GET /api/commissions/[type]/[id]/invoice - Get signed URL for invoice download
 *
 * Types: 'partner', 'introducer', 'commercial-partner'
 *
 * Used by entities (partners, introducers, commercial partners) to upload invoices,
 * and by arrangers to view/download uploaded invoices.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

type CommissionType = 'partner' | 'introducer' | 'commercial-partner'

// Map commission types to their database tables and user tables
const TYPE_CONFIG: Record<CommissionType, {
  table: string
  userTable: string
  entityIdField: string
  entityTable: string
}> = {
  'partner': {
    table: 'partner_commissions',
    userTable: 'partner_users',
    entityIdField: 'partner_id',
    entityTable: 'partners',
  },
  'introducer': {
    table: 'introducer_commissions',
    userTable: 'introducer_users',
    entityIdField: 'introducer_id',
    entityTable: 'introducers',
  },
  'commercial-partner': {
    table: 'commercial_partner_commissions',
    userTable: 'commercial_partner_users',
    entityIdField: 'commercial_partner_id',
    entityTable: 'commercial_partners',
  },
}

/**
 * GET /api/commissions/[type]/[id]/invoice
 * Get a signed URL to download/view the invoice
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const { type, id } = await params
    const commissionType = type as CommissionType

    if (!TYPE_CONFIG[commissionType]) {
      return NextResponse.json(
        { error: `Invalid commission type: ${type}` },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const serviceSupabase = createServiceClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const config = TYPE_CONFIG[commissionType]

    // Fetch the commission
    const { data: commissionData, error: fetchError } = await serviceSupabase
      .from(config.table)
      .select('id, invoice_id, arranger_id, ' + config.entityIdField)
      .eq('id', id)
      .single()

    if (fetchError || !commissionData) {
      return NextResponse.json({ error: 'Commission not found' }, { status: 404 })
    }

    // Type assertion for dynamic table query (cast through unknown for dynamic tables)
    const commission = commissionData as unknown as {
      id: string
      invoice_id: string | null
      arranger_id: string
      [key: string]: any
    }

    if (!commission.invoice_id) {
      return NextResponse.json({ error: 'No invoice uploaded for this commission' }, { status: 404 })
    }

    // Check user authorization
    // User must be either:
    // 1. An arranger user for the commission's arranger
    // 2. An entity user for the commission's entity
    const [arrangerCheck, entityCheck] = await Promise.all([
      serviceSupabase
        .from('arranger_users')
        .select('arranger_id')
        .eq('user_id', user.id)
        .eq('arranger_id', commission.arranger_id)
        .maybeSingle(),
      serviceSupabase
        .from(config.userTable)
        .select(config.entityIdField.replace('_id', '_id'))
        .eq('user_id', user.id)
        .eq(config.entityIdField.replace('_id', '_id'), commission[config.entityIdField as keyof typeof commission])
        .maybeSingle(),
    ])

    const isArranger = !!arrangerCheck.data
    const isEntity = !!entityCheck.data

    if (!isArranger && !isEntity) {
      return NextResponse.json({ error: 'Not authorized to view this invoice' }, { status: 403 })
    }

    // Generate signed URL for the invoice file
    const { data: signedUrl, error: urlError } = await serviceSupabase
      .storage
      .from('commission-invoices')
      .createSignedUrl(commission.invoice_id, 3600) // 1 hour expiry

    if (urlError) {
      console.error('[commission-invoice] Error generating signed URL:', urlError)
      return NextResponse.json({ error: 'Failed to generate download URL' }, { status: 500 })
    }

    return NextResponse.json({
      data: {
        url: signedUrl.signedUrl,
        path: commission.invoice_id,
        expires_in: 3600,
      },
    })
  } catch (error) {
    console.error('[commission-invoice] GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/commissions/[type]/[id]/invoice
 * Upload an invoice for a commission
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const { type, id } = await params
    const commissionType = type as CommissionType

    if (!TYPE_CONFIG[commissionType]) {
      return NextResponse.json(
        { error: `Invalid commission type: ${type}` },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const serviceSupabase = createServiceClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const config = TYPE_CONFIG[commissionType]

    // Fetch the commission
    const { data: commissionData, error: fetchError } = await serviceSupabase
      .from(config.table)
      .select('id, status, arranger_id, ' + config.entityIdField)
      .eq('id', id)
      .single()

    if (fetchError || !commissionData) {
      return NextResponse.json({ error: 'Commission not found' }, { status: 404 })
    }

    // Type assertion for dynamic table query (cast through unknown for dynamic tables)
    const commission = commissionData as unknown as {
      id: string
      status: string
      arranger_id: string
      [key: string]: any
    }

    // Verify user is an entity user for this commission
    const { data: entityUser, error: entityError } = await serviceSupabase
      .from(config.userTable)
      .select('*')
      .eq('user_id', user.id)
      .eq(config.entityIdField.replace('_id', '_id'), commission[config.entityIdField])
      .maybeSingle()

    if (entityError || !entityUser) {
      return NextResponse.json({ error: 'Not authorized to upload invoice for this commission' }, { status: 403 })
    }

    // Validate status - must be 'invoice_requested'
    if (commission.status !== 'invoice_requested') {
      return NextResponse.json(
        { error: `Cannot upload invoice for commission with status '${commission.status}'. Status must be 'invoice_requested'.` },
        { status: 400 }
      )
    }

    // Get form data with file
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Allowed types: PDF, PNG, JPEG` },
        { status: 400 }
      )
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Generate file path: {type}/{arranger_id}/{commission_id}/{filename}
    const ext = file.name.split('.').pop() || 'pdf'
    const timestamp = Date.now()
    const fileName = `invoice-${timestamp}.${ext}`
    const filePath = `${commissionType}/${commission.arranger_id}/${id}/${fileName}`

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = new Uint8Array(arrayBuffer)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await serviceSupabase
      .storage
      .from('commission-invoices')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('[commission-invoice] Upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload invoice' }, { status: 500 })
    }

    // Update commission with invoice_id and status
    const { data: updatedCommission, error: updateError } = await serviceSupabase
      .from(config.table)
      .update({
        invoice_id: filePath,
        status: 'invoiced',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('[commission-invoice] Update error:', updateError)
      // Try to delete the uploaded file
      await serviceSupabase.storage.from('commission-invoices').remove([filePath])
      return NextResponse.json({ error: 'Failed to update commission' }, { status: 500 })
    }

    // Notify arranger users that invoice was received
    const { data: arrangerUsers } = await serviceSupabase
      .from('arranger_users')
      .select('user_id')
      .eq('arranger_id', commission.arranger_id)

    if (arrangerUsers && arrangerUsers.length > 0) {
      // Get entity name for notification
      const { data: entity } = await serviceSupabase
        .from(config.entityTable)
        .select('name, legal_name')
        .eq('id', commission[config.entityIdField as keyof typeof commission])
        .single()

      const entityName = entity?.name || entity?.legal_name || 'Entity'

      const notifications = arrangerUsers.map((au: { user_id: string }) => ({
        user_id: au.user_id,
        investor_id: null,
        title: 'Invoice Received',
        message: `${entityName} has submitted their invoice for commission payment.`,
        link: '/versotech_main/payment-requests',
        type: 'info',
      }))

      await serviceSupabase.from('investor_notifications').insert(notifications)
      console.log('[commission-invoice] Sent', notifications.length, 'notifications to arranger users')
    }

    // Create audit log
    await serviceSupabase.from('audit_logs').insert({
      event_type: 'commission',
      action: 'invoice_uploaded',
      entity_type: config.table.replace('_commissions', '_commission'),
      entity_id: id,
      actor_id: user.id,
      action_details: {
        description: 'Invoice uploaded for commission',
        file_path: filePath,
        file_type: file.type,
        file_size: file.size,
        commission_type: commissionType,
      },
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: 'Invoice uploaded successfully',
      data: {
        invoice_id: filePath,
        status: 'invoiced',
      },
    })
  } catch (error) {
    console.error('[commission-invoice] POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
