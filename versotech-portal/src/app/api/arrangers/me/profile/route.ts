/**
 * Arranger Profile API
 * GET /api/arrangers/me/profile - Get arranger's own profile
 * PUT /api/arrangers/me/profile - Update profile directly (self-service)
 */

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Schema allows all editable fields - KYC fields are NOT included (read-only)
const profileUpdateSchema = z.object({
  // Entity fields
  legal_name: z.string().min(1).max(255).optional(),
  registration_number: z.string().max(100).optional(),
  tax_id: z.string().max(100).optional(),
  // Regulatory fields
  regulator: z.string().max(255).optional(),
  license_number: z.string().max(100).optional(),
  license_type: z.string().max(100).optional(),
  license_expiry_date: z.string().optional().nullable(),
  // Contact fields
  email: z.string().email().max(255).optional(),
  phone: z.string().max(50).optional(),
  address: z.string().max(500).optional(),
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
    // Note: arranger_users has no 'is_active' column - derive from arranger_entities.status
    const { data: arrangerUser, error: arrangerUserError } = await serviceSupabase
      .from('arranger_users')
      .select('arranger_id, role')
      .eq('user_id', user.id)
      .maybeSingle()

    if (arrangerUserError || !arrangerUser?.arranger_id) {
      return NextResponse.json({ error: 'Arranger profile not found' }, { status: 404 })
    }

    // Get arranger entity details
    // Note: arranger_entities has 'status' not 'is_active', and 'legal_name' not 'company_name'
    const { data: arranger, error: arrangerError } = await serviceSupabase
      .from('arranger_entities')
      .select('*')
      .eq('id', arrangerUser.arranger_id)
      .single()

    if (arrangerError || !arranger) {
      return NextResponse.json({ error: 'Arranger entity not found' }, { status: 404 })
    }

    // Get user profile info
    // Note: profiles has 'display_name' not 'full_name'
    const { data: profile } = await serviceSupabase
      .from('profiles')
      .select('display_name, email, avatar_url')
      .eq('id', user.id)
      .maybeSingle()

    return NextResponse.json({
      arranger,
      arrangerUser: {
        role: arrangerUser.role,
        // Derive is_active from arranger_entities.status for backward compatibility
        is_active: arranger.status === 'active',
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
 * Update profile directly - self-service for arrangers
 * Note: KYC status fields are NOT updateable via this endpoint (managed by staff)
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

    // Filter out empty/undefined values and build update object
    const updateFields: Record<string, string | null> = {}
    for (const [key, value] of Object.entries(updateData)) {
      if (value !== undefined) {
        // Convert empty strings to null for optional fields
        updateFields[key] = value === '' ? null : value
      }
    }

    // Check there's something to update
    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    // Directly update the arranger entity
    const { data: updatedArranger, error: updateError } = await serviceSupabase
      .from('arranger_entities')
      .update(updateFields)
      .eq('id', arrangerUser.arranger_id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating arranger profile:', updateError)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      arranger: updatedArranger,
    })
  } catch (error) {
    console.error('Unexpected error in PUT /api/arrangers/me/profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
