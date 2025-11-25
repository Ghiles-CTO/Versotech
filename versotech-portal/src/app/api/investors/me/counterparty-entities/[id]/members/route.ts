import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const memberSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  role: z.enum(['director', 'shareholder', 'beneficial_owner', 'trustee', 'beneficiary', 'managing_member', 'general_partner', 'limited_partner', 'authorized_signatory', 'other']),
  role_title: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  residential_street: z.string().optional().nullable(),
  residential_city: z.string().optional().nullable(),
  residential_state: z.string().optional().nullable(),
  residential_postal_code: z.string().optional().nullable(),
  residential_country: z.string().optional().nullable(),
  nationality: z.string().optional().nullable(),
  id_type: z.enum(['passport', 'national_id', 'drivers_license', 'other']).optional().nullable(),
  id_number: z.string().optional().nullable(),
  id_expiry_date: z.string().optional().nullable(),
  ownership_percentage: z.number().min(0).max(100).optional().nullable(),
  is_beneficial_owner: z.boolean().optional(),
  effective_from: z.string().optional().nullable(),
})

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/investors/me/counterparty-entities/[id]/members
 * Fetch all members of a counterparty entity
 */
export async function GET(request: Request, { params }: RouteParams) {
  const { id: entityId } = await params
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get investor IDs for this user
    const { data: investorLinks } = await serviceSupabase
      .from('investor_users')
      .select('investor_id')
      .eq('user_id', user.id)

    if (!investorLinks || investorLinks.length === 0) {
      return NextResponse.json({ error: 'No investor profile found' }, { status: 404 })
    }

    const investorIds = investorLinks.map(link => link.investor_id)

    // Verify counterparty entity belongs to user's investor
    const { data: entity } = await serviceSupabase
      .from('investor_counterparty')
      .select('id, legal_name')
      .eq('id', entityId)
      .in('investor_id', investorIds)
      .eq('is_active', true)
      .single()

    if (!entity) {
      return NextResponse.json({ error: 'Entity not found' }, { status: 404 })
    }

    // Fetch members
    const { data: members, error: membersError } = await serviceSupabase
      .from('counterparty_entity_members')
      .select('*')
      .eq('counterparty_entity_id', entityId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (membersError) {
      console.error('Error fetching members:', membersError)
      return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
    }

    return NextResponse.json({
      members: members || [],
      entity: entity
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/investors/me/counterparty-entities/[id]/members
 * Add a new member to a counterparty entity
 */
export async function POST(request: Request, { params }: RouteParams) {
  const { id: entityId } = await params
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get investor IDs for this user
    const { data: investorLinks } = await serviceSupabase
      .from('investor_users')
      .select('investor_id')
      .eq('user_id', user.id)

    if (!investorLinks || investorLinks.length === 0) {
      return NextResponse.json({ error: 'No investor profile found' }, { status: 404 })
    }

    const investorIds = investorLinks.map(link => link.investor_id)

    // Verify counterparty entity belongs to user's investor
    const { data: entity } = await serviceSupabase
      .from('investor_counterparty')
      .select('id')
      .eq('id', entityId)
      .in('investor_id', investorIds)
      .eq('is_active', true)
      .single()

    if (!entity) {
      return NextResponse.json({ error: 'Entity not found' }, { status: 404 })
    }

    // Parse and validate request body
    const body = await request.json()
    const parsed = memberSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const memberData = parsed.data

    // Create new member
    const { data: newMember, error: insertError } = await serviceSupabase
      .from('counterparty_entity_members')
      .insert({
        counterparty_entity_id: entityId,
        full_name: memberData.full_name,
        role: memberData.role,
        role_title: memberData.role_title,
        email: memberData.email,
        phone: memberData.phone,
        residential_street: memberData.residential_street,
        residential_city: memberData.residential_city,
        residential_state: memberData.residential_state,
        residential_postal_code: memberData.residential_postal_code,
        residential_country: memberData.residential_country,
        nationality: memberData.nationality,
        id_type: memberData.id_type,
        id_number: memberData.id_number,
        id_expiry_date: memberData.id_expiry_date,
        ownership_percentage: memberData.ownership_percentage,
        is_beneficial_owner: memberData.is_beneficial_owner || false,
        effective_from: memberData.effective_from || new Date().toISOString().split('T')[0],
        created_by: user.id,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating member:', insertError)
      return NextResponse.json(
        { error: 'Failed to create member' },
        { status: 500 }
      )
    }

    return NextResponse.json({ member: newMember }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
