/**
 * Initiate Signing for Placement Agreement
 * POST /api/placement-agreements/[id]/sign - Create signature request and return signing URL
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import crypto from 'crypto'

/**
 * POST /api/placement-agreements/[id]/sign
 * Initiates signing for a placement agreement
 * - For staff (CEO): Creates signature request for party_a (CEO signs first)
 * - For commercial partner: Returns existing signature request URL if available
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

    // Get agreement with commercial partner details
    const { data: agreement, error: fetchError } = await serviceSupabase
      .from('placement_agreements')
      .select(`
        *,
        commercial_partner:commercial_partner_id (
          id,
          legal_name,
          display_name,
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

    // Check if user is a commercial partner for this agreement
    const cpPersona = personas?.find(
      (p: any) => p.persona_type === 'commercial_partner' && p.entity_id === agreement.commercial_partner_id
    )
    const isCpForAgreement = !!cpPersona

    // Check if user is an arranger for this agreement
    const isArranger = personas?.some((p: any) => p.persona_type === 'arranger')
    let arrangerIds: string[] = []
    if (isArranger) {
      const { data: arrangerLinks } = await serviceSupabase
        .from('arranger_users')
        .select('arranger_id')
        .eq('user_id', user.id)
      arrangerIds = arrangerLinks?.map((link: any) => link.arranger_id) || []
    }
    const isArrangerForAgreement = isArranger && agreement.arranger_id && arrangerIds.includes(agreement.arranger_id)

    const cp = agreement.commercial_partner as any

    // Handle Arranger signing (status = 'approved', agreement has arranger_id)
    // Arranger signs INSTEAD of CEO for agreements where they are the arranger
    if (isArrangerForAgreement && agreement.status === 'approved') {
      // Check if arranger signature request already exists
      if (agreement.arranger_signature_request_id) {
        const { data: existingRequest } = await serviceSupabase
          .from('signature_requests')
          .select('signing_token, token_expires_at, status')
          .eq('id', agreement.arranger_signature_request_id)
          .single()

        if (existingRequest && existingRequest.status === 'pending') {
          const expiresAt = new Date(existingRequest.token_expires_at)
          if (expiresAt > new Date()) {
            // Return existing valid URL
            return NextResponse.json({
              signing_url: `/sign/${existingRequest.signing_token}`,
              pdf_url: agreement.pdf_url,
              signer_type: 'arranger',
            })
          }
        }
      }

      // Create new signature request for Arranger
      const signingToken = crypto.randomUUID()
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

      const { data: signatureRequest, error: createError } = await serviceSupabase
        .from('signature_requests')
        .insert({
          placement_id: agreement.commercial_partner_id,
          placement_agreement_id: agreement.id,
          signer_email: user.email,
          signer_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Arranger',
          document_type: 'placement_agreement',
          signer_role: 'arranger',
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
        console.error('[placement-agreements/sign] Create arranger signature request error:', createError)
        return NextResponse.json({ error: 'Failed to create signature request' }, { status: 500 })
      }

      // Update agreement with arranger signature request ID and status
      await serviceSupabase
        .from('placement_agreements')
        .update({
          arranger_signature_request_id: signatureRequest.id,
          status: 'pending_arranger_signature',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      return NextResponse.json({
        signing_url: `/sign/${signingToken}`,
        pdf_url: agreement.pdf_url,
        expires_at: expiresAt.toISOString(),
        signer_type: 'arranger',
      })
    }

    // Handle CEO signing (status = 'approved', NO arranger_id - arranger agreements must be signed by arranger)
    if (isStaff && agreement.status === 'approved' && !agreement.arranger_id) {
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
          placement_id: agreement.commercial_partner_id, // Using CP ID for linkage
          placement_agreement_id: agreement.id,
          signer_email: user.email,
          signer_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'CEO',
          document_type: 'placement_agreement',
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
        console.error('[placement-agreements/sign] Create signature request error:', createError)
        return NextResponse.json({ error: 'Failed to create signature request' }, { status: 500 })
      }

      // Update agreement with CEO signature request ID and status
      await serviceSupabase
        .from('placement_agreements')
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

    // Handle Commercial Partner signing (status = 'pending_cp_signature')
    if (isCpForAgreement && agreement.status === 'pending_cp_signature') {
      // Get existing signature request for commercial partner
      if (agreement.cp_signature_request_id) {
        const { data: existingRequest } = await serviceSupabase
          .from('signature_requests')
          .select('signing_token, token_expires_at, status')
          .eq('id', agreement.cp_signature_request_id)
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

    if (isCpForAgreement && agreement.status !== 'pending_cp_signature') {
      return NextResponse.json(
        { error: `Cannot sign agreement in status: ${agreement.status}. CEO must sign first.` },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Unauthorized to sign this agreement' }, { status: 403 })
  } catch (error) {
    console.error('[placement-agreements/sign] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
