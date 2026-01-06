/**
 * Introducer Profile API
 * GET /api/introducers/me/profile - Get introducer's own profile
 * PUT /api/introducers/me/profile - Update profile directly (self-service)
 */

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Schema for introducer self-service profile updates
// Note: Commission rates, caps, and payment terms are managed by arrangers (read-only for introducers)
const profileUpdateSchema = z.object({
  // Entity type
  type: z.enum(['individual', 'entity']).optional(),

  // Contact fields (self-editable)
  contact_name: z.string().min(1).max(255).optional(),
  email: z.string().email().max(255).optional(),
  notes: z.string().max(2000).optional().nullable(),
  logo_url: z.string().url().max(500).optional().nullable(),

  // Address fields
  address_line_1: z.string().max(255).optional().nullable(),
  address_line_2: z.string().max(255).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state_province: z.string().max(100).optional().nullable(),
  postal_code: z.string().max(20).optional().nullable(),
  country: z.string().max(2).optional().nullable(), // ISO 3166-1 alpha-2

  // Phone numbers
  phone: z.string().max(30).optional().nullable(),
  phone_mobile: z.string().max(30).optional().nullable(),
  phone_office: z.string().max(30).optional().nullable(),
  website: z.string().url().max(255).optional().nullable(),

  // Entity info (for type='entity')
  country_of_incorporation: z.string().max(2).optional().nullable(),
  registration_number: z.string().max(100).optional().nullable(),
  tax_id: z.string().max(50).optional().nullable(),

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

  // Residential Address (for individuals)
  residential_street: z.string().max(255).optional().nullable(),
  residential_city: z.string().max(100).optional().nullable(),
  residential_state: z.string().max(100).optional().nullable(),
  residential_postal_code: z.string().max(20).optional().nullable(),
  residential_country: z.string().max(2).optional().nullable(),
})

/**
 * GET /api/introducers/me/profile
 * Returns the current introducer's profile including entity details and active agreement
 */
export async function GET() {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find introducer entity for current user via introducer_users bridge table
    const { data: introducerUser, error: introducerUserError } = await serviceSupabase
      .from('introducer_users')
      .select('introducer_id, role, is_primary, can_sign')
      .eq('user_id', user.id)
      .maybeSingle()

    if (introducerUserError || !introducerUser?.introducer_id) {
      return NextResponse.json({ error: 'Introducer profile not found' }, { status: 404 })
    }

    // Get introducer entity details
    const { data: introducer, error: introducerError } = await serviceSupabase
      .from('introducers')
      .select('*')
      .eq('id', introducerUser.introducer_id)
      .single()

    if (introducerError || !introducer) {
      return NextResponse.json({ error: 'Introducer entity not found' }, { status: 404 })
    }

    // Get user profile info
    const { data: profile } = await serviceSupabase
      .from('profiles')
      .select('display_name, email, avatar_url')
      .eq('id', user.id)
      .maybeSingle()

    // Get active agreement if any
    const { data: activeAgreement } = await serviceSupabase
      .from('introducer_agreements')
      .select(`
        id,
        agreement_type,
        default_commission_bps,
        territory,
        status,
        effective_date,
        expiry_date,
        arranger_id,
        arranger:arranger_id (
          id,
          legal_name
        )
      `)
      .eq('introducer_id', introducerUser.introducer_id)
      .eq('status', 'active')
      .maybeSingle()

    // Get introduction statistics
    const { count: introductionCount } = await serviceSupabase
      .from('introductions')
      .select('id', { count: 'exact', head: true })
      .eq('introducer_id', introducerUser.introducer_id)

    // Get commission statistics
    const { data: commissionStats } = await serviceSupabase
      .from('introducer_commissions')
      .select('accrual_amount, status')
      .eq('introducer_id', introducerUser.introducer_id)

    const totalEarned = commissionStats
      ?.filter(c => c.status === 'paid')
      .reduce((sum, c) => sum + (Number(c.accrual_amount) || 0), 0) || 0

    const pendingCommission = commissionStats
      ?.filter(c => ['accrued', 'invoiced'].includes(c.status))
      .reduce((sum, c) => sum + (Number(c.accrual_amount) || 0), 0) || 0

    return NextResponse.json({
      introducer,
      introducerUser: {
        role: introducerUser.role,
        is_primary: introducerUser.is_primary,
        can_sign: introducerUser.can_sign || false,
        is_active: introducer.status === 'active',
      },
      profile,
      activeAgreement,
      stats: {
        introductionCount: introductionCount || 0,
        totalEarned,
        pendingCommission,
      },
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/introducers/me/profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PUT /api/introducers/me/profile
 * Update profile directly - self-service for introducers
 * Note: Commission rates and payment terms are NOT updateable (managed by arrangers)
 */
export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find introducer entity for current user
    const { data: introducerUser, error: introducerUserError } = await serviceSupabase
      .from('introducer_users')
      .select('introducer_id, role')
      .eq('user_id', user.id)
      .maybeSingle()

    if (introducerUserError || !introducerUser?.introducer_id) {
      return NextResponse.json({ error: 'Introducer profile not found' }, { status: 404 })
    }

    // Only admin users can update the introducer profile
    if (introducerUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admin users can update the introducer profile' },
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

    // Directly update the introducer entity
    const { data: updatedIntroducer, error: updateError } = await serviceSupabase
      .from('introducers')
      .update(updateFields)
      .eq('id', introducerUser.introducer_id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating introducer profile:', updateError)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      introducer: updatedIntroducer,
    })
  } catch (error) {
    console.error('Unexpected error in PUT /api/introducers/me/profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
