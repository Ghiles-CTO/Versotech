import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

const updateLawyerSchema = z.object({
  firm_name: z.string().min(2, 'Firm name must be at least 2 characters').optional(),
  display_name: z.string().optional(),
  type: z.enum(['entity', 'individual']).optional(),
  legal_entity_type: z.string().optional().nullable(),
  registration_number: z.string().optional().nullable(),
  tax_id: z.string().optional().nullable(),
  primary_contact_name: z.string().optional().nullable(),
  primary_contact_email: z.string().email().optional().or(z.literal('')).nullable(),
  primary_contact_phone: z.string().optional().nullable(),
  email: z.string().email().optional().or(z.literal('')).nullable(),
  street_address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state_province: z.string().optional().nullable(),
  postal_code: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  specializations: z.array(z.string()).optional().nullable(),
  is_active: z.boolean().optional(),
  kyc_status: z.string().optional().nullable(),
  kyc_notes: z.string().optional().nullable(),
  kyc_approved_at: z.string().optional().nullable(),
  kyc_expires_at: z.string().optional().nullable(),

  // Individual KYC fields
  first_name: z.string().max(100).nullable().optional(),
  middle_name: z.string().max(100).nullable().optional(),
  last_name: z.string().max(100).nullable().optional(),
  name_suffix: z.string().max(20).nullable().optional(),
  date_of_birth: z.string().nullable().optional(),
  country_of_birth: z.string().max(2).nullable().optional(),
  nationality: z.string().max(2).nullable().optional(),

  // Phone fields
  phone_mobile: z.string().max(30).nullable().optional(),
  phone_office: z.string().max(30).nullable().optional(),

  // US Tax compliance
  is_us_citizen: z.boolean().nullable().optional(),
  is_us_taxpayer: z.boolean().nullable().optional(),
  us_taxpayer_id: z.string().max(20).nullable().optional(),
  country_of_tax_residency: z.string().max(2).nullable().optional(),

  // ID Document
  id_type: z.string().nullable().optional(),
  id_number: z.string().max(50).nullable().optional(),
  id_issue_date: z.string().nullable().optional(),
  id_expiry_date: z.string().nullable().optional(),
  id_issuing_country: z.string().max(2).nullable().optional(),

  // Residential Address
  residential_street: z.string().max(255).nullable().optional(),
  residential_line_2: z.string().max(255).nullable().optional(),
  residential_city: z.string().max(100).nullable().optional(),
  residential_state: z.string().max(100).nullable().optional(),
  residential_postal_code: z.string().max(20).nullable().optional(),
  residential_country: z.string().max(2).nullable().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const authSupabase = await createClient()
    const { data: { user } } = await authSupabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceClient()

    // Check permissions
    const { data: permissions } = await supabase
      .from('staff_permissions')
      .select('permission')
      .eq('user_id', user.id)
      .in('permission', ['super_admin', 'manage_investors', 'view_investors'])

    if (!permissions || permissions.length === 0) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { data: lawyer, error } = await supabase
      .from('lawyers')
      .select(`
        *,
        lawyer_users (
          user_id,
          role,
          is_primary,
          can_sign,
          created_at,
          profiles:user_id (
            id,
            email,
            display_name,
            title
          )
        )
      `)
      .eq('id', id)
      .single()

    if (error || !lawyer) {
      console.error('[Lawyers API] GET single error:', error)
      return NextResponse.json({ error: 'Lawyer not found' }, { status: 404 })
    }

    return NextResponse.json({ lawyer })
  } catch (error) {
    console.error('[Lawyers API] GET single error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const authSupabase = await createClient()
    const { data: { user } } = await authSupabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceClient()

    // Check permissions
    const { data: permissions } = await supabase
      .from('staff_permissions')
      .select('permission')
      .eq('user_id', user.id)
      .in('permission', ['super_admin', 'manage_investors'])

    if (!permissions || permissions.length === 0) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Verify lawyer exists
    const { data: existingLawyer } = await supabase
      .from('lawyers')
      .select('id, firm_name')
      .eq('id', id)
      .single()

    if (!existingLawyer) {
      return NextResponse.json({ error: 'Lawyer not found' }, { status: 404 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = updateLawyerSchema.parse(body)

    // Clean up empty strings
    const cleanedData = Object.fromEntries(
      Object.entries(validatedData).map(([key, value]) => [
        key,
        value === '' ? null : value
      ])
    )

    // Handle KYC status changes
    if (cleanedData.kyc_status === 'approved' && !cleanedData.kyc_approved_at) {
      cleanedData.kyc_approved_at = new Date().toISOString()
      cleanedData.kyc_approved_by = user.id
      // Set expiry to 1 year from now
      const expiryDate = new Date()
      expiryDate.setFullYear(expiryDate.getFullYear() + 1)
      cleanedData.kyc_expires_at = expiryDate.toISOString()
    }

    // Update the lawyer
    const { data: lawyer, error: updateError } = await supabase
      .from('lawyers')
      .update({
        ...cleanedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('[Lawyers API] Update error:', updateError)
      return NextResponse.json({ error: 'Failed to update lawyer' }, { status: 500 })
    }

    // Log the action
    await supabase.from('audit_logs').insert({
      event_type: 'entity_management',
      actor_id: user.id,
      action: 'lawyer_updated',
      entity_type: 'lawyer',
      entity_id: lawyer.id,
      action_details: {
        firm_name: lawyer.firm_name,
        changes: Object.keys(cleanedData),
      },
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      lawyer,
      message: 'Lawyer updated successfully',
    })
  } catch (error) {
    console.error('[Lawyers API] PATCH error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const authSupabase = await createClient()
    const { data: { user } } = await authSupabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceClient()

    // Check permissions - only super_admin can delete
    const { data: permissions } = await supabase
      .from('staff_permissions')
      .select('permission')
      .eq('user_id', user.id)
      .eq('permission', 'super_admin')

    if (!permissions || permissions.length === 0) {
      return NextResponse.json({ error: 'Only super admins can delete lawyers' }, { status: 403 })
    }

    // Verify lawyer exists
    const { data: existingLawyer } = await supabase
      .from('lawyers')
      .select('id, firm_name')
      .eq('id', id)
      .single()

    if (!existingLawyer) {
      return NextResponse.json({ error: 'Lawyer not found' }, { status: 404 })
    }

    // Soft delete by setting is_active to false
    const { error: deleteError } = await supabase
      .from('lawyers')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (deleteError) {
      console.error('[Lawyers API] Delete error:', deleteError)
      return NextResponse.json({ error: 'Failed to delete lawyer' }, { status: 500 })
    }

    // Log the action
    await supabase.from('audit_logs').insert({
      event_type: 'entity_management',
      actor_id: user.id,
      action: 'lawyer_deleted',
      entity_type: 'lawyer',
      entity_id: id,
      action_details: {
        firm_name: existingLawyer.firm_name,
        soft_delete: true,
      },
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'Lawyer deleted successfully',
    })
  } catch (error) {
    console.error('[Lawyers API] DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
