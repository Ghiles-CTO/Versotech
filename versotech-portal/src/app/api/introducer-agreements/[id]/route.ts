/**
 * Introducer Agreement Detail API Routes
 * GET /api/introducer-agreements/[id] - Get single agreement
 * PATCH /api/introducer-agreements/[id] - Update agreement
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

const updateAgreementSchema = z.object({
  agreement_type: z.enum(['referral', 'revenue_share', 'fixed_fee', 'hybrid']).optional(),
  default_commission_bps: z.number().min(0).max(10000).optional(),
  commission_cap_amount: z.number().nullable().optional(),
  territory: z.string().nullable().optional(),
  deal_types: z.array(z.string()).nullable().optional(),
  exclusivity_level: z.enum(['exclusive', 'non_exclusive', 'semi_exclusive']).nullable().optional(),
  effective_date: z.string().nullable().optional(),
  expiry_date: z.string().nullable().optional(),
  payment_terms: z.enum(['net_15', 'net_30', 'net_45', 'net_60']).nullable().optional(),
  notes: z.string().nullable().optional(),
})

/**
 * GET /api/introducer-agreements/[id]
 * Get single agreement detail
 */
export async function GET(
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

    // Check user personas
    const { data: personas } = await serviceSupabase.rpc('get_user_personas', {
      p_user_id: user.id,
    })

    const isStaff = personas?.some((p: any) => p.persona_type === 'staff')

    // Fetch agreement
    const { data, error } = await serviceSupabase
      .from('introducer_agreements')
      .select(`
        *,
        introducer:introducer_id (
          id,
          legal_name,
          email,
          status,
          contact_name
        ),
        ceo_signature:ceo_signature_request_id (
          id,
          status,
          signed_at
        ),
        introducer_signature:introducer_signature_request_id (
          id,
          status,
          signed_at
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('[introducer-agreements/[id]] Error:', error)
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404 })
    }

    // Check access
    if (!isStaff) {
      // Introducer can only see their own agreements
      const { data: introducerUser } = await serviceSupabase
        .from('introducer_users')
        .select('introducer_id')
        .eq('user_id', user.id)
        .single()

      if (!introducerUser || introducerUser.introducer_id !== data.introducer_id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('[introducer-agreements/[id]] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/introducer-agreements/[id]
 * Update agreement - staff only, only when status is draft
 */
export async function PATCH(
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

    // Check if user is staff
    const { data: personas } = await serviceSupabase.rpc('get_user_personas', {
      p_user_id: user.id,
    })

    const isStaff = personas?.some((p: any) => p.persona_type === 'staff')
    if (!isStaff) {
      return NextResponse.json({ error: 'Only staff can update agreements' }, { status: 403 })
    }

    // Check current status
    const { data: existing, error: fetchError } = await serviceSupabase
      .from('introducer_agreements')
      .select('status')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404 })
    }

    if (existing.status !== 'draft') {
      return NextResponse.json(
        { error: 'Can only edit agreements in draft status' },
        { status: 400 }
      )
    }

    // Parse and validate body
    const body = await request.json()
    const validation = updateAgreementSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      )
    }

    // Update agreement
    const { data, error } = await serviceSupabase
      .from('introducer_agreements')
      .update({
        ...validation.data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        introducer:introducer_id (
          id,
          legal_name,
          email
        )
      `)
      .single()

    if (error) {
      console.error('[introducer-agreements/[id]] Update error:', error)
      return NextResponse.json({ error: 'Failed to update agreement' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('[introducer-agreements/[id]] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
