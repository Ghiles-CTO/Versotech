/**
 * Placement Agreement Detail API Routes
 * GET /api/placement-agreements/[id] - Get single agreement
 * PATCH /api/placement-agreements/[id] - Update agreement (draft only)
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
})

/**
 * GET /api/placement-agreements/[id]
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

    // Get agreement with commercial partner info
    const { data: agreement, error } = await serviceSupabase
      .from('placement_agreements')
      .select(`
        *,
        commercial_partner:commercial_partner_id (
          id,
          legal_name,
          display_name,
          email,
          status
        )
      `)
      .eq('id', id)
      .single()

    if (error || !agreement) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404 })
    }

    // If not staff, check if user is the commercial partner
    if (!isStaff) {
      const { data: cpUser } = await serviceSupabase
        .from('commercial_partner_users')
        .select('commercial_partner_id')
        .eq('user_id', user.id)
        .single()

      if (!cpUser || cpUser.commercial_partner_id !== agreement.commercial_partner_id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
    }

    return NextResponse.json({ data: agreement })
  } catch (error) {
    console.error('[placement-agreements/[id]] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/placement-agreements/[id]
 * Update agreement - staff only, draft status only
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

    // Get existing agreement
    const { data: agreement, error: fetchError } = await serviceSupabase
      .from('placement_agreements')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !agreement) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404 })
    }

    if (agreement.status !== 'draft') {
      return NextResponse.json(
        { error: 'Can only update agreements in draft status' },
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
      .from('placement_agreements')
      .update({
        ...validation.data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        commercial_partner:commercial_partner_id (
          id,
          legal_name,
          display_name,
          email
        )
      `)
      .single()

    if (error) {
      console.error('[placement-agreements/[id]] Update error:', error)
      return NextResponse.json({ error: 'Failed to update agreement' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('[placement-agreements/[id]] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
