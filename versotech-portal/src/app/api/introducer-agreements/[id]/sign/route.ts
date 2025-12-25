/**
 * Initiate Signing for Introducer Agreement
 * POST /api/introducer-agreements/[id]/sign - Create signature request and return signing URL
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import crypto from 'crypto'

/**
 * POST /api/introducer-agreements/[id]/sign
 * Initiates signing for an introducer agreement
 * - For staff (CEO): Creates signature request for party_a (CEO signs first)
 * - For introducer: Returns existing signature request URL if available
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serviceSupabase = createServiceClient()

    // Get agreement with introducer details
    const { data: agreement, error: fetchError } = await serviceSupabase
      .from('introducer_agreements')
      .select(`
        *,
        introducer:introducer_id (
          id,
          legal_name,
          email,
          contact_name
        )
      `)
      .eq('id', id)
      .single()

    if (fetchError || !agreement) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404 })
    }

    // Check user role using persona system for consistency
    const { data: personas } = await serviceSupabase.rpc('get_user_personas', {
      p_user_id: user.id,
    })

    const isStaff = personas?.some(
      (p: any) => p.persona_type === 'staff' && ['staff_admin', 'ceo', 'staff_member'].includes(p.role_in_entity)
    )

    // Check if user is an introducer for this agreement
    const introducerPersona = personas?.find(
      (p: any) => p.persona_type === 'introducer' && p.entity_id === agreement.introducer_id
    )
    const isIntroducerForAgreement = !!introducerPersona

    const introducer = agreement.introducer as any

    // Handle CEO signing (status = 'approved')
    if (isStaff && agreement.status === 'approved') {
      // Check if CEO signature request already exists
      if (agreement.ceo_signature_request_id) {
        // Get existing signature request
        const { data: existingRequest } = await serviceSupabase
          .from('signature_requests')
          .select('signing_token, token_expires_at, status')
          .eq('id', agreement.ceo_signature_request_id)
          .single()

        if (existingRequest && existingRequest.status === 'pending') {
          const expiresAt = new Date(existingRequest.token_expires_at)
          if (expiresAt > new Date()) {
            // Return existing valid URL
            return NextResponse.json({
              signing_url: `/sign/${existingRequest.signing_token}`,
              pdf_url: agreement.pdf_url,
            })
          }
        }
      }

      // Create new signature request for CEO
      const signingToken = crypto.randomUUID()
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

      const { data: signatureRequest, error: createError } = await serviceSupabase
        .from('signature_requests')
        .insert({
          investor_id: agreement.introducer_id, // Using introducer_id here for compatibility
          introducer_id: agreement.introducer_id,
          introducer_agreement_id: agreement.id,
          signer_email: user.email,
          signer_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'CEO',
          document_type: 'introducer_agreement',
          signer_role: 'admin',
          signature_position: 'party_a',
          signing_token: signingToken,
          token_expires_at: expiresAt.toISOString(),
          unsigned_pdf_path: agreement.pdf_url,
          status: 'pending',
          created_by: user.id,
        })
        .select('id')
        .single()

      if (createError || !signatureRequest) {
        console.error('[introducer-agreements/sign] Create signature request error:', createError)
        return NextResponse.json({ error: 'Failed to create signature request' }, { status: 500 })
      }

      // Update agreement with CEO signature request ID and status
      await serviceSupabase
        .from('introducer_agreements')
        .update({
          ceo_signature_request_id: signatureRequest.id,
          status: 'pending_ceo_signature',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      return NextResponse.json({
        signing_url: `/sign/${signingToken}`,
        pdf_url: agreement.pdf_url,
        expires_at: expiresAt.toISOString(),
      })
    }

    // Handle Introducer signing (status = 'pending_introducer_signature')
    if (isIntroducerForAgreement && agreement.status === 'pending_introducer_signature') {
      // Get existing signature request for introducer
      if (agreement.introducer_signature_request_id) {
        const { data: existingRequest } = await serviceSupabase
          .from('signature_requests')
          .select('signing_token, token_expires_at, status')
          .eq('id', agreement.introducer_signature_request_id)
          .single()

        if (existingRequest && existingRequest.status === 'pending') {
          const expiresAt = new Date(existingRequest.token_expires_at)
          if (expiresAt > new Date()) {
            // Return existing valid URL
            return NextResponse.json({
              signing_url: `/sign/${existingRequest.signing_token}`,
              pdf_url: agreement.signed_pdf_url || agreement.pdf_url, // Use CEO-signed version if available
            })
          }
        }
      }

      // If no valid signature request exists, this is an error state
      // The signature request should have been created when CEO signed
      return NextResponse.json(
        { error: 'No valid signature request found. Please contact support.' },
        { status: 400 }
      )
    }

    // Invalid state or unauthorized
    if (isStaff && agreement.status !== 'approved') {
      return NextResponse.json(
        { error: `Cannot sign agreement in status: ${agreement.status}. Must be approved.` },
        { status: 400 }
      )
    }

    if (isIntroducerForAgreement && agreement.status !== 'pending_introducer_signature') {
      return NextResponse.json(
        { error: `Cannot sign agreement in status: ${agreement.status}. CEO must sign first.` },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Unauthorized to sign this agreement' }, { status: 403 })
  } catch (error) {
    console.error('[introducer-agreements/sign] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
