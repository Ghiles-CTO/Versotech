import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

const createCommercialPartnerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  legal_name: z.string().optional(),
  type: z.enum(['entity', 'individual', 'institutional']),
  cp_type: z.enum(['placement_agent', 'distributor', 'wealth_manager', 'family_office', 'bank', 'other']),
  status: z.enum(['active', 'inactive', 'suspended']).default('active'),
  regulatory_status: z.string().optional(),
  regulatory_number: z.string().optional(),
  jurisdiction: z.string().optional(),
  contact_name: z.string().optional(),
  contact_email: z.string().email().optional().or(z.literal('')),
  contact_phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  address_line_1: z.string().optional(),
  address_line_2: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
  payment_terms: z.string().optional(),
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
    const validatedData = createCommercialPartnerSchema.parse(body)

    // Clean up empty strings
    const cleanedData = Object.fromEntries(
      Object.entries(validatedData).map(([key, value]) => [
        key,
        value === '' ? null : value
      ])
    )

    // Create the commercial partner
    const { data: partner, error: partnerError } = await supabase
      .from('commercial_partners')
      .insert({
        ...cleanedData,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (partnerError) {
      console.error('Commercial partner creation error:', partnerError)
      return NextResponse.json({ error: 'Failed to create commercial partner' }, { status: 500 })
    }

    // Log the action
    await supabase.from('audit_logs').insert({
      event_type: 'entity_management',
      actor_id: user.id,
      action: 'commercial_partner_created',
      entity_type: 'commercial_partner',
      entity_id: partner.id,
      action_details: {
        name: partner.name,
        type: partner.type,
        cp_type: partner.cp_type,
      },
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      id: partner.id,
      message: 'Commercial partner created successfully',
    })
  } catch (error) {
    console.error('Commercial partner creation error:', error)
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
    const cpType = searchParams.get('cp_type')
    const search = searchParams.get('search')

    // Build query
    let query = supabase
      .from('commercial_partners')
      .select(`
        *,
        commercial_partner_users (
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
    if (cpType) {
      query = query.eq('cp_type', cpType)
    }
    // Add search filter - search in name, legal_name, or contact_email
    if (search) {
      query = query.or(`name.ilike.%${search}%,legal_name.ilike.%${search}%,contact_email.ilike.%${search}%`)
    }

    const { data: partners, error } = await query

    if (error) {
      console.error('Commercial partners fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch commercial partners' }, { status: 500 })
    }

    return NextResponse.json({ partners })
  } catch (error) {
    console.error('Commercial partners fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
