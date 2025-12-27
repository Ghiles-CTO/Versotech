/**
 * Arranger Profile API
 * GET /api/arrangers/me/profile - Get arranger's own profile
 * PUT /api/arrangers/me/profile - Request profile update (creates approval request)
 */

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const profileUpdateSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().max(50).optional(),
  address: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
})

/**
 * GET /api/arrangers/me/profile
 * Returns the current arranger's profile
 */
export async function GET() {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find arranger entity for current user
    const { data: arrangerUser, error: arrangerUserError } = await serviceSupabase
      .from('arranger_users')
      .select('arranger_id, role, is_active')
      .eq('user_id', user.id)
      .maybeSingle()

    if (arrangerUserError || !arrangerUser?.arranger_id) {
      return NextResponse.json({ error: 'Arranger profile not found' }, { status: 404 })
    }

    // Get arranger entity details
    const { data: arranger, error: arrangerError } = await serviceSupabase
      .from('arranger_entities')
      .select('*')
      .eq('id', arrangerUser.arranger_id)
      .single()

    if (arrangerError || !arranger) {
      return NextResponse.json({ error: 'Arranger entity not found' }, { status: 404 })
    }

    // Get user profile info
    const { data: profile } = await serviceSupabase
      .from('profiles')
      .select('full_name, email, avatar_url')
      .eq('id', user.id)
      .maybeSingle()

    return NextResponse.json({
      arranger,
      arrangerUser: {
        role: arrangerUser.role,
        is_active: arrangerUser.is_active,
      },
      profile,
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/arrangers/me/profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PUT /api/arrangers/me/profile
 * Request a profile update - creates an approval request for staff to review
 */
export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find arranger entity for current user
    const { data: arrangerUser, error: arrangerUserError } = await serviceSupabase
      .from('arranger_users')
      .select('arranger_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (arrangerUserError || !arrangerUser?.arranger_id) {
      return NextResponse.json({ error: 'Arranger profile not found' }, { status: 404 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = profileUpdateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      )
    }

    const updateData = validation.data

    // Get current arranger info for the request
    const { data: arranger } = await serviceSupabase
      .from('arranger_entities')
      .select('legal_name, company_name')
      .eq('id', arrangerUser.arranger_id)
      .single()

    // Create approval request for staff to review
    const { data: approval, error: approvalError } = await serviceSupabase
      .from('approvals')
      .insert({
        entity_type: 'arranger_profile_update',
        entity_id: arrangerUser.arranger_id,
        action: 'update',
        status: 'pending',
        requested_by: user.id,
        request_reason: updateData.notes || 'Profile update request',
        entity_metadata: {
          arranger_name: arranger?.company_name || arranger?.legal_name,
          requested_changes: updateData,
          current_email: arranger?.company_name,
        },
        priority: 'normal',
      })
      .select()
      .single()

    if (approvalError) {
      console.error('Error creating approval request:', approvalError)
      return NextResponse.json({ error: 'Failed to submit update request' }, { status: 500 })
    }

    // Notify staff about the request
    const { data: staffUsers } = await serviceSupabase
      .from('profiles')
      .select('id')
      .in('role', ['staff_admin', 'staff_ops', 'ceo'])
      .limit(5)

    if (staffUsers && staffUsers.length > 0) {
      const notifications = staffUsers.map((staff: { id: string }) => ({
        user_id: staff.id,
        investor_id: null,
        title: 'Arranger Profile Update Request',
        message: `${arranger?.company_name || arranger?.legal_name} has requested a profile update.`,
        link: `/versotech_main/approvals?id=${approval.id}`,
      }))

      await serviceSupabase.from('investor_notifications').insert(notifications)
    }

    return NextResponse.json({
      message: 'Profile update request submitted for approval',
      approval_id: approval.id,
    })
  } catch (error) {
    console.error('Unexpected error in PUT /api/arrangers/me/profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
