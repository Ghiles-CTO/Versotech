import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

const createIntroducerSchema = z.object({
  legal_name: z.string().min(2, 'Legal name must be at least 2 characters'),
  type: z.enum(['individual', 'entity']).default('individual'),
  status: z.enum(['active', 'pending', 'inactive', 'suspended']).default('active'),
  contact_name: z.string().optional(),
  contact_email: z.string().email().optional().or(z.literal('')),
  contact_phone: z.string().optional(),
  default_commission_bps: z.number().optional(),
  commission_cap_amount: z.number().optional(),
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
    const validatedData = createIntroducerSchema.parse(body)

    // Clean up empty strings
    const cleanedData = Object.fromEntries(
      Object.entries(validatedData).map(([key, value]) => [
        key,
        value === '' ? null : value
      ])
    )

    // Create the introducer
    const { data: introducer, error: introducerError } = await supabase
      .from('introducers')
      .insert({
        ...cleanedData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (introducerError) {
      console.error('Introducer creation error:', introducerError)
      return NextResponse.json({ error: 'Failed to create introducer' }, { status: 500 })
    }

    // Log the action
    await supabase.from('audit_logs').insert({
      event_type: 'entity_management',
      actor_id: user.id,
      action: 'introducer_created',
      entity_type: 'introducer',
      entity_id: introducer.id,
      action_details: {
        legal_name: introducer.legal_name,
        type: introducer.type,
      },
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      id: introducer.id,
      message: 'Introducer created successfully',
    })
  } catch (error) {
    console.error('Introducer creation error:', error)
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
    const search = searchParams.get('search')

    // Build query
    let query = supabase
      .from('introducers')
      .select(`
        *,
        introducer_users (
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
      .order('legal_name', { ascending: true })

    if (status) {
      query = query.eq('status', status)
    }
    // Add search filter - search in legal_name, contact_name, or contact_email
    if (search) {
      query = query.or(`legal_name.ilike.%${search}%,contact_name.ilike.%${search}%,contact_email.ilike.%${search}%`)
    }

    const { data: introducers, error } = await query

    if (error) {
      console.error('Introducers fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch introducers' }, { status: 500 })
    }

    return NextResponse.json({ introducers })
  } catch (error) {
    console.error('Introducers fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
