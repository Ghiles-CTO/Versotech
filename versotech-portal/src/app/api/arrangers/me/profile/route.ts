/**
 * Arranger Profile API
 * GET /api/arrangers/me/profile - Get arranger's own profile
 * PUT /api/arrangers/me/profile - Update profile directly (self-service)
 * PATCH /api/arrangers/me/profile - Alias of PUT for shared dialogs
 */

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getMobilePhoneValidationError } from '@/lib/validation/phone-number'

// Schema allows all editable fields
const profileUpdateSchema = z.object({
  // Entity type
  type: z.enum(['individual', 'entity']).optional(),

  // Entity fields
  legal_name: z.string().min(1).max(255).optional(),
  registration_number: z.string().max(100).optional().nullable(),
  tax_id: z.string().max(100).optional().nullable(),
  country_of_incorporation: z.string().max(2).optional().nullable(),

  // Regulatory fields
  regulator: z.string().max(255).optional().nullable(),
  license_number: z.string().max(100).optional().nullable(),
  license_type: z.string().max(100).optional().nullable(),
  license_expiry_date: z.string().optional().nullable(),

  // Contact fields
  email: z.string().email().max(255).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  phone_mobile: z.string().max(30).optional().nullable(),
  phone_office: z.string().max(30).optional().nullable(),
  website: z.string().url().max(255).optional().nullable().or(z.literal('')),

  // Address fields (structured - replacing single 'address' field)
  address: z.string().max(500).optional().nullable(),
  address_2: z.string().max(255).optional().nullable(),
  address_line_1: z.string().max(255).optional().nullable(),
  address_line_2: z.string().max(255).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state_province: z.string().max(100).optional().nullable(),
  postal_code: z.string().max(20).optional().nullable(),
  country: z.string().max(2).optional().nullable(),

  // Individual KYC fields (for type='individual')
  first_name: z.string().max(100).optional().nullable(),
  middle_name: z.string().max(100).optional().nullable(),
  last_name: z.string().max(100).optional().nullable(),
  name_suffix: z.string().max(20).optional().nullable(),
  date_of_birth: z.string().optional().nullable(),
  country_of_birth: z.string().max(2).optional().nullable(),
  nationality: z.string().max(2).optional().nullable(),

  // US Tax compliance
  is_us_citizen: z.boolean().optional(),
  is_us_taxpayer: z.boolean().optional(),
  us_taxpayer_id: z.string().max(20).optional().nullable(),
  country_of_tax_residency: z.string().max(2).optional().nullable(),

  // ID Document
  id_type: z.enum(['passport', 'national_id', 'drivers_license', 'residence_permit']).optional().nullable(),
  id_number: z.string().max(50).optional().nullable(),
  id_issue_date: z.string().optional().nullable(),
  id_expiry_date: z.string().optional().nullable(),
  id_issuing_country: z.string().max(2).optional().nullable(),
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
      .select('arranger_id, role, is_primary')
      .eq('user_id', user.id)
      .maybeSingle()

    if (arrangerUserError || !arrangerUser?.arranger_id) {
      return NextResponse.json({ error: 'Arranger profile not found' }, { status: 404 })
    }

    // Admins and primary contacts can update entity profile details
    if (arrangerUser.role !== 'admin' && !arrangerUser.is_primary) {
      return NextResponse.json(
        { error: 'Only admin or primary users can update the arranger profile' },
        { status: 403 }
      )
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
    const normalizedAddressLine1 =
      updateData.address !== undefined ? updateData.address : updateData.address_line_1
    const normalizedAddressLine2 =
      updateData.address_2 !== undefined ? updateData.address_2 : updateData.address_line_2

    const { data: currentArranger, error: currentArrangerError } = await serviceSupabase
      .from('arranger_entities')
      .select('phone_mobile')
      .eq('id', arrangerUser.arranger_id)
      .single()

    if (currentArrangerError || !currentArranger) {
      return NextResponse.json({ error: 'Arranger entity not found' }, { status: 404 })
    }

    const effectivePhoneMobile =
      updateData.phone_mobile !== undefined
        ? updateData.phone_mobile
        : currentArranger.phone_mobile
    const mobilePhoneError = getMobilePhoneValidationError(effectivePhoneMobile, true)
    if (mobilePhoneError) {
      return NextResponse.json(
        { error: mobilePhoneError, details: { fieldErrors: { phone_mobile: [mobilePhoneError] } } },
        { status: 400 }
      )
    }

    // Filter out empty/undefined values and build update object
    const updateFields: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(updateData)) {
      if (['address_2', 'address_line_1', 'address_line_2'].includes(key)) {
        continue
      }
      if (value !== undefined) {
        // Convert empty strings to null for optional fields
        updateFields[key] = value === '' ? null : value
      }
    }
    if (normalizedAddressLine1 !== undefined) {
      const mainAddressValue = normalizedAddressLine1 === '' ? null : normalizedAddressLine1
      updateFields.address = mainAddressValue
      updateFields.address_line_1 = mainAddressValue
    }
    if (normalizedAddressLine2 !== undefined) {
      updateFields.address_line_2 = normalizedAddressLine2 === '' ? null : normalizedAddressLine2
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

export async function PATCH(request: NextRequest) {
  return PUT(request)
}
