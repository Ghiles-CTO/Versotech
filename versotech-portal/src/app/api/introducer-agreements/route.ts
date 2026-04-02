/**
 * Introducer Agreements API Routes
 * GET /api/introducer-agreements - List agreements (role-filtered)
 * POST /api/introducer-agreements - Legacy endpoint disabled
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'
import {
  readActivePersonaCookieValues,
  resolveActiveIntroducerLink,
} from '@/lib/kyc/active-introducer-link'

/**
 * GET /api/introducer-agreements
 * List agreements - staff see all, arrangers see their own, introducers see their own
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
    const introducerPersona = personas?.find((p: any) => p.persona_type === 'introducer')
    const arrangerPersona = personas?.find((p: any) => p.persona_type === 'arranger')
    const { cookiePersonaType, cookiePersonaId } = readActivePersonaCookieValues(request.cookies)

    // Get query params
    const searchParams = request.nextUrl.searchParams
    const introducerId = searchParams.get('introducer_id')
    const status = searchParams.get('status')

    let query = serviceSupabase
      .from('introducer_agreements')
      .select(`
        *,
        introducer:introducer_id (
          id,
          legal_name,
          email,
          status
        ),
        arranger:arranger_id (
          id,
          legal_name,
          company_name
        )
      `)
      .order('created_at', { ascending: false })

    // Filter based on role
    const activeArrangerPersona =
      cookiePersonaType === 'arranger'
        ? personas?.find((p: any) => p.persona_type === 'arranger' && p.entity_id === cookiePersonaId)
        : null

    if (cookiePersonaType === 'introducer' && introducerPersona) {
      const { link: introducerUser, error: introducerUserError } = await resolveActiveIntroducerLink<{
        introducer_id: string
      }>({
        supabase: serviceSupabase,
        userId: user.id,
        cookiePersonaType,
        cookiePersonaId,
        select: 'introducer_id',
      })

      if (introducerUserError || !introducerUser) {
        return NextResponse.json({ error: 'Not an introducer' }, { status: 403 })
      }

      query = query.eq('introducer_id', introducerUser.introducer_id)
    } else if (cookiePersonaType === 'arranger' && activeArrangerPersona) {
      query = query.eq('arranger_id', activeArrangerPersona.entity_id)
    } else if (isStaff) {
      // Staff can see all, optionally filter by introducer_id
      if (introducerId) {
        query = query.eq('introducer_id', introducerId)
      }
    } else if (arrangerPersona) {
      // Arranger can see agreements they are linked to
      query = query.eq('arranger_id', arrangerPersona.entity_id)
    } else if (introducerPersona) {
      // Introducer can only see their own agreements
      const { link: introducerUser, error: introducerUserError } = await resolveActiveIntroducerLink<{
        introducer_id: string
      }>({
        supabase: serviceSupabase,
        userId: user.id,
        cookiePersonaType,
        cookiePersonaId,
        select: 'introducer_id',
      })

      if (introducerUserError || !introducerUser) {
        return NextResponse.json({ error: 'Not an introducer' }, { status: 403 })
      }

      query = query.eq('introducer_id', introducerUser.introducer_id)
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Filter by status if provided
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('[introducer-agreements] Error:', error)
      return NextResponse.json({ error: 'Failed to fetch agreements' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('[introducer-agreements] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/introducer-agreements
 * Legacy manual agreement creation is disabled.
 */
export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      error: 'Standalone introducer agreements are disabled. Generate the agreement from a deal fee plan instead.',
    },
    { status: 410 }
  )
}
