/**
 * Placement Agreements API Routes
 * GET /api/placement-agreements - List agreements (role-filtered)
 * POST /api/placement-agreements - Create new agreement
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

const createAgreementSchema = z.object({
  commercial_partner_id: z.string().uuid(),
  agreement_type: z.enum(['referral', 'revenue_share', 'fixed_fee', 'hybrid']),
  default_commission_bps: z.number().min(0).max(10000),
  commission_cap_amount: z.number().nullable().optional(),
  territory: z.string().nullable().optional(),
  deal_types: z.array(z.string()).nullable().optional(),
  exclusivity_level: z.enum(['exclusive', 'non_exclusive', 'semi_exclusive']).nullable().optional(),
  effective_date: z.string().nullable().optional(),
  expiry_date: z.string().nullable().optional(),
  payment_terms: z.enum(['net_15', 'net_30', 'net_45', 'net_60']).nullable().optional(),
})

/**
 * GET /api/placement-agreements
 * List agreements - staff see all, commercial partners see their own
 */
export async function GET(request: NextRequest) {
  try {
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
    const cpPersona = personas?.find((p: any) => p.persona_type === 'commercial_partner')

    // Get query params
    const searchParams = request.nextUrl.searchParams
    const commercialPartnerId = searchParams.get('commercial_partner_id')
    const status = searchParams.get('status')

    let query = serviceSupabase
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
      .order('created_at', { ascending: false })

    // Filter based on role
    if (isStaff) {
      // Staff can see all, optionally filter by commercial_partner_id
      if (commercialPartnerId) {
        query = query.eq('commercial_partner_id', commercialPartnerId)
      }
    } else if (cpPersona) {
      // Commercial partner can only see their own agreements
      const { data: cpUser } = await serviceSupabase
        .from('commercial_partner_users')
        .select('commercial_partner_id')
        .eq('user_id', user.id)
        .single()

      if (!cpUser) {
        return NextResponse.json({ error: 'Not a commercial partner' }, { status: 403 })
      }

      query = query.eq('commercial_partner_id', cpUser.commercial_partner_id)
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Filter by status if provided
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('[placement-agreements] Error:', error)
      return NextResponse.json({ error: 'Failed to fetch agreements' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('[placement-agreements] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/placement-agreements
 * Create new agreement - staff only
 */
export async function POST(request: NextRequest) {
  try {
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
      return NextResponse.json({ error: 'Only staff can create agreements' }, { status: 403 })
    }

    // Parse and validate body
    const body = await request.json()
    const validation = createAgreementSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      )
    }

    const agreementData = validation.data

    // Create agreement with draft status
    const { data, error } = await serviceSupabase
      .from('placement_agreements')
      .insert({
        ...agreementData,
        status: 'draft',
        created_by: user.id,
      })
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
      console.error('[placement-agreements] Create error:', error)
      return NextResponse.json({ error: 'Failed to create agreement' }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('[placement-agreements] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
