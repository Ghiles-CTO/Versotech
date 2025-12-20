import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const memberSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  role: z.enum(['director', 'shareholder', 'beneficial_owner', 'authorized_signatory', 'officer', 'partner', 'other']),
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

/**
 * GET /api/investors/me/members
 * Fetch all members of the current investor entity
 */
export async function GET(request: Request) {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get investor IDs for this user
    const { data: investorLinks, error: linksError } = await serviceSupabase
      .from('investor_users')
      .select('investor_id')
      .eq('user_id', user.id)

    if (linksError || !investorLinks || investorLinks.length === 0) {
      return NextResponse.json({ error: 'No investor profile found' }, { status: 404 })
    }

    const investorIds = investorLinks.map(link => link.investor_id)

    // Check if any of the linked investors is an entity type
    const { data: investors, error: investorsError } = await serviceSupabase
      .from('investors')
      .select('id, type, display_name')
      .in('id', investorIds)
      .in('type', ['entity', 'institutional'])

    if (investorsError) {
      console.error('Error fetching investors:', investorsError)
      return NextResponse.json({ error: 'Failed to fetch investor info' }, { status: 500 })
    }

    if (!investors || investors.length === 0) {
      return NextResponse.json({
        members: [],
        message: 'Not an entity-type investor'
      })
    }

    // Get members for entity-type investors
    const entityInvestorIds = investors.map(i => i.id)
    const { data: members, error: membersError } = await serviceSupabase
      .from('investor_members')
      .select('*')
      .in('investor_id', entityInvestorIds)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (membersError) {
      console.error('Error fetching members:', membersError)
      return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
    }

    return NextResponse.json({
      members: members || [],
      investors: investors
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/investors/me/members:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/investors/me/members
 * Add a new member to the investor entity
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get primary investor ID for this user
    const { data: investorLinks, error: linksError } = await serviceSupabase
      .from('investor_users')
      .select('investor_id')
      .eq('user_id', user.id)
      .limit(1)

    if (linksError || !investorLinks || investorLinks.length === 0) {
      return NextResponse.json({ error: 'No investor profile found' }, { status: 404 })
    }

    const investorId = investorLinks[0].investor_id

    // Verify investor is entity type
    const { data: investor, error: investorError } = await serviceSupabase
      .from('investors')
      .select('id, type')
      .eq('id', investorId)
      .single()

    if (investorError || !investor) {
      return NextResponse.json({ error: 'Investor not found' }, { status: 404 })
    }

    if (!['entity', 'institutional'].includes(investor.type || '')) {
      return NextResponse.json({
        error: 'Members can only be added to entity-type investors'
      }, { status: 400 })
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
      .from('investor_members')
      .insert({
        investor_id: investorId,
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
    console.error('Unexpected error in POST /api/investors/me/members:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
