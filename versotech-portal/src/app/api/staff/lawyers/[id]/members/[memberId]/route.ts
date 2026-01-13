import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const updateMemberSchema = z.object({
  role: z.enum([
    'director', 'shareholder', 'beneficial_owner', 'authorized_signatory',
    'officer', 'partner', 'ubo', 'signatory', 'authorized_representative',
    'beneficiary', 'trustee', 'managing_member', 'general_partner',
    'limited_partner', 'other'
  ]).optional(),
  role_title: z.string().optional().nullable(),
  full_name: z.string().min(1).optional(),
  first_name: z.string().max(100).optional().nullable(),
  middle_name: z.string().max(100).optional().nullable(),
  middle_initial: z.string().max(5).optional().nullable(),
  last_name: z.string().max(100).optional().nullable(),
  name_suffix: z.string().max(20).optional().nullable(),
  date_of_birth: z.string().optional().nullable(),
  country_of_birth: z.string().optional().nullable(),
  nationality: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  phone: z.string().optional().nullable(),
  phone_mobile: z.string().optional().nullable(),
  phone_office: z.string().optional().nullable(),
  residential_street: z.string().optional().nullable(),
  residential_line_2: z.string().optional().nullable(),
  residential_city: z.string().optional().nullable(),
  residential_state: z.string().optional().nullable(),
  residential_postal_code: z.string().optional().nullable(),
  residential_country: z.string().optional().nullable(),
  is_us_citizen: z.boolean().optional(),
  is_us_taxpayer: z.boolean().optional(),
  us_taxpayer_id: z.string().max(20).optional().nullable(),
  country_of_tax_residency: z.string().optional().nullable(),
  tax_id_number: z.string().max(50).optional().nullable(),
  id_type: z.enum(['passport', 'national_id', 'drivers_license', 'residence_permit', 'other']).optional().nullable(),
  id_number: z.string().optional().nullable(),
  id_issue_date: z.string().optional().nullable(),
  id_expiry_date: z.string().optional().nullable(),
  id_issuing_country: z.string().optional().nullable(),
  proof_of_address_date: z.string().optional().nullable(),
  proof_of_address_expiry: z.string().optional().nullable(),
  kyc_status: z.enum(['pending', 'submitted', 'approved', 'rejected', 'expired']).optional().nullable(),
  kyc_approved_at: z.string().optional().nullable(),
  kyc_approved_by: z.string().uuid().optional().nullable(),
  kyc_expiry_date: z.string().optional().nullable(),
  kyc_notes: z.string().optional().nullable(),
  ownership_percentage: z.number().min(0).max(100).optional().nullable(),
  is_beneficial_owner: z.boolean().optional(),
  is_signatory: z.boolean().optional(),
  can_sign: z.boolean().optional(),
  signature_specimen_url: z.string().optional().nullable(),
  effective_from: z.string().optional().nullable(),
  effective_to: z.string().optional().nullable(),
})

interface RouteParams {
  params: Promise<{ id: string; memberId: string }>
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id, memberId } = await params
    const authSupabase = await createClient()
    const { user, error: authError } = await getAuthenticatedUser(authSupabase)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isStaff = await isStaffUser(authSupabase, user)
    if (!isStaff) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    const supabase = createServiceClient()
    const { data: member, error } = await supabase
      .from('lawyer_members')
      .select('*')
      .eq('id', memberId)
      .eq('lawyer_id', id)
      .single()

    if (error || !member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    return NextResponse.json({ member })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id, memberId } = await params
    const authSupabase = await createClient()
    const { user, error: authError } = await getAuthenticatedUser(authSupabase)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isStaff = await isStaffUser(authSupabase, user)
    if (!isStaff) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    const supabase = createServiceClient()

    const { data: existing } = await supabase
      .from('lawyer_members')
      .select('id')
      .eq('id', memberId)
      .eq('lawyer_id', id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    const body = await request.json()
    const parsed = updateMemberSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request body', details: parsed.error.flatten() }, { status: 400 })
    }

    const updateData: Record<string, unknown> = { ...parsed.data, updated_at: new Date().toISOString() }
    if (parsed.data.kyc_status === 'approved' && !parsed.data.kyc_approved_by) {
      updateData.kyc_approved_by = user.id
      updateData.kyc_approved_at = new Date().toISOString()
    }
    if (updateData.email === '') updateData.email = null

    const { data: updated, error: updateError } = await supabase
      .from('lawyer_members')
      .update(updateData)
      .eq('id', memberId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating member:', updateError)
      return NextResponse.json({ error: 'Failed to update member' }, { status: 500 })
    }

    return NextResponse.json({ member: updated })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id, memberId } = await params
    const authSupabase = await createClient()
    const { user, error: authError } = await getAuthenticatedUser(authSupabase)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isStaff = await isStaffUser(authSupabase, user)
    if (!isStaff) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    const supabase = createServiceClient()

    const { data: existing } = await supabase
      .from('lawyer_members')
      .select('id, full_name')
      .eq('id', memberId)
      .eq('lawyer_id', id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    const { error: deleteError } = await supabase
      .from('lawyer_members')
      .update({
        is_active: false,
        effective_to: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString()
      })
      .eq('id', memberId)

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to delete member' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: `Member "${existing.full_name}" has been removed` })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
