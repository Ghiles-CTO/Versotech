import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'
import { NextResponse } from 'next/server'

/**
 * POST /api/test/complete-signature
 * Manually complete a signature request for E2E testing
 * Test-only endpoint - requires staff authentication
 */
export async function POST(request: Request) {
  try {
    const authSupabase = await createClient()
    const { user, error: authError } = await getAuthenticatedUser(authSupabase)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isStaff = await isStaffUser(authSupabase, user)
    if (!isStaff) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    const body = await request.json()
    const { signature_request_id, signer_email } = body

    if (!signature_request_id && !signer_email) {
      return NextResponse.json({
        error: 'Either signature_request_id or signer_email required'
      }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Find the signature request
    let query = supabase
      .from('signature_requests')
      .select('id, signer_email, signer_name, status, document_type, deal_id, investor_id')

    if (signature_request_id) {
      query = query.eq('id', signature_request_id)
    } else if (signer_email) {
      query = query.eq('signer_email', signer_email).eq('status', 'pending')
    }

    const { data: sigRequest, error: findError } = await query.maybeSingle()

    if (findError || !sigRequest) {
      return NextResponse.json({
        error: 'Signature request not found',
        details: findError?.message
      }, { status: 404 })
    }

    if (sigRequest.status === 'signed') {
      return NextResponse.json({
        message: 'Signature already completed',
        signature_request: sigRequest
      })
    }

    // Update the signature request to signed status
    const now = new Date().toISOString()
    const { error: updateError } = await supabase
      .from('signature_requests')
      .update({
        status: 'signed',
        updated_at: now
      })
      .eq('id', sigRequest.id)

    if (updateError) {
      return NextResponse.json({
        error: 'Failed to update signature request',
        details: updateError.message
      }, { status: 500 })
    }

    // Mark related task as completed
    await supabase
      .from('tasks')
      .update({
        status: 'completed',
        completed_at: now
      })
      .eq('related_entity_type', 'signature_request')
      .eq('related_entity_id', sigRequest.id)

    // Check if this completes an NDA (all signatories signed)
    if (sigRequest.document_type === 'nda' && sigRequest.deal_id && sigRequest.investor_id) {
      const { data: allNdaSignatures } = await supabase
        .from('signature_requests')
        .select('id, status')
        .eq('deal_id', sigRequest.deal_id)
        .eq('investor_id', sigRequest.investor_id)
        .eq('document_type', 'nda')

      const allSigned = allNdaSignatures?.every(sig => sig.status === 'signed')

      if (allSigned) {
        // Update deal_memberships with nda_signed_at
        const { data: investorUsers } = await supabase
          .from('investor_users')
          .select('user_id')
          .eq('investor_id', sigRequest.investor_id)

        if (investorUsers && investorUsers.length > 0) {
          for (const iu of investorUsers) {
            await supabase
              .from('deal_memberships')
              .update({
                nda_signed_at: now,
                data_room_granted_at: now
              })
              .eq('deal_id', sigRequest.deal_id)
              .eq('user_id', iu.user_id)
          }
        }

        // Grant data room access
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        await supabase
          .from('deal_data_room_access')
          .upsert({
            deal_id: sigRequest.deal_id,
            investor_id: sigRequest.investor_id,
            granted_at: now,
            expires_at: expiresAt,
            auto_granted: true
          }, { onConflict: 'deal_id,investor_id' })

        return NextResponse.json({
          message: 'Signature completed and NDA fully signed',
          signature_request_id: sigRequest.id,
          nda_complete: true,
          data_room_access_granted: true
        })
      }
    }

    return NextResponse.json({
      message: 'Signature completed',
      signature_request_id: sigRequest.id,
      signer_email: sigRequest.signer_email,
      signer_name: sigRequest.signer_name,
      document_type: sigRequest.document_type
    })
  } catch (error) {
    console.error('Test complete-signature error:', error)
    return NextResponse.json({
      error: 'Internal error',
      details: String(error)
    }, { status: 500 })
  }
}

/**
 * GET /api/test/complete-signature
 * List pending signature requests for E2E testing
 */
export async function GET(request: Request) {
  try {
    const authSupabase = await createClient()
    const { user, error: authError } = await getAuthenticatedUser(authSupabase)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isStaff = await isStaffUser(authSupabase, user)
    if (!isStaff) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    const supabase = createServiceClient()

    const { data: pendingSignatures, error } = await supabase
      .from('signature_requests')
      .select('id, signer_email, signer_name, status, document_type, deal_id, investor_id, created_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      pending_signatures: pendingSignatures,
      count: pendingSignatures?.length || 0
    })
  } catch (error) {
    console.error('Test list signatures error:', error)
    return NextResponse.json({
      error: 'Internal error',
      details: String(error)
    }, { status: 500 })
  }
}
