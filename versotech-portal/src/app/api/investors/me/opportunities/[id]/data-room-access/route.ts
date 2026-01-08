import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/investors/me/opportunities/:id/data-room-access
 * Check and grant data room access if all NDA signatories have signed
 * This endpoint is called after signature completion webhooks
 */
export async function POST(request: Request, { params }: RouteParams) {
  const { id: dealId } = await params
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get investor ID
    const { data: investorLinks } = await serviceSupabase
      .from('investor_users')
      .select('investor_id')
      .eq('user_id', user.id)

    if (!investorLinks || investorLinks.length === 0) {
      return NextResponse.json({ error: 'No investor profile found' }, { status: 404 })
    }

    const investorId = investorLinks[0].investor_id

    // Check membership (use user_id for PK)
    // Use maybeSingle as membership might not exist
    const { data: membership } = await serviceSupabase
      .from('deal_memberships')
      .select('*')
      .eq('deal_id', dealId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this deal' }, { status: 403 })
    }

    // Enforce persona restrictions: introducers and lawyers never get data room access
    if (membership.role === 'introducer' || membership.role === 'lawyer') {
      return NextResponse.json({ error: 'Data room access not available for this role' }, { status: 403 })
    }

    // If already has access, return current status
    if (membership.data_room_granted_at) {
      const { data: accessRecord } = await serviceSupabase
        .from('deal_data_room_access')
        .select('*')
        .eq('deal_id', dealId)
        .eq('investor_id', investorId)
        .is('revoked_at', null)
        .single()

      return NextResponse.json({
        has_access: true,
        granted_at: membership.data_room_granted_at,
        expires_at: accessRecord?.expires_at,
        message: 'Data room access already granted'
      })
    }

    // Check NDA signature status FOR THIS DEAL
    const { data: signatureRequests } = await serviceSupabase
      .from('signature_requests')
      .select('id, status')
      .eq('investor_id', investorId)
      .eq('deal_id', dealId)
      .eq('document_type', 'nda')

    if (!signatureRequests || signatureRequests.length === 0) {
      return NextResponse.json({
        has_access: false,
        message: 'NDA signing has not been initiated'
      })
    }

    const allSigned = signatureRequests.every(r => r.status === 'signed')

    if (!allSigned) {
      const pending = signatureRequests.filter(r => r.status !== 'signed').length
      return NextResponse.json({
        has_access: false,
        message: `Waiting for ${pending} signatory(ies) to complete NDA signing`,
        pending_signatures: pending,
        total_signatures: signatureRequests.length
      })
    }

    // All signed - grant data room access
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days default

    // Update membership (use user_id for PK)
    await serviceSupabase
      .from('deal_memberships')
      .update({
        nda_signed_at: now.toISOString(),
        data_room_granted_at: now.toISOString()
      })
      .eq('deal_id', dealId)
      .eq('user_id', user.id)

    // Create data room access record
    const { error: accessError } = await serviceSupabase
      .from('deal_data_room_access')
      .insert({
        deal_id: dealId,
        investor_id: investorId,
        granted_by: user.id,
        granted_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        auto_granted: true, // Auto-granted after NDA completion
        notes: 'Auto-granted after all NDA signatories signed'
      })

    if (accessError) {
      console.error('Error granting data room access:', accessError)
      return NextResponse.json({ error: 'Failed to grant access' }, { status: 500 })
    }

    // Log audit event
    await serviceSupabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: 'data_room_access_granted',
        entity_type: 'deal_data_room_access',
        entity_id: dealId,
        details: {
          deal_id: dealId,
          investor_id: investorId,
          auto_granted: true,
          expires_at: expiresAt.toISOString()
        },
        created_at: now.toISOString()
      })

    return NextResponse.json({
      success: true,
      has_access: true,
      granted_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      message: 'Data room access granted'
    })
  } catch (error) {
    console.error('Unexpected error in POST /api/investors/me/opportunities/:id/data-room-access:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/investors/me/opportunities/:id/data-room-access
 * Get data room access status
 */
export async function GET(request: Request, { params }: RouteParams) {
  const { id: dealId } = await params
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get investor ID
    const { data: investorLinks } = await serviceSupabase
      .from('investor_users')
      .select('investor_id')
      .eq('user_id', user.id)

    if (!investorLinks || investorLinks.length === 0) {
      return NextResponse.json({ error: 'No investor profile found' }, { status: 404 })
    }

    const investorId = investorLinks[0].investor_id

    // Enforce persona restrictions before returning access
    const { data: membership } = await serviceSupabase
      .from('deal_memberships')
      .select('role')
      .eq('deal_id', dealId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (membership?.role === 'introducer' || membership?.role === 'lawyer') {
      return NextResponse.json({ error: 'Data room access not available for this role' }, { status: 403 })
    }

    // Get access record (use maybeSingle as access might not exist)
    const { data: accessRecord } = await serviceSupabase
      .from('deal_data_room_access')
      .select('*')
      .eq('deal_id', dealId)
      .eq('investor_id', investorId)
      .is('revoked_at', null)
      .order('granted_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!accessRecord) {
      return NextResponse.json({
        has_access: false,
        message: 'No data room access'
      })
    }

    // Check if expired
    const isExpired = accessRecord.expires_at && new Date(accessRecord.expires_at) < new Date()

    return NextResponse.json({
      has_access: !isExpired,
      is_expired: isExpired,
      granted_at: accessRecord.granted_at,
      expires_at: accessRecord.expires_at,
      auto_granted: accessRecord.auto_granted
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/investors/me/opportunities/:id/data-room-access:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
