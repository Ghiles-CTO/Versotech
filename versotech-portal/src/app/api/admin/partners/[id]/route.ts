import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

const updatePartnerSchema = z.object({
  name: z.string().min(2).optional(),
  legal_name: z.string().nullable().optional(),
  type: z.enum(['entity', 'individual']).optional(),
  partner_type: z.enum(['co-investor', 'syndicate-lead', 'family-office', 'other']).optional(),
  status: z.enum(['active', 'pending', 'inactive']).optional(),
  accreditation_status: z.string().nullable().optional(),
  contact_name: z.string().nullable().optional(),
  contact_email: z.string().email().nullable().optional().or(z.literal('')),
  contact_phone: z.string().nullable().optional(),
  website: z.string().url().nullable().optional().or(z.literal('')),
  address_line_1: z.string().nullable().optional(),
  address_line_2: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  postal_code: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  typical_investment_min: z.number().nullable().optional(),
  typical_investment_max: z.number().nullable().optional(),
  preferred_sectors: z.array(z.string()).nullable().optional(),
  preferred_geographies: z.array(z.string()).nullable().optional(),
  notes: z.string().nullable().optional(),
  kyc_status: z.string().nullable().optional(),
  kyc_notes: z.string().nullable().optional(),
  logo_url: z.string().url().nullable().optional().or(z.literal('')),

  // Individual KYC fields
  first_name: z.string().max(100).nullable().optional(),
  middle_name: z.string().max(100).nullable().optional(),
  middle_initial: z.string().max(5).nullable().optional(),
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

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
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

    // Fetch partner
    const { data: partner, error } = await supabase
      .from('partners')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
    }

    // Fetch linked users
    const { data: partnerUsers } = await supabase
      .from('partner_users')
      .select(`
        user_id,
        role,
        is_primary,
        can_sign,
        created_at
      `)
      .eq('partner_id', id)

    return NextResponse.json({ partner, partnerUsers: partnerUsers || [] })
  } catch (error) {
    console.error('Partner fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
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

    // Check partner exists
    const { data: existingPartner, error: fetchError } = await supabase
      .from('partners')
      .select('id, kyc_status')
      .eq('id', id)
      .single()

    if (fetchError || !existingPartner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = updatePartnerSchema.parse(body)

    // Clean up empty strings
    const cleanedData = Object.fromEntries(
      Object.entries(validatedData).map(([key, value]) => [
        key,
        value === '' ? null : value
      ])
    ) as Record<string, unknown>

    // Handle KYC status changes
    if (cleanedData.kyc_status && cleanedData.kyc_status !== existingPartner.kyc_status) {
      if (cleanedData.kyc_status === 'approved') {
        cleanedData.kyc_approved_at = new Date().toISOString()
        // Set expiry to 1 year from now
        const expiryDate = new Date()
        expiryDate.setFullYear(expiryDate.getFullYear() + 1)
        cleanedData.kyc_expires_at = expiryDate.toISOString()
      }
    }

    // Update partner
    const { data: partner, error: updateError } = await supabase
      .from('partners')
      .update({
        ...cleanedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Partner update error:', updateError)
      return NextResponse.json({ error: 'Failed to update partner' }, { status: 500 })
    }

    // Log the action
    await supabase.from('audit_logs').insert({
      event_type: 'entity_management',
      actor_id: user.id,
      action: 'partner_updated',
      entity_type: 'partner',
      entity_id: id,
      action_details: {
        updated_fields: Object.keys(cleanedData),
      },
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      partner,
      message: 'Partner updated successfully',
    })
  } catch (error) {
    console.error('Partner update error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
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
      return NextResponse.json({ error: 'Only super admins can delete partners' }, { status: 403 })
    }

    // Check partner exists
    const { data: existingPartner, error: fetchError } = await supabase
      .from('partners')
      .select('id, name')
      .eq('id', id)
      .single()

    if (fetchError || !existingPartner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
    }

    // Soft delete - set status to inactive
    const { error: updateError } = await supabase
      .from('partners')
      .update({
        status: 'inactive',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) {
      console.error('Partner delete error:', updateError)
      return NextResponse.json({ error: 'Failed to delete partner' }, { status: 500 })
    }

    // Log the action
    await supabase.from('audit_logs').insert({
      event_type: 'entity_management',
      actor_id: user.id,
      action: 'partner_deleted',
      entity_type: 'partner',
      entity_id: id,
      action_details: {
        name: existingPartner.name,
      },
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'Partner deleted successfully',
    })
  } catch (error) {
    console.error('Partner delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
