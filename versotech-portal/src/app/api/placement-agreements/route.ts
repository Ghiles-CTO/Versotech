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
 * List agreements - staff see all, arrangers see their own, commercial partners see their own
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
    const arrangerPersona = personas?.find((p: any) => p.persona_type === 'arranger')

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
    } else if (arrangerPersona) {
      // Arranger can see agreements they created
      const { data: arrangerUser } = await serviceSupabase
        .from('arranger_users')
        .select('arranger_id')
        .eq('user_id', user.id)
        .single()

      if (arrangerUser) {
        query = query.eq('arranger_id', arrangerUser.arranger_id)
        // Optionally filter by commercial_partner_id within their agreements
        if (commercialPartnerId) {
          query = query.eq('commercial_partner_id', commercialPartnerId)
        }
      } else {
        return NextResponse.json({ error: 'Arranger entity not found' }, { status: 403 })
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
 * Create new agreement - staff or arrangers
 * Staff: Creates with 'draft' status (can send directly)
 * Arrangers: Creates with 'pending_internal_approval' status (requires CEO approval first)
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

    // Check user personas
    const { data: personas } = await serviceSupabase.rpc('get_user_personas', {
      p_user_id: user.id,
    })

    const isStaff = personas?.some((p: any) => p.persona_type === 'staff')
    const arrangerPersona = personas?.find((p: any) => p.persona_type === 'arranger')

    // Must be either staff or arranger
    if (!isStaff && !arrangerPersona) {
      return NextResponse.json({ error: 'Only staff or arrangers can create agreements' }, { status: 403 })
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

    // Determine status and arranger_id based on creator role
    let initialStatus = 'draft'
    let arrangerId = null

    if (arrangerPersona && !isStaff) {
      // Arranger-created agreements require internal approval first
      const { data: arrangerUser } = await serviceSupabase
        .from('arranger_users')
        .select('arranger_id')
        .eq('user_id', user.id)
        .single()

      if (!arrangerUser) {
        return NextResponse.json({ error: 'Arranger entity not found' }, { status: 403 })
      }

      arrangerId = arrangerUser.arranger_id
      initialStatus = 'pending_internal_approval'
    }

    // Create agreement
    const { data, error } = await serviceSupabase
      .from('placement_agreements')
      .insert({
        ...agreementData,
        status: initialStatus,
        created_by: user.id,
        arranger_id: arrangerId,
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

    // If arranger-created, notify CEO/staff_admin users for approval
    if (initialStatus === 'pending_internal_approval') {
      try {
        // Get arranger entity name for notification
        const { data: arrangerEntity } = await serviceSupabase
          .from('arranger_entities')
          .select('legal_name')
          .eq('id', arrangerId)
          .single()

        // Get commercial partner name
        const cp = Array.isArray(data.commercial_partner) ? data.commercial_partner[0] : data.commercial_partner

        // Find CEO/staff_admin users to notify
        const { data: staffAdmins } = await serviceSupabase
          .from('profiles')
          .select('id')
          .in('role', ['staff_admin', 'ceo'])
          .limit(5)

        if (staffAdmins && staffAdmins.length > 0) {
          const notifications = staffAdmins.map((admin: any) => ({
            user_id: admin.id,
            investor_id: null,
            title: 'Placement Agreement Pending Approval',
            message: `${arrangerEntity?.legal_name || 'An arranger'} has created a placement agreement with ${cp?.legal_name || 'a commercial partner'} that requires your approval.`,
            link: `/versotech_main/placement-agreements/${data.id}`,
          }))

          await serviceSupabase.from('investor_notifications').insert(notifications)
        }
      } catch (notifyError) {
        // Don't fail the request if notification fails
        console.error('[placement-agreements] Notification error:', notifyError)
      }
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('[placement-agreements] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
