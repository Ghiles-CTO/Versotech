import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

/**
 * GET /api/staff/investors/[id]
 * Get investor details
 * Authentication: Staff only
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authSupabase = await createClient()
    const { user, error: authError } = await getAuthenticatedUser(authSupabase)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify staff role
    const isStaff = await isStaffUser(authSupabase, user)
    if (!isStaff) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    // Use service client for data fetching
    const supabase = createServiceClient()

    // Fetch investor with related data
    const { data: investor, error } = await supabase
      .from('investors')
      .select(`
        *,
        primary_rm_profile:profiles!investors_primary_rm_fkey (
          id,
          display_name,
          email
        ),
        secondary_rm_profile:profiles!investors_secondary_rm_fkey (
          id,
          display_name,
          email
        ),
        investor_users (
          user_id,
          profiles:profiles!investor_users_user_id_fkey (
            id,
            display_name,
            email,
            title,
            role
          )
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Investor not found' }, { status: 404 })
      }
      console.error('Fetch investor error:', error)
      return NextResponse.json({ error: 'Failed to fetch investor' }, { status: 500 })
    }

    return NextResponse.json({ investor })
  } catch (error) {
    console.error('API /staff/investors/[id] GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/staff/investors/[id]
 * Update investor details
 * Authentication: Staff only
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authSupabase = await createClient()
    const { user, error: authError } = await getAuthenticatedUser(authSupabase)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify staff role
    const isStaff = await isStaffUser(authSupabase, user)
    if (!isStaff) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    // Use service client for data operations
    const supabase = createServiceClient()

    // Parse request body
    const body = await request.json()
    const {
      legal_name,
      display_name,
      type,
      email,
      phone,
      country,
      country_of_incorporation,
      tax_residency,
      primary_rm,
      secondary_rm,
      status,
      onboarding_status,
      kyc_status,
      aml_risk_rating,
      is_professional_investor,
      is_qualified_purchaser,
      is_pep,
      is_sanctioned,
      // Individual KYC fields
      first_name,
      middle_name,
      last_name,
      name_suffix,
      date_of_birth,
      country_of_birth,
      nationality,
      phone_mobile,
      phone_office,
      // US Tax compliance
      is_us_citizen,
      is_us_taxpayer,
      us_taxpayer_id,
      country_of_tax_residency,
      // ID Document
      id_type,
      id_number,
      id_issue_date,
      id_expiry_date,
      id_issuing_country,
      // Residential Address
      residential_street,
      residential_line_2,
      residential_city,
      residential_state,
      residential_postal_code,
      residential_country,
    } = body

    // Helper to convert empty strings to null
    const cleanValue = (value: any) => {
      if (value === '' || value === undefined) return null
      return value
    }

    // Check if email is being changed and already exists
    if (email && email.trim()) {
      const { data: existing } = await supabase
        .from('investors')
        .select('id')
        .eq('email', email)
        .neq('id', id)
        .single()

      if (existing) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
      }
    }

    // Check if type is being changed to non-entity type while members exist
    if (type !== undefined && !['entity', 'institutional'].includes(type)) {
      // Get current investor to check if type is changing from entity
      const { data: currentInvestor } = await supabase
        .from('investors')
        .select('type')
        .eq('id', id)
        .single()

      if (currentInvestor && ['entity', 'institutional'].includes(currentInvestor.type || '')) {
        // Check if investor has members
        const { data: members } = await supabase
          .from('investor_members')
          .select('id')
          .eq('investor_id', id)
          .eq('is_active', true)
          .limit(1)

        if (members && members.length > 0) {
          return NextResponse.json({
            error: 'Cannot change to non-entity type while members exist. Please remove members first.'
          }, { status: 400 })
        }
      }
    }

    // Build update object (only include fields that were provided)
    const updateData: any = {}
    if (legal_name !== undefined) updateData.legal_name = legal_name
    if (display_name !== undefined) updateData.display_name = cleanValue(display_name)
    if (type !== undefined) updateData.type = type
    if (email !== undefined) updateData.email = cleanValue(email)
    if (phone !== undefined) updateData.phone = cleanValue(phone)
    if (country !== undefined) updateData.country = cleanValue(country)
    if (country_of_incorporation !== undefined)
      updateData.country_of_incorporation = cleanValue(country_of_incorporation)
    if (tax_residency !== undefined) updateData.tax_residency = cleanValue(tax_residency)
    if (primary_rm !== undefined) updateData.primary_rm = cleanValue(primary_rm)
    if (secondary_rm !== undefined) updateData.secondary_rm = cleanValue(secondary_rm)
    if (status !== undefined) updateData.status = status
    if (onboarding_status !== undefined) updateData.onboarding_status = onboarding_status
    if (kyc_status !== undefined) updateData.kyc_status = kyc_status
    if (aml_risk_rating !== undefined) updateData.aml_risk_rating = cleanValue(aml_risk_rating)
    if (is_professional_investor !== undefined)
      updateData.is_professional_investor = is_professional_investor
    if (is_qualified_purchaser !== undefined)
      updateData.is_qualified_purchaser = is_qualified_purchaser
    if (is_pep !== undefined) updateData.is_pep = is_pep
    if (is_sanctioned !== undefined) updateData.is_sanctioned = is_sanctioned
    // Individual KYC fields
    if (first_name !== undefined) updateData.first_name = cleanValue(first_name)
    if (middle_name !== undefined) updateData.middle_name = cleanValue(middle_name)
    if (last_name !== undefined) updateData.last_name = cleanValue(last_name)
    if (name_suffix !== undefined) updateData.name_suffix = cleanValue(name_suffix)
    if (date_of_birth !== undefined) updateData.date_of_birth = cleanValue(date_of_birth)
    if (country_of_birth !== undefined) updateData.country_of_birth = cleanValue(country_of_birth)
    if (nationality !== undefined) updateData.nationality = cleanValue(nationality)
    if (phone_mobile !== undefined) updateData.phone_mobile = cleanValue(phone_mobile)
    if (phone_office !== undefined) updateData.phone_office = cleanValue(phone_office)
    // US Tax compliance
    if (is_us_citizen !== undefined) updateData.is_us_citizen = is_us_citizen
    if (is_us_taxpayer !== undefined) updateData.is_us_taxpayer = is_us_taxpayer
    if (us_taxpayer_id !== undefined) updateData.us_taxpayer_id = cleanValue(us_taxpayer_id)
    if (country_of_tax_residency !== undefined) updateData.country_of_tax_residency = cleanValue(country_of_tax_residency)
    // ID Document
    if (id_type !== undefined) updateData.id_type = cleanValue(id_type)
    if (id_number !== undefined) updateData.id_number = cleanValue(id_number)
    if (id_issue_date !== undefined) updateData.id_issue_date = cleanValue(id_issue_date)
    if (id_expiry_date !== undefined) updateData.id_expiry_date = cleanValue(id_expiry_date)
    if (id_issuing_country !== undefined) updateData.id_issuing_country = cleanValue(id_issuing_country)
    // Residential Address
    if (residential_street !== undefined) updateData.residential_street = cleanValue(residential_street)
    if (residential_line_2 !== undefined) updateData.residential_line_2 = cleanValue(residential_line_2)
    if (residential_city !== undefined) updateData.residential_city = cleanValue(residential_city)
    if (residential_state !== undefined) updateData.residential_state = cleanValue(residential_state)
    if (residential_postal_code !== undefined) updateData.residential_postal_code = cleanValue(residential_postal_code)
    if (residential_country !== undefined) updateData.residential_country = cleanValue(residential_country)

    // Always update the updated_at timestamp
    updateData.updated_at = new Date().toISOString()

    // Update investor
    const { data: investor, error: updateError } = await supabase
      .from('investors')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        primary_rm_profile:profiles!investors_primary_rm_fkey (
          id,
          display_name,
          email
        ),
        secondary_rm_profile:profiles!investors_secondary_rm_fkey (
          id,
          display_name,
          email
        )
      `)
      .single()

    if (updateError) {
      console.error('Update investor error:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Revalidate both list and detail pages
    revalidatePath('/versotech/staff/investors')
    revalidatePath(`/versotech/staff/investors/${id}`)

    return NextResponse.json({
      investor,
      message: 'Investor updated successfully'
    })
  } catch (error) {
    console.error('API /staff/investors/[id] PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/staff/investors/[id]
 * Soft delete an investor (only if no active positions)
 * Authentication: Admin only
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authSupabase = await createClient()
    const { user, error: authError } = await getAuthenticatedUser(authSupabase)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify admin role (only admins can delete)
    const { data: profile } = await authSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role as string
    if (!profile || role !== 'staff_admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Use service client for data operations
    const supabase = createServiceClient()

    // Check if investor has active positions or subscriptions
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('investor_id', id)
      .eq('status', 'active')

    if (subscriptions && subscriptions.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete investor with active subscriptions' },
        { status: 400 }
      )
    }

    // Soft delete by setting status to archived
    const { error: updateError } = await supabase
      .from('investors')
      .update({
        status: 'archived',
        archived_at: new Date().toISOString()
      })
      .eq('id', id)

    if (updateError) {
      console.error('Archive investor error:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Investor archived successfully' })
  } catch (error) {
    console.error('API /staff/investors/[id] DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
