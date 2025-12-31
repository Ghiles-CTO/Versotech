/**
 * Arranger KYC Submission API
 * POST /api/arrangers/me/kyc-submission
 *
 * Allows arranger to submit their KYC documents for staff review
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'

// Required document types for KYC submission
const REQUIRED_DOCUMENT_TYPES = [
  'company_registration',
  'proof_of_address',
  'director_id',
]

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const serviceSupabase = createServiceClient()

    // Verify authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get arranger entity for this user
    const { data: arrangerUser, error: arrangerUserError } = await supabase
      .from('arranger_users')
      .select('arranger_id')
      .eq('user_id', user.id)
      .single()

    if (arrangerUserError || !arrangerUser) {
      return NextResponse.json({ error: 'Not an arranger user' }, { status: 403 })
    }

    const arrangerId = arrangerUser.arranger_id

    // Get arranger entity details
    const { data: arranger, error: arrangerError } = await serviceSupabase
      .from('arranger_entities')
      .select('id, legal_name, kyc_status, kyc_submitted_at')
      .eq('id', arrangerId)
      .single()

    if (arrangerError || !arranger) {
      return NextResponse.json({ error: 'Arranger entity not found' }, { status: 404 })
    }

    // Check if already submitted or approved
    if (arranger.kyc_status === 'approved') {
      return NextResponse.json({
        error: 'KYC already approved',
        data: { kyc_status: arranger.kyc_status }
      }, { status: 400 })
    }

    if (arranger.kyc_status === 'pending' && arranger.kyc_submitted_at) {
      return NextResponse.json({
        error: 'KYC already submitted and pending review',
        data: {
          kyc_status: arranger.kyc_status,
          submitted_at: arranger.kyc_submitted_at
        }
      }, { status: 400 })
    }

    // Check for required documents
    const { data: documents, error: docsError } = await serviceSupabase
      .from('arranger_documents')
      .select('id, document_type, status')
      .eq('arranger_id', arrangerId)
      .eq('status', 'active')

    if (docsError) {
      console.error('Failed to fetch documents:', docsError)
      return NextResponse.json({ error: 'Failed to check documents' }, { status: 500 })
    }

    const uploadedTypes = new Set((documents || []).map(d => d.document_type))
    const missingTypes = REQUIRED_DOCUMENT_TYPES.filter(t => !uploadedTypes.has(t))

    if (missingTypes.length > 0) {
      return NextResponse.json({
        error: 'Missing required documents',
        details: {
          missing: missingTypes,
          required: REQUIRED_DOCUMENT_TYPES,
          uploaded: Array.from(uploadedTypes)
        }
      }, { status: 400 })
    }

    // Update arranger entity with submission
    const now = new Date().toISOString()
    const { error: updateError } = await serviceSupabase
      .from('arranger_entities')
      .update({
        kyc_status: 'pending',
        kyc_submitted_at: now,
        kyc_submitted_by: user.id,
      })
      .eq('id', arrangerId)

    if (updateError) {
      console.error('Failed to update arranger:', updateError)
      return NextResponse.json({ error: 'Failed to submit KYC' }, { status: 500 })
    }

    // Notify staff admins about new KYC submission
    const { data: staffAdmins } = await serviceSupabase
      .from('profiles')
      .select('id')
      .in('role', ['ceo', 'staff_admin'])
      .limit(10)

    if (staffAdmins && staffAdmins.length > 0) {
      const staffNotifications = staffAdmins.map((admin: { id: string }) => ({
        user_id: admin.id,
        investor_id: null,
        title: 'Arranger KYC Submitted',
        message: `${arranger.legal_name} has submitted their KYC documents for review.`,
        link: `/versotech_main/users?type=arranger&id=${arrangerId}`,
      }))

      await serviceSupabase.from('investor_notifications').insert(staffNotifications)
    }

    // Audit log
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.UPDATE,
      entity: AuditEntities.ARRANGER,
      entity_id: arrangerId,
      metadata: {
        event: 'kyc_submitted',
        documents_count: documents?.length || 0,
        document_types: Array.from(uploadedTypes),
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        arranger_id: arrangerId,
        kyc_status: 'pending',
        submitted_at: now,
        message: 'KYC documents submitted for review. You will be notified once the review is complete.',
      }
    })

  } catch (error) {
    console.error('KYC submission error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET endpoint to check submission status
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: arrangerUser } = await supabase
      .from('arranger_users')
      .select('arranger_id')
      .eq('user_id', user.id)
      .single()

    if (!arrangerUser) {
      return NextResponse.json({ error: 'Not an arranger user' }, { status: 403 })
    }

    const { data: arranger } = await supabase
      .from('arranger_entities')
      .select('id, kyc_status, kyc_submitted_at, kyc_submitted_by, kyc_approved_at, kyc_expires_at, kyc_notes')
      .eq('id', arrangerUser.arranger_id)
      .single()

    if (!arranger) {
      return NextResponse.json({ error: 'Arranger not found' }, { status: 404 })
    }

    // Get document counts
    const { data: documents } = await supabase
      .from('arranger_documents')
      .select('document_type')
      .eq('arranger_id', arrangerUser.arranger_id)
      .eq('status', 'active')

    const uploadedTypes = new Set((documents || []).map(d => d.document_type))
    const missingTypes = REQUIRED_DOCUMENT_TYPES.filter(t => !uploadedTypes.has(t))

    return NextResponse.json({
      kyc_status: arranger.kyc_status,
      submitted_at: arranger.kyc_submitted_at,
      approved_at: arranger.kyc_approved_at,
      expires_at: arranger.kyc_expires_at,
      notes: arranger.kyc_notes,
      can_submit: arranger.kyc_status !== 'approved' && arranger.kyc_status !== 'pending',
      documents: {
        required: REQUIRED_DOCUMENT_TYPES,
        uploaded: Array.from(uploadedTypes),
        missing: missingTypes,
        ready: missingTypes.length === 0,
      }
    })

  } catch (error) {
    console.error('KYC status check error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
