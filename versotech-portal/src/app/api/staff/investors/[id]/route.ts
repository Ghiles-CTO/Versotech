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
          profiles (
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
      is_sanctioned
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
