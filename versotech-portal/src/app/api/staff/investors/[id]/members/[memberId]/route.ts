import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const updateMemberSchema = z.object({
  // Role
  role: z.enum([
    'director', 'shareholder', 'beneficial_owner', 'authorized_signatory',
    'officer', 'partner', 'ubo', 'signatory', 'authorized_representative',
    'beneficiary', 'trustee', 'managing_member', 'general_partner',
    'limited_partner', 'other'
  ]).optional(),
  role_title: z.string().optional().nullable(),

  // Structured name
  full_name: z.string().min(1).optional(),
  first_name: z.string().max(100).optional().nullable(),
  middle_name: z.string().max(100).optional().nullable(),
  middle_initial: z.string().max(5).optional().nullable(),
  last_name: z.string().max(100).optional().nullable(),
  name_suffix: z.string().max(20).optional().nullable(),

  // Personal Info
  date_of_birth: z.string().optional().nullable(),
  country_of_birth: z.string().optional().nullable(),
  nationality: z.string().optional().nullable(),

  // Contact
  email: z.string().email().optional().nullable().or(z.literal('')),
  phone: z.string().optional().nullable(),
  phone_mobile: z.string().optional().nullable(),
  phone_office: z.string().optional().nullable(),

  // Residential Address
  residential_street: z.string().optional().nullable(),
  residential_line_2: z.string().optional().nullable(),
  residential_city: z.string().optional().nullable(),
  residential_state: z.string().optional().nullable(),
  residential_postal_code: z.string().optional().nullable(),
  residential_country: z.string().optional().nullable(),

  // US Tax compliance
  is_us_citizen: z.boolean().optional(),
  is_us_taxpayer: z.boolean().optional(),
  us_taxpayer_id: z.string().max(20).optional().nullable(),
  country_of_tax_residency: z.string().optional().nullable(),
  tax_id_number: z.string().max(50).optional().nullable(),

  // ID Document
  id_type: z.enum(['passport', 'national_id', 'drivers_license', 'residence_permit', 'other']).optional().nullable(),
  id_number: z.string().optional().nullable(),
  id_issue_date: z.string().optional().nullable(),
  id_expiry_date: z.string().optional().nullable(),
  id_issuing_country: z.string().optional().nullable(),

  // Proof of Address tracking
  proof_of_address_date: z.string().optional().nullable(),
  proof_of_address_expiry: z.string().optional().nullable(),

  // KYC Status (staff can update these)
  kyc_status: z.enum(['pending', 'submitted', 'approved', 'rejected', 'expired']).optional().nullable(),
  kyc_approved_at: z.string().optional().nullable(),
  kyc_approved_by: z.string().uuid().optional().nullable(),
  kyc_expiry_date: z.string().optional().nullable(),
  kyc_notes: z.string().optional().nullable(),

  // Ownership
  ownership_percentage: z.number().min(0).max(100).optional().nullable(),
  is_beneficial_owner: z.boolean().optional(),
  is_signatory: z.boolean().optional(),
  can_sign: z.boolean().optional(),
  signature_specimen_url: z.string().optional().nullable(),
  signature_specimen_uploaded_at: z.string().optional().nullable(),
  effective_from: z.string().optional().nullable(),
  effective_to: z.string().optional().nullable(),
})

interface RouteParams {
  params: Promise<{ id: string; memberId: string }>
}

/**
 * GET /api/staff/investors/[id]/members/[memberId]
 * Get a single member by ID
 * Authentication: Staff only
 */
export async function GET(
  request: Request,
  { params }: RouteParams
) {
  try {
    const { id, memberId } = await params
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

    // Fetch member and verify it belongs to the investor
    const { data: member, error: memberError } = await supabase
      .from('investor_members')
      .select('*')
      .eq('id', memberId)
      .eq('investor_id', id)
      .single()

    if (memberError || !member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    return NextResponse.json({ member })
  } catch (error) {
    console.error('API /staff/investors/[id]/members/[memberId] GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/staff/investors/[id]/members/[memberId]
 * Update a member's KYC information
 * Authentication: Staff only
 */
export async function PATCH(
  request: Request,
  { params }: RouteParams
) {
  try {
    const { id, memberId } = await params
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

    // Verify member exists and belongs to this investor
    const { data: existingMember, error: checkError } = await supabase
      .from('investor_members')
      .select('id')
      .eq('id', memberId)
      .eq('investor_id', id)
      .single()

    if (checkError || !existingMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Parse and validate request body
    const body = await request.json()
    const parsed = updateMemberSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    // Handle KYC approval - if status is approved, set approved_by and approved_at
    const updateData: Record<string, unknown> = {
      ...parsed.data,
      updated_at: new Date().toISOString()
    }

    // If status is being set to approved and kyc_approved_by not provided, use current user
    if (parsed.data.kyc_status === 'approved' && !parsed.data.kyc_approved_by) {
      updateData.kyc_approved_by = user.id
      updateData.kyc_approved_at = new Date().toISOString()
    }

    // Clean up empty email strings
    if (updateData.email === '') {
      updateData.email = null
    }

    // Update member
    const { data: updatedMember, error: updateError } = await supabase
      .from('investor_members')
      .update(updateData)
      .eq('id', memberId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating member:', updateError)
      return NextResponse.json(
        { error: 'Failed to update member', details: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ member: updatedMember })
  } catch (error) {
    console.error('API /staff/investors/[id]/members/[memberId] PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/staff/investors/[id]/members/[memberId]
 * Soft-delete a member (sets is_active = false)
 * Authentication: Staff only
 */
export async function DELETE(
  request: Request,
  { params }: RouteParams
) {
  try {
    const { id, memberId } = await params
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

    // Verify member exists and belongs to this investor
    const { data: existingMember, error: checkError } = await supabase
      .from('investor_members')
      .select('id, full_name')
      .eq('id', memberId)
      .eq('investor_id', id)
      .single()

    if (checkError || !existingMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Soft delete - set is_active to false and effective_to date
    const { error: deleteError } = await supabase
      .from('investor_members')
      .update({
        is_active: false,
        effective_to: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString()
      })
      .eq('id', memberId)

    if (deleteError) {
      console.error('Error deleting member:', deleteError)
      return NextResponse.json({ error: 'Failed to delete member' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Member "${existingMember.full_name}" has been removed`
    })
  } catch (error) {
    console.error('API /staff/investors/[id]/members/[memberId] DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
