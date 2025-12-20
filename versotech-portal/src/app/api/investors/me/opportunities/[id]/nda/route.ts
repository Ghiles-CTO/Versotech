import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/investors/me/opportunities/:id/nda
 * Initiate NDA signing flow for an opportunity
 * Creates signature requests for all authorized signatories
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

    // Check membership exists and interest is confirmed (use user_id for PK)
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

    if (!membership.interest_confirmed_at) {
      return NextResponse.json({ error: 'Must express interest before signing NDA' }, { status: 400 })
    }

    if (membership.nda_signed_at) {
      return NextResponse.json({ error: 'NDA already signed' }, { status: 400 })
    }

    // Get authorized signatories (members marked as is_signatory OR with authorized_signatory role for backwards compat)
    const { data: signatories } = await serviceSupabase
      .from('investor_members')
      .select('id, full_name, email, is_signatory')
      .eq('investor_id', investorId)
      .eq('is_active', true)
      .or('is_signatory.eq.true,role.eq.authorized_signatory')

    if (!signatories || signatories.length === 0) {
      return NextResponse.json({
        error: 'No authorized signatories found. Please add signatories to your profile.'
      }, { status: 400 })
    }

    // Check for existing pending NDA signature requests FOR THIS DEAL
    const { data: existingRequests } = await serviceSupabase
      .from('signature_requests')
      .select('id, signer_email, status')
      .eq('investor_id', investorId)
      .eq('deal_id', dealId)
      .eq('document_type', 'nda')
      .in('status', ['pending', 'sent', 'viewed'])

    if (existingRequests && existingRequests.length > 0) {
      return NextResponse.json({
        message: 'NDA signing already in progress',
        pending_signatures: existingRequests.length,
        signatories: existingRequests.map(r => ({
          email: r.signer_email,
          status: r.status
        }))
      })
    }

    // Create signature requests for each signatory
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days

    const signatureRequests = signatories.map((sig, index) => ({
      investor_id: investorId,
      deal_id: dealId, // Scope NDA to specific deal
      member_id: sig.id, // Track which specific member/signatory
      signer_email: sig.email,
      signer_name: sig.full_name,
      signer_role: 'authorized_signatory',
      document_type: 'nda',
      signing_token: crypto.randomBytes(32).toString('hex'),
      token_expires_at: expiresAt.toISOString(),
      signature_position: `signatory_${index + 1}`,
      status: 'pending',
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      created_by: user.id
    }))

    // Pre-create entries in deal_signatory_ndas for tracking
    const signatoryNdaEntries = signatories.map(sig => ({
      deal_id: dealId,
      investor_id: investorId,
      member_id: sig.id,
      user_id: user.id,
      signed_at: null // Will be updated when signed
    }))

    // Insert signatory NDA tracking entries (ignore conflicts)
    await serviceSupabase
      .from('deal_signatory_ndas')
      .upsert(signatoryNdaEntries, { onConflict: 'deal_id,member_id', ignoreDuplicates: true })

    const { data: createdRequests, error: createError } = await serviceSupabase
      .from('signature_requests')
      .insert(signatureRequests)
      .select()

    if (createError) {
      console.error('Error creating signature requests:', createError)
      return NextResponse.json({ error: 'Failed to create signature requests' }, { status: 500 })
    }

    // Log audit event
    await serviceSupabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: 'nda_initiated',
        entity_type: 'deal_membership',
        entity_id: dealId,
        details: {
          deal_id: dealId,
          investor_id: investorId,
          signatories_count: signatories.length,
          expires_at: expiresAt.toISOString()
        },
        created_at: now.toISOString()
      })

    return NextResponse.json({
      success: true,
      message: 'NDA signing initiated',
      signature_requests: createdRequests?.length || 0,
      signatories: signatories.map(s => ({
        name: s.full_name,
        email: s.email
      })),
      expires_at: expiresAt.toISOString()
    })
  } catch (error) {
    console.error('Unexpected error in POST /api/investors/me/opportunities/:id/nda:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/investors/me/opportunities/:id/nda
 * Get NDA signing status for an opportunity
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

    // Get membership status (use user_id for PK)
    const { data: membership } = await serviceSupabase
      .from('deal_memberships')
      .select('nda_signed_at, data_room_granted_at')
      .eq('deal_id', dealId)
      .eq('user_id', user.id)
      .single()

    // Get signature requests FOR THIS DEAL
    const { data: signatureRequests } = await serviceSupabase
      .from('signature_requests')
      .select('id, signer_name, signer_email, status, signature_timestamp, created_at')
      .eq('investor_id', investorId)
      .eq('deal_id', dealId)
      .eq('document_type', 'nda')
      .order('created_at', { ascending: true })

    const allSigned = signatureRequests?.every(r => r.status === 'signed') ?? false
    const pendingCount = signatureRequests?.filter(r => r.status === 'pending' || r.status === 'sent').length ?? 0
    const signedCount = signatureRequests?.filter(r => r.status === 'signed').length ?? 0

    return NextResponse.json({
      nda_signed: !!membership?.nda_signed_at,
      nda_signed_at: membership?.nda_signed_at,
      data_room_granted: !!membership?.data_room_granted_at,
      data_room_granted_at: membership?.data_room_granted_at,
      signature_status: {
        total: signatureRequests?.length ?? 0,
        signed: signedCount,
        pending: pendingCount,
        all_signed: allSigned
      },
      signatures: signatureRequests?.map(r => ({
        name: r.signer_name,
        email: r.signer_email,
        status: r.status,
        signed_at: r.signature_timestamp
      })) ?? []
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/investors/me/opportunities/:id/nda:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
