/**
 * Partner Profile API (Self-Service)
 * GET /api/partners/me - Get partner's own profile
 * PATCH /api/partners/me - Update editable profile fields
 */

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getMobilePhoneValidationError } from '@/lib/validation/phone-number'

// Schema for partner self-service profile updates
// Note: Commission rates, payment terms, and KYC status are admin-managed (read-only for partners)
const profileUpdateSchema = z.object({
  // Entity type
  type: z.enum(['individual', 'entity']).optional(),

  // Contact fields (self-editable)
  contact_name: z.string().min(1).max(255).optional(),
  email: z.string().email().max(255).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  logo_url: z.string().url().max(500).optional().nullable(),

  // Address fields
  address: z.string().max(255).optional().nullable(),
  address_2: z.string().max(255).optional().nullable(),
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
  website: z.string().url().max(255).optional().nullable().or(z.literal('')),

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
  residential_line_2: z.string().max(255).optional().nullable(),
  residential_city: z.string().max(100).optional().nullable(),
  residential_state: z.string().max(100).optional().nullable(),
  residential_postal_code: z.string().max(20).optional().nullable(),
  residential_country: z.string().max(2).optional().nullable(),

  // New KYC fields
  middle_initial: z.string().max(5).optional().nullable(),
  proof_of_address_date: z.string().optional().nullable(),
  proof_of_address_expiry: z.string().optional().nullable(),
  tax_id_number: z.string().max(50).optional().nullable(),
})

/**
 * GET /api/partners/me
 * Returns the current partner's profile including entity details
 */
export async function GET() {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find partner entity for current user via partner_users bridge table
    const { data: partnerUser, error: partnerUserError } = await serviceSupabase
      .from('partner_users')
      .select('partner_id, role, is_primary, can_sign')
      .eq('user_id', user.id)
      .maybeSingle()

    if (partnerUserError || !partnerUser?.partner_id) {
      return NextResponse.json({ error: 'Partner profile not found' }, { status: 404 })
    }

    // Get partner entity details
    const { data: partner, error: partnerError } = await serviceSupabase
      .from('partners')
      .select('*')
      .eq('id', partnerUser.partner_id)
      .single()

    if (partnerError || !partner) {
      return NextResponse.json({ error: 'Partner entity not found' }, { status: 404 })
    }

    // Get user profile info
    const { data: profile } = await serviceSupabase
      .from('profiles')
      .select('display_name, email, avatar_url')
      .eq('id', user.id)
      .maybeSingle()

    // Get referred investors count
    const { count: referredInvestorsCount } = await serviceSupabase
      .from('investors')
      .select('id', { count: 'exact', head: true })
      .eq('referred_by_partner_id', partnerUser.partner_id)

    // Get commission statistics
    const { data: commissionStats } = await serviceSupabase
      .from('partner_commissions')
      .select('accrual_amount, status')
      .eq('partner_id', partnerUser.partner_id)

    const totalEarned = commissionStats
      ?.filter(c => c.status === 'paid')
      .reduce((sum, c) => sum + (Number(c.accrual_amount) || 0), 0) || 0

    const pendingCommission = commissionStats
      ?.filter(c => ['accrued', 'invoiced'].includes(c.status))
      .reduce((sum, c) => sum + (Number(c.accrual_amount) || 0), 0) || 0

    return NextResponse.json({
      partner,
      partnerUser: {
        role: partnerUser.role,
        is_primary: partnerUser.is_primary,
        can_sign: partnerUser.can_sign || false,
        is_active: partner.status === 'active',
      },
      profile,
      stats: {
        referredInvestorsCount: referredInvestorsCount || 0,
        totalEarned,
        pendingCommission,
      },
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/partners/me:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/partners/me
 * Update profile directly - self-service for partners
 * Note: Commission rates and payment terms are NOT updateable (managed by staff)
 */
export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find partner entity for current user
    const { data: partnerUser, error: partnerUserError } = await serviceSupabase
      .from('partner_users')
      .select('partner_id, role, is_primary')
      .eq('user_id', user.id)
      .maybeSingle()

    if (partnerUserError || !partnerUser?.partner_id) {
      return NextResponse.json({ error: 'Partner profile not found' }, { status: 404 })
    }

    // Admins and primary contacts can update entity profile details
    if (partnerUser.role !== 'admin' && !partnerUser.is_primary) {
      return NextResponse.json(
        { error: 'Only admin or primary users can update the partner profile' },
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

    const { data: currentPartner, error: currentPartnerError } = await serviceSupabase
      .from('partners')
      .select('phone_mobile')
      .eq('id', partnerUser.partner_id)
      .single()

    if (currentPartnerError || !currentPartner) {
      return NextResponse.json({ error: 'Partner entity not found' }, { status: 404 })
    }

    const effectivePhoneMobile =
      updateData.phone_mobile !== undefined
        ? updateData.phone_mobile
        : currentPartner.phone_mobile
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
      if (['address', 'address_2', 'address_line_1', 'address_line_2'].includes(key)) {
        continue
      }
      if (value !== undefined) {
        // Convert empty strings to null for optional fields
        updateFields[key] = value === '' ? null : value
      }
    }
    if (normalizedAddressLine1 !== undefined) {
      updateFields.address_line_1 = normalizedAddressLine1 === '' ? null : normalizedAddressLine1
    }
    if (normalizedAddressLine2 !== undefined) {
      updateFields.address_line_2 = normalizedAddressLine2 === '' ? null : normalizedAddressLine2
    }

    // Check there's something to update
    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    // Directly update the partner entity
    const { data: updatedPartner, error: updateError } = await serviceSupabase
      .from('partners')
      .update(updateFields)
      .eq('id', partnerUser.partner_id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating partner profile:', updateError)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      partner: updatedPartner,
    })
  } catch (error) {
    console.error('Unexpected error in PATCH /api/partners/me:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
