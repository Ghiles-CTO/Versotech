import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

const createPartnerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  legal_name: z.string().optional(),
  type: z.enum(['entity', 'individual']),
  partner_type: z.enum(['co-investor', 'syndicate-lead', 'family-office', 'other']),
  status: z.enum(['active', 'pending', 'inactive']).default('active'),
  accreditation_status: z.string().optional(),
  contact_name: z.string().optional(),
  contact_email: z.string().email().optional().or(z.literal('')),
  contact_phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  address_line_1: z.string().optional(),
  address_line_2: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
  typical_investment_min: z.number().optional(),
  typical_investment_max: z.number().optional(),
  preferred_sectors: z.array(z.string()).optional(),
  preferred_geographies: z.array(z.string()).optional(),
  notes: z.string().optional(),
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
    const validatedData = createPartnerSchema.parse(body)

    // Clean up empty strings
    const cleanedData = Object.fromEntries(
      Object.entries(validatedData).map(([key, value]) => [
        key,
        value === '' ? null : value
      ])
    )

    // Create the partner
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .insert({
        ...cleanedData,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (partnerError) {
      console.error('Partner creation error:', partnerError)
      return NextResponse.json({ error: 'Failed to create partner' }, { status: 500 })
    }

    // Log the action
    await supabase.from('audit_logs').insert({
      event_type: 'entity_management',
      actor_id: user.id,
      action: 'partner_created',
      entity_type: 'partner',
      entity_id: partner.id,
      action_details: {
        name: partner.name,
        type: partner.type,
        partner_type: partner.partner_type,
      },
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      id: partner.id,
      message: 'Partner created successfully',
    })
  } catch (error) {
    console.error('Partner creation error:', error)
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
    const status = searchParams.get('status')
    const partnerType = searchParams.get('partner_type')

    // Build query
    let query = supabase
      .from('partners')
      .select(`
        *,
        partner_users (
          user_id,
          role,
          is_primary,
          created_at,
          profiles:user_id (
            id,
            email,
            display_name,
            title
          )
        )
      `)
      .order('name', { ascending: true })

    if (status) {
      query = query.eq('status', status)
    }
    if (partnerType) {
      query = query.eq('partner_type', partnerType)
    }

    const { data: partners, error } = await query

    if (error) {
      console.error('Partners fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch partners' }, { status: 500 })
    }

    return NextResponse.json({ partners })
  } catch (error) {
    console.error('Partners fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
