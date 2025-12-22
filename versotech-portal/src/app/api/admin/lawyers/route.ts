import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

const createLawyerSchema = z.object({
  firm_name: z.string().min(2, 'Firm name must be at least 2 characters'),
  display_name: z.string().optional(),
  legal_entity_type: z.string().optional(),
  registration_number: z.string().optional().nullable(),
  tax_id: z.string().optional().nullable(),
  primary_contact_name: z.string().optional().nullable(),
  primary_contact_email: z.string().email().optional().or(z.literal('')).nullable(),
  primary_contact_phone: z.string().optional().nullable(),
  street_address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state_province: z.string().optional().nullable(),
  postal_code: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  specializations: z.array(z.string()).optional().nullable(),
  is_active: z.boolean().default(true),
  kyc_status: z.string().optional().default('draft'),
})

export async function POST(request: NextRequest) {
  try {
    // Use regular client for authentication
    const authSupabase = await createClient()
    const { data: { user } } = await authSupabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use service client for admin operations
    const supabase = createServiceClient()

    // Check if user has super_admin or manage_investors permission
    const { data: permissions } = await supabase
      .from('staff_permissions')
      .select('permission')
      .eq('user_id', user.id)
      .in('permission', ['super_admin', 'manage_investors'])

    if (!permissions || permissions.length === 0) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = createLawyerSchema.parse(body)

    // Clean up empty strings
    const cleanedData = Object.fromEntries(
      Object.entries(validatedData).map(([key, value]) => [
        key,
        value === '' ? null : value
      ])
    )

    // Set display_name to firm_name if not provided
    if (!cleanedData.display_name) {
      cleanedData.display_name = cleanedData.firm_name
    }

    // Create the lawyer/law firm
    const { data: lawyer, error: lawyerError } = await supabase
      .from('lawyers')
      .insert({
        ...cleanedData,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (lawyerError) {
      console.error('Lawyer creation error:', lawyerError)
      return NextResponse.json({ error: 'Failed to create law firm' }, { status: 500 })
    }

    // Log the action
    await supabase.from('audit_logs').insert({
      event_type: 'entity_management',
      actor_id: user.id,
      action: 'lawyer_created',
      entity_type: 'lawyer',
      entity_id: lawyer.id,
      action_details: {
        firm_name: lawyer.firm_name,
        display_name: lawyer.display_name,
        specializations: lawyer.specializations,
      },
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      id: lawyer.id,
      message: 'Law firm created successfully',
    })
  } catch (error) {
    console.error('Lawyer creation error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
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

    // Get query params
    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('is_active')

    // Build query
    let query = supabase
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
      .order('firm_name', { ascending: true })

    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true')
    }

    const { data: lawyers, error } = await query

    if (error) {
      console.error('Lawyers fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch law firms' }, { status: 500 })
    }

    return NextResponse.json({ lawyers })
  } catch (error) {
    console.error('Lawyers fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
