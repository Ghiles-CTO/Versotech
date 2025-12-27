/**
 * Initiate Signing for Introducer Agreement
 * POST /api/introducer-agreements/[id]/sign - Create signature request and return signing URL
 *
 * Signing Flow:
 * - If agreement has arranger_id: Arranger signs first → then Introducer
 * - If no arranger_id: CEO signs first → then Introducer
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import crypto from 'crypto'

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

    // Get agreement with introducer and arranger details
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

    // Get arranger info if applicable
    let arrangerEntity = null
    if (agreement.arranger_id) {
      const { data: arranger } = await serviceSupabase
        .from('arranger_entities')
        .select('id, legal_name, company_name')
        .eq('id', agreement.arranger_id)
        .single()
      arrangerEntity = arranger
    }

    // Check user role using persona system
    const { data: personas } = await serviceSupabase.rpc('get_user_personas', {
      p_user_id: user.id,
    })

    const isStaff = personas?.some(
      (p: any) => p.persona_type === 'staff' && ['staff_admin', 'ceo', 'staff_member'].includes(p.role_in_entity)
    )

    // Check if user is an arranger for this agreement
    const arrangerPersona = personas?.find(
      (p: any) => p.persona_type === 'arranger' && p.entity_id === agreement.arranger_id
    )
    const isArrangerForAgreement = !!arrangerPersona && agreement.arranger_id

    // Check if user is an introducer for this agreement
    const introducerPersona = personas?.find(
      (p: any) => p.persona_type === 'introducer' && p.entity_id === agreement.introducer_id
    )
    const isIntroducerForAgreement = !!introducerPersona

    const introducer = agreement.introducer as any
    const hasArranger = !!agreement.arranger_id

    // Handle Arranger signing (status = 'approved', agreement has arranger)
    if (isArrangerForAgreement && agreement.status === 'approved' && hasArranger) {
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
            return NextResponse.json({
              signing_url: `/sign/${existingRequest.signing_token}`,
              pdf_url: agreement.pdf_url,
            })
          }
        }
      }

      // Create new signature request for arranger
      const signingToken = crypto.randomUUID()
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

      const arrangerName = arrangerEntity?.company_name || arrangerEntity?.legal_name || 'Arranger'

      const { data: signatureRequest, error: createError } = await serviceSupabase
        .from('signature_requests')
        .insert({
          investor_id: agreement.introducer_id,
          introducer_id: agreement.introducer_id,
          introducer_agreement_id: agreement.id,
          signer_email: user.email,
          signer_name: user.user_metadata?.full_name || arrangerName,
          document_type: 'introducer_agreement',
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
        console.error('[introducer-agreements/sign] Create arranger signature request error:', createError)
        return NextResponse.json({ error: 'Failed to create signature request' }, { status: 500 })
      }

      // Update agreement with arranger signature request ID and status
      await serviceSupabase
        .from('introducer_agreements')
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

    // Handle CEO signing (status = 'approved', no arranger OR arranger already signed)
    if (isStaff && agreement.status === 'approved' && !hasArranger) {
      // Check if CEO signature request already exists
      if (agreement.ceo_signature_request_id) {
        const { data: existingRequest } = await serviceSupabase
          .from('signature_requests')
          .select('signing_token, token_expires_at, status')
          .eq('id', agreement.ceo_signature_request_id)
          .single()

        if (existingRequest && existingRequest.status === 'pending') {
          const expiresAt = new Date(existingRequest.token_expires_at)
          if (expiresAt > new Date()) {
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
          investor_id: agreement.introducer_id,
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
        console.error('[introducer-agreements/sign] Create CEO signature request error:', createError)
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
        signer_type: 'ceo',
      })
    }

    // Handle Introducer signing (status = 'pending_introducer_signature')
    if (isIntroducerForAgreement && agreement.status === 'pending_introducer_signature') {
      if (agreement.introducer_signature_request_id) {
        const { data: existingRequest } = await serviceSupabase
          .from('signature_requests')
          .select('signing_token, token_expires_at, status')
          .eq('id', agreement.introducer_signature_request_id)
          .single()

        if (existingRequest && existingRequest.status === 'pending') {
          const expiresAt = new Date(existingRequest.token_expires_at)
          if (expiresAt > new Date()) {
            return NextResponse.json({
              signing_url: `/sign/${existingRequest.signing_token}`,
              pdf_url: agreement.signed_pdf_url || agreement.pdf_url,
            })
          }
        }
      }

      return NextResponse.json(
        { error: 'No valid signature request found. Please contact support.' },
        { status: 400 }
      )
    }

    // Provide helpful error messages
    if (isStaff && agreement.status !== 'approved') {
      return NextResponse.json(
        { error: `Cannot sign agreement in status: ${agreement.status}. Must be approved.` },
        { status: 400 }
      )
    }

    if (isArrangerForAgreement && agreement.status !== 'approved') {
      return NextResponse.json(
        { error: `Cannot sign agreement in status: ${agreement.status}. Must be approved.` },
        { status: 400 }
      )
    }

    if (isIntroducerForAgreement && agreement.status !== 'pending_introducer_signature') {
      const firstSigner = hasArranger ? 'Arranger' : 'CEO'
      return NextResponse.json(
        { error: `Cannot sign agreement in status: ${agreement.status}. ${firstSigner} must sign first.` },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Unauthorized to sign this agreement' }, { status: 403 })
  } catch (error) {
    console.error('[introducer-agreements/sign] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
